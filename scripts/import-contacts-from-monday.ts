import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

const MONDAY_API_URL = 'https://api.monday.com/v2';
const API_KEY = process.env.MONDAY_API_KEY!;

function getColumnValue(columnValues: any[], columnId: string): string | null {
  const col = columnValues.find((c: any) => c.id === columnId);
  return col?.text || null;
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
  
  if (data.errors) {
    console.error('❌ Monday API Error:', JSON.stringify(data.errors, null, 2));
    throw new Error('Monday API Error');
  }
  
  return data;
}

async function importContacts() {
  console.log('\n📊 מייבא אנשי קשר מ-Monday...');

  const query = `
    query {
      boards(ids: [5063084084]) {
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
          }
        }
      }
    }
  `;

  const data = await queryMonday(query);
  
  if (!data.data || !data.data.boards || data.data.boards.length === 0) {
    console.error('❌ לא מצאתי את הבורד אנשי קשר!');
    return { imported: 0, errors: 0 };
  }

  const board = data.data.boards[0];
  console.log(`✅ מצאתי בורד: ${board.name}`);
  console.log(`📊 מספר רשומות: ${board.items_page.items.length}`);

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  let imported = 0;
  let errors = 0;
  let skipped = 0;

  try {
    // Clear existing contacts
    console.log('\n🗑️  מנקה אנשי קשר קיימים...');
    await db.delete(schema.contacts);
    console.log('✅ אנשי קשר קיימים נמחקו');

    for (const item of board.items_page.items) {
      try {
        const name = item.name || '';
        
        // Skip empty names
        if (!name.trim()) {
          skipped++;
          continue;
        }

        const record = {
          name: name,
          phone: getColumnValue(item.column_values, 'phone__1'),
          email: getColumnValue(item.column_values, 'email__1'),
          position: getColumnValue(item.column_values, 'text__1'),
          notes: getColumnValue(item.column_values, 'long_text__1'),
          // Extract company from board_relation if exists
          company: null, // We'll handle this separately if needed
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(schema.contacts).values(record);
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`📝 ייבאתי ${imported} אנשי קשר...`);
        }
      } catch (error) {
        console.error(`❌ שגיאה בייבוא ${item.name}:`, error);
        errors++;
      }
    }

    console.log(`\n✅ סיימתי לייבא אנשי קשר!`);
    console.log(`📊 סטטיסטיקות:`);
    console.log(`   - ייובאו בהצלחה: ${imported}`);
    console.log(`   - דולגו (שם ריק): ${skipped}`);
    console.log(`   - שגיאות: ${errors}`);

    await connection.end();
    return { imported, errors, skipped };
  } catch (error) {
    console.error('❌ שגיאה כללית:', error);
    await connection.end();
    throw error;
  }
}

// Run import
importContacts()
  .then((result) => {
    console.log('\n🎉 הייבוא הושלם בהצלחה!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 הייבוא נכשל:', error);
    process.exit(1);
  });

