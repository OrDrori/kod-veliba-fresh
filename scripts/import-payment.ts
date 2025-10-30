import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

const MONDAY_API_URL = 'https://api.monday.com/v2';
const API_KEY = process.env.MONDAY_API_KEY!;

function getColumnValue(columnValues: any[], columnId: string): string | null {
  const col = columnValues.find((c: any) => c.id === columnId);
  return col?.text || null;
}

function getColumnNumber(columnValues: any[], columnId: string): number | null {
  const text = getColumnValue(columnValues, columnId);
  if (!text) return null;
  const num = parseFloat(text);
  return isNaN(num) ? null : num;
}

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

async function importPayment() {
  console.log('\n📊 מייבא Payment Collection...\n');

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
              type
            }
            subitems {
              id
              name
              column_values {
                id
                text
                value
                type
              }
            }
          }
        }
      }
    }
  `;

  const data = await queryMonday(query);
  
  if (!data.data || !data.data.boards || data.data.boards.length === 0) {
    console.error('❌ לא מצאתי את הבורד Payment Collection!');
    console.log('Response:', JSON.stringify(data, null, 2));
    return;
  }

  const board = data.data.boards[0];
  console.log(`✅ מצאתי בורד: ${board.name}`);
  console.log(`📊 מספר רשומות: ${board.items_page.items.length}\n`);

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  let imported = 0;
  let errors = 0;

  try {
    console.log('🗑️  מוחק נתונים קיימים ב-Payment Collection...');
    await db.delete(schema.paymentCollection);
    console.log('✅ נתונים קיימים נמחקו!\n');

    for (const item of board.items_page.items) {
      try {
        const payment = {
          item: item.name || '',
          subitem: null,
          amount: getColumnNumber(item.column_values, 'numbers__1'),
          targetDate: getColumnValue(item.column_values, 'date'),
          paymentDate: getColumnValue(item.column_values, 'date4'),
          dateDiff: null,
          collectionStatus: 'pending',
          paymentStatus: 'not_paid',
          notes: getColumnValue(item.column_values, 'long_text8__1'),
          currency: 'ILS',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(schema.paymentCollection).values(payment);
        imported++;

        // Import subitems
        if (item.subitems && item.subitems.length > 0) {
          for (const subitem of item.subitems) {
            try {
              const subPayment = {
                item: subitem.name || '',
                subitem: item.name,
                amount: getColumnNumber(subitem.column_values, 'numbers__1'),
                targetDate: getColumnValue(subitem.column_values, 'date'),
                paymentDate: getColumnValue(subitem.column_values, 'date4'),
                dateDiff: null,
                collectionStatus: 'pending',
                paymentStatus: 'not_paid',
                notes: getColumnValue(subitem.column_values, 'long_text8__1'),
                currency: 'ILS',
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              await db.insert(schema.paymentCollection).values(subPayment);
              imported++;
            } catch (error: any) {
              errors++;
              if (errors <= 3) {
                console.error(`❌ שגיאה ב-subitem ${subitem.name}:`, error.message);
              }
            }
          }
        }

        if (imported % 100 === 0) {
          console.log(`✅ ייובאו ${imported} רשומות...`);
        }

      } catch (error: any) {
        errors++;
        if (errors <= 3) {
          console.error(`❌ שגיאה ברשומה ${item.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Payment Collection הושלם!`);
    console.log(`📊 ייובאו: ${imported} רשומות`);
    if (errors > 0) {
      console.log(`❌ שגיאות: ${errors} רשומות`);
    }

  } catch (error) {
    console.error('❌ שגיאה כללית:', error);
  } finally {
    await connection.end();
  }
}

importPayment();

