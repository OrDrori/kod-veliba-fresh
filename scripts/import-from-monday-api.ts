import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';
// Node 22 has built-in fetch

const MONDAY_API_URL = 'https://api.monday.com/v2';
const API_KEY = process.env.MONDAY_API_KEY!;

async function queryMonday(query: string) {
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': API_KEY,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  return data;
}

async function importPaymentCollection() {
  console.log('💸 מייבא Payment Collection מ-Monday.com...\n');

  // שאילתה לקבלת הבורד
  const query = `
    query {
      boards(ids: [5063084636]) {
        id
        name
        items_page(limit: 500) {
          cursor
          items {
            id
            name
            column_values {
              id
              text
              value
            }
            subitems {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    }
  `;

  const data = await queryMonday(query);
  
  if (!data.data || !data.data.boards || data.data.boards.length === 0) {
    console.error('❌ לא מצאתי את הבורד!');
    console.log('Response:', JSON.stringify(data, null, 2));
    return;
  }

  const board = data.data.boards[0];
  console.log(`✅ מצאתי בורד: ${board.name}`);
  console.log(`📊 מספר רשומות: ${board.items_page.items.length}\n`);

  // יצירת חיבור
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    let imported = 0;
    let errors = 0;

    for (const item of board.items_page.items) {
      try {
        // מיפוי העמודות
        const columnValues: any = {};
        for (const cv of item.column_values) {
          columnValues[cv.id] = cv;
        }

        // יצירת רשומה
        const payment = {
          item: item.name || '',
          subitem: null,
          amount: parseFloat(columnValues.numbers?.text) || null,
          targetDate: columnValues.date?.text || null,
          paymentDate: columnValues.date4?.text || null,
          dateDiff: null,
          collectionStatus: columnValues.status?.text || null,
          paymentStatus: columnValues.status_1?.text || null,
          documents: columnValues.files?.text || null,
          link: columnValues.link?.text || null,
          notes: columnValues.long_text?.text || null,
          tags: columnValues.tags?.text || null,
          account: columnValues.text_1?.text || null,
          email: columnValues.email?.text || null,
          phone: columnValues.phone?.text || null,
          contacts: columnValues.connect_boards?.text || null,
          website: columnValues.link_1?.text || null,
          currency: columnValues.dropdown?.text || 'ILS',
          amountILS: parseFloat(columnValues.numbers_1?.text) || null,
          automation: columnValues.long_text_1?.text || null,
          createdBy: columnValues.person?.text || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(schema.paymentCollection).values(payment);
        imported++;

        // ייבוא Subitems
        if (item.subitems && item.subitems.length > 0) {
          for (const subitem of item.subitems) {
            const subColumnValues: any = {};
            for (const cv of subitem.column_values) {
              subColumnValues[cv.id] = cv;
            }

            const subPayment = {
              item: subitem.name || '',
              subitem: item.name, // Parent item
              amount: parseFloat(subColumnValues.numbers?.text) || null,
              targetDate: subColumnValues.date?.text || null,
              paymentDate: subColumnValues.date4?.text || null,
              dateDiff: null,
              collectionStatus: subColumnValues.status?.text || null,
              paymentStatus: subColumnValues.status_1?.text || null,
              documents: subColumnValues.files?.text || null,
              link: subColumnValues.link?.text || null,
              notes: subColumnValues.long_text?.text || null,
              tags: subColumnValues.tags?.text || null,
              account: subColumnValues.text_1?.text || null,
              email: subColumnValues.email?.text || null,
              phone: subColumnValues.phone?.text || null,
              contacts: subColumnValues.connect_boards?.text || null,
              website: subColumnValues.link_1?.text || null,
              currency: subColumnValues.dropdown?.text || 'ILS',
              amountILS: parseFloat(subColumnValues.numbers_1?.text) || null,
              automation: subColumnValues.long_text_1?.text || null,
              createdBy: subColumnValues.person?.text || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            await db.insert(schema.paymentCollection).values(subPayment);
            imported++;
          }
        }

        if (imported % 10 === 0) {
          console.log(`✅ ייובאו ${imported} רשומות...`);
        }

      } catch (error: any) {
        errors++;
        console.error(`❌ שגיאה ברשומה ${item.name}:`, error.message);
      }
    }

    console.log(`\n✅ סיימתי!`);
    console.log(`📊 ייובאו: ${imported} רשומות`);
    console.log(`❌ שגיאות: ${errors} רשומות`);

  } catch (error) {
    console.error('❌ שגיאה כללית:', error);
  } finally {
    await connection.end();
  }
}

importPaymentCollection();

