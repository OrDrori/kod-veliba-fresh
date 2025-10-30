import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';
import * as fs from 'fs';

async function importPaymentCollection() {
  console.log('💸 מייבא Payment Collection...\n');

  // קריאת הקובץ
  const data = JSON.parse(fs.readFileSync('/home/ubuntu/monday_full_data.json', 'utf-8'));
  
  // מציאת הבורד Payment Collection
  const paymentBoard = data.data.boards.find((b: any) => 
    b.name === 'Duplicate of Payment Collection 📑' || 
    b.name.includes('Payment Collection')
  );

  if (!paymentBoard) {
    console.error('❌ לא מצאתי את בורד Payment Collection!');
    return;
  }

  console.log(`✅ מצאתי בורד: ${paymentBoard.name}`);
  console.log(`📊 מספר רשומות: ${paymentBoard.items_count}\n`);

  // יצירת חיבור
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    let imported = 0;
    let errors = 0;

    for (const item of paymentBoard.items || []) {
      try {
        // מיפוי העמודות
        const columnValues: any = {};
        for (const cv of item.column_values || []) {
          columnValues[cv.id] = cv;
        }

        // יצירת רשומה
        const payment = {
          itemName: item.name || '',
          subitem: columnValues.text?.text || null,
          amount: parseFloat(columnValues.numbers?.text) || null,
          targetDate: columnValues.date?.text || null,
          paymentDate: columnValues.date4?.text || null,
          dateDiff: null, // יחושב אוטומטית
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

        if (imported % 10 === 0) {
          console.log(`✅ ייובאו ${imported} רשומות...`);
        }

      } catch (error) {
        errors++;
        console.error(`❌ שגיאה ברשומה ${item.name}:`, error);
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

