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

async function importClientTasks() {
  console.log('\n📊 מייבא Client Tasks - משימות לקוחות...\n');

  const query = `
    query {
      boards(ids: [5063083674]) {
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
    console.error('❌ לא מצאתי את הבורד Client Tasks!');
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
    // First, delete existing data
    console.log('🗑️  מוחק נתונים קיימים ב-Client Tasks...');
    await db.delete(schema.clientTasks);
    console.log('✅ נתונים קיימים נמחקו!\n');

    for (const item of board.items_page.items) {
      try {
        const task = {
          taskName: item.name || '',
          clientId: 1, // Default client (will be linked later)
          taskType: 'other',
          status: 'todo',
          priority: 'medium',
          billable: 'yes',
          assignedTo: getColumnValue(item.column_values, 'person'),
          dueDate: getColumnValue(item.column_values, 'date'),
          description: getColumnValue(item.column_values, 'long_text'),
          estimatedHours: getColumnNumber(item.column_values, 'numbers'),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(schema.clientTasks).values(task);
        imported++;

        // Import subitems
        if (item.subitems && item.subitems.length > 0) {
          for (const subitem of item.subitems) {
            try {
              const subTask = {
                taskName: `${item.name} - ${subitem.name}`,
                clientId: 1, // Default client (will be linked later)
                taskType: 'other',
                status: 'todo',
                priority: 'medium',
                billable: 'yes',
                assignedTo: getColumnValue(subitem.column_values, 'person'),
                dueDate: getColumnValue(subitem.column_values, 'date'),
                description: getColumnValue(subitem.column_values, 'long_text'),
                estimatedHours: getColumnNumber(subitem.column_values, 'numbers'),
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              await db.insert(schema.clientTasks).values(subTask);
              imported++;
            } catch (error: any) {
              errors++;
              if (errors <= 3) {
                console.error(`❌ שגיאה ב-subtask ${subitem.name}:`, error.message);
              }
            }
          }
        }

        if (imported % 50 === 0) {
          console.log(`✅ ייובאו ${imported} משימות...`);
        }

      } catch (error: any) {
        errors++;
        if (errors <= 3) {
          console.error(`❌ שגיאה במשימה ${item.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Client Tasks הושלם!`);
    console.log(`📊 ייובאו: ${imported} משימות`);
    if (errors > 0) {
      console.log(`❌ שגיאות: ${errors} משימות`);
    }

  } catch (error) {
    console.error('❌ שגיאה כללית:', error);
  } finally {
    await connection.end();
  }
}

importClientTasks();

