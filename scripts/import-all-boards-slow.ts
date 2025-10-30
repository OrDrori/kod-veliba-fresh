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

async function importBoard(
  boardId: string,
  boardName: string,
  tableName: string,
  deleteFirst: boolean,
  mapper: (item: any, isSubitem: boolean, parentName?: string) => any
) {
  console.log(`\n📊 מייבא ${boardName}...\n`);

  const query = `
    query {
      boards(ids: [${boardId}]) {
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
    console.error(`❌ לא מצאתי את הבורד ${boardName}!`);
    return { imported: 0, errors: 0 };
  }

  const board = data.data.boards[0];
  console.log(`✅ מצאתי בורד: ${board.name}`);
  console.log(`📊 מספר רשומות: ${board.items_page.items.length}\n`);

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  let imported = 0;
  let errors = 0;

  try {
    if (deleteFirst) {
      console.log(`🗑️  מוחק נתונים קיימים ב-${boardName}...`);
      await (db as any).delete((schema as any)[tableName]);
      console.log('✅ נתונים קיימים נמחקו!\n');
    }

    for (const item of board.items_page.items) {
      try {
        const record = mapper(item, false);
        if (record) {
          await (db as any).insert((schema as any)[tableName]).values(record);
          imported++;
        }

        // Import subitems
        if (item.subitems && item.subitems.length > 0) {
          for (const subitem of item.subitems) {
            try {
              const subRecord = mapper(subitem, true, item.name);
              if (subRecord) {
                await (db as any).insert((schema as any)[tableName]).values(subRecord);
                imported++;
              }
            } catch (error: any) {
              errors++;
              if (errors <= 3) {
                console.error(`❌ שגיאה ב-subitem ${subitem.name}:`, error.message);
              }
            }
          }
        }

        if (imported % 50 === 0 && imported > 0) {
          console.log(`✅ ייובאו ${imported} רשומות...`);
        }

      } catch (error: any) {
        errors++;
        if (errors <= 3) {
          console.error(`❌ שגיאה ברשומה ${item.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ ${boardName} הושלם!`);
    console.log(`📊 ייובאו: ${imported} רשומות`);
    if (errors > 0) {
      console.log(`❌ שגיאות: ${errors} רשומות`);
    }

  } catch (error) {
    console.error(`❌ שגיאה כללית ב-${boardName}:`, error);
  } finally {
    await connection.end();
  }

  return { imported, errors };
}

async function importAll() {
  console.log('🚀 מתחיל ייבוא איטי מ-Monday.com...\n');
  console.log('═══════════════════════════════════════\n');

  const results: any = {};

  // Design Tasks
  results.designTasks = await importBoard(
    '5063083196',
    'משימות עיצוב',
    'designTasks',
    true,
    (item) => ({
      taskName: item.name || '',
      clientId: 1,
      status: 'todo',
      priority: 'medium',
      assignedTo: getColumnValue(item.column_values, 'person'),
      dueDate: getColumnValue(item.column_values, 'date'),
      description: getColumnValue(item.column_values, 'long_text'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  console.log('\n⏰ ממתין 5 דקות...\n');
  await new Promise(resolve => setTimeout(resolve, 300000));

  // Website Projects
  results.website = await importBoard(
    '5063083167',
    'פרויקטי אתרים',
    'websiteProjects',
    true,
    (item) => ({
      projectName: item.name || '',
      clientId: 1,
      status: 'planning',
      url: getColumnValue(item.column_values, 'link'),
      technology: getColumnValue(item.column_values, 'text'),
      notes: getColumnValue(item.column_values, 'long_text'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  console.log('\n⏰ ממתין 5 דקות...\n');
  await new Promise(resolve => setTimeout(resolve, 300000));

  // Payment Collection
  results.paymentCollection = await importBoard(
    '5063084636',
    'Payment Collection',
    'paymentCollection',
    true,
    (item, isSubitem, parentName) => ({
      item: item.name || '',
      subitem: isSubitem ? parentName : null,
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
    })
  );

  console.log('\n⏰ ממתין 5 דקות...\n');
  await new Promise(resolve => setTimeout(resolve, 300000));

  // Deals
  results.deals = await importBoard(
    '5063084390',
    'עסקאות',
    'deals',
    true,
    (item) => ({
      dealName: item.name || '',
      status: 'active',
      priority: 'medium',
      value: getColumnNumber(item.column_values, 'numbers'),
      currency: 'ILS',
      client: getColumnValue(item.column_values, 'text'),
      contactPerson: getColumnValue(item.column_values, 'text_1'),
      phone: getColumnValue(item.column_values, 'phone'),
      email: getColumnValue(item.column_values, 'email'),
      notes: getColumnValue(item.column_values, 'long_text'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  console.log('\n⏰ ממתין 5 דקות...\n');
  await new Promise(resolve => setTimeout(resolve, 300000));

  // Grow Sites
  results.growSites = await importBoard(
    '5067122569',
    'Grow Sites',
    'growSites',
    true,
    (item) => ({
      name: item.name || '',
      owner: getColumnValue(item.column_values, 'person'),
      status: 'planning',
      priority: 'medium',
      technology: getColumnValue(item.column_values, 'text'),
      url: getColumnValue(item.column_values, 'link'),
      notes: getColumnValue(item.column_values, 'long_text'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // Summary
  console.log('\n\n🎉 סיכום ייבוא:');
  console.log('═══════════════════════════════════════');
  let totalImported = 0;
  let totalErrors = 0;
  for (const [key, value] of Object.entries(results)) {
    const v = value as any;
    console.log(`${key.padEnd(20)} ${v.imported.toString().padStart(5)} רשומות ${v.errors > 0 ? `(${v.errors} שגיאות)` : '✅'}`);
    totalImported += v.imported;
    totalErrors += v.errors;
  }
  console.log('═══════════════════════════════════════');
  console.log(`סה"כ ייובאו: ${totalImported} רשומות`);
  console.log(`סה"כ שגיאות: ${totalErrors} רשומות`);
  console.log('\n✅ הייבוא הושלם!');
}

importAll();

