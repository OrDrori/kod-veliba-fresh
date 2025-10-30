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

async function importWebsite() {
  console.log('\n📊 מייבא Website Projects...\n');

  const query = `
    query {
      boards(ids: [5063083167]) {
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
    console.error('❌ לא מצאתי את הבורד Website!');
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
    console.log('🗑️  מוחק נתונים קיימים ב-Website Projects...');
    await db.delete(schema.websiteProjects);
    console.log('✅ נתונים קיימים נמחקו!\n');

    for (const item of board.items_page.items) {
      try {
        const project = {
          projectName: item.name || '',
          clientId: 1,
          status: 'planning',
          url: getColumnValue(item.column_values, 'link'),
          technology: getColumnValue(item.column_values, 'text'),
          notes: getColumnValue(item.column_values, 'long_text'),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(schema.websiteProjects).values(project);
        imported++;

        if (imported % 50 === 0) {
          console.log(`✅ ייובאו ${imported} פרויקטים...`);
        }

      } catch (error: any) {
        errors++;
        if (errors <= 3) {
          console.error(`❌ שגיאה בפרויקט ${item.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Website Projects הושלם!`);
    console.log(`📊 ייובאו: ${imported} פרויקטים`);
    if (errors > 0) {
      console.log(`❌ שגיאות: ${errors} פרויקטים`);
    }

  } catch (error) {
    console.error('❌ שגיאה כללית:', error);
  } finally {
    await connection.end();
  }
}

importWebsite();

