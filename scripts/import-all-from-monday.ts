import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

const MONDAY_API_URL = 'https://api.monday.com/v2';
const API_KEY = process.env.MONDAY_API_KEY!;

// Helper function to safely parse column value
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

async function importBoard(boardId: string, boardName: string, tableName: string, mapper: (item: any, isSubitem: boolean, parentName?: string) => any) {
  console.log(`\n📊 מייבא ${boardName}...`);

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
  console.log(`📊 מספר רשומות: ${board.items_page.items.length}`);

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  let imported = 0;
  let errors = 0;

  try {
    for (const item of board.items_page.items) {
      try {
        const record = mapper(item, false);
        await (db as any).insert((schema as any)[tableName]).values(record);
        imported++;

        // Import subitems
        if (item.subitems && item.subitems.length > 0) {
          for (const subitem of item.subitems) {
            try {
              const subRecord = mapper(subitem, true, item.name);
              await (db as any).insert((schema as any)[tableName]).values(subRecord);
              imported++;
            } catch (error: any) {
              errors++;
              console.error(`❌ שגיאה ב-subitem ${subitem.name}:`, error.message);
            }
          }
        }

        if (imported % 50 === 0) {
          console.log(`✅ ייובאו ${imported} רשומות...`);
        }

      } catch (error: any) {
        errors++;
        console.error(`❌ שגיאה ברשומה ${item.name}:`, error.message);
      }
    }

    console.log(`\n✅ ${boardName} הושלם!`);
    console.log(`📊 ייובאו: ${imported} רשומות`);
    console.log(`❌ שגיאות: ${errors} רשומות`);

  } catch (error) {
    console.error(`❌ שגיאה כללית ב-${boardName}:`, error);
  } finally {
    await connection.end();
  }

  return { imported, errors };
}

async function importAll() {
  console.log('🚀 מתחיל ייבוא מלא מ-Monday.com...\n');

  const results: any = {};

  // 1. Payment Collection
  results.paymentCollection = await importBoard(
    '5063084636',
    'Payment Collection',
    'paymentCollection',
    (item, isSubitem, parentName) => ({
      item: item.name || '',
      subitem: isSubitem ? parentName : null,
      amount: getColumnNumber(item.column_values, 'numbers__1'),
      targetDate: getColumnValue(item.column_values, 'date'),
      paymentDate: getColumnValue(item.column_values, 'date4'),
      dateDiff: null,
      collectionStatus: getColumnValue(item.column_values, 'status8__1') || 'pending',
      paymentStatus: getColumnValue(item.column_values, 'status__1') || 'not_paid',
      documents: getColumnValue(item.column_values, 'files__1'),
      link: getColumnValue(item.column_values, 'link__1'),
      notes: getColumnValue(item.column_values, 'long_text8__1'),
      tags: getColumnValue(item.column_values, 'tags__1'),
      account: getColumnValue(item.column_values, 'text__1'),
      email: getColumnValue(item.column_values, 'email__1'),
      phone: getColumnValue(item.column_values, 'phone__1'),
      contacts: getColumnValue(item.column_values, 'connect_boards__1'),
      website: getColumnValue(item.column_values, 'link1__1'),
      currency: getColumnValue(item.column_values, 'dropdown__1') || 'ILS',
      amountILS: getColumnNumber(item.column_values, 'numbers6__1'),
      automation: getColumnValue(item.column_values, 'long_text__1'),
      createdBy: getColumnValue(item.column_values, 'person__1'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // 2. Deals
  results.deals = await importBoard(
    '5063084390',
    'Deals (עסקאות)',
    'deals',
    (item, isSubitem, parentName) => ({
      dealName: item.name || '',
      status: 'active',
      priority: 'medium',
      value: getColumnNumber(item.column_values, 'numbers'),
      currency: getColumnValue(item.column_values, 'dropdown') || 'ILS',
      client: getColumnValue(item.column_values, 'text'),
      contactPerson: getColumnValue(item.column_values, 'text_1'),
      phone: getColumnValue(item.column_values, 'phone'),
      email: getColumnValue(item.column_values, 'email'),
      source: getColumnValue(item.column_values, 'text_2'),
      stage: getColumnValue(item.column_values, 'status'),
      probability: getColumnNumber(item.column_values, 'numbers_1'),
      expectedCloseDate: getColumnValue(item.column_values, 'date'),
      actualCloseDate: getColumnValue(item.column_values, 'date_1'),
      assignedTo: getColumnValue(item.column_values, 'person'),
      team: getColumnValue(item.column_values, 'text_3'),
      notes: getColumnValue(item.column_values, 'long_text'),
      tags: getColumnValue(item.column_values, 'tags'),
      files: getColumnValue(item.column_values, 'files'),
      nextAction: getColumnValue(item.column_values, 'long_text_1'),
      lastContact: getColumnValue(item.column_values, 'date_2'),
      createdBy: getColumnValue(item.column_values, 'person_1'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // 3. Grow Sites
  results.growSites = await importBoard(
    '5067122569',
    'Grow Sites',
    'growSites',
    (item, isSubitem, parentName) => ({
      name: item.name || '',
      owner: getColumnValue(item.column_values, 'person'),
      status: getColumnValue(item.column_values, 'status') || 'planning',
      timelineStart: getColumnValue(item.column_values, 'date'),
      timelineEnd: getColumnValue(item.column_values, 'date_1'),
      priority: getColumnValue(item.column_values, 'status_1') || 'medium',
      clientId: null,
      siteType: getColumnValue(item.column_values, 'dropdown'),
      technology: getColumnValue(item.column_values, 'text'),
      url: getColumnValue(item.column_values, 'link'),
      notes: getColumnValue(item.column_values, 'long_text'),
      budget: getColumnNumber(item.column_values, 'numbers'),
      hoursSpent: getColumnNumber(item.column_values, 'numbers_1'),
      revenue: getColumnNumber(item.column_values, 'numbers_2'),
      files: getColumnValue(item.column_values, 'files'),
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
    console.log(`${key}: ${(value as any).imported} רשומות (${(value as any).errors} שגיאות)`);
    totalImported += (value as any).imported;
    totalErrors += (value as any).errors;
  }
  console.log('═══════════════════════════════════════');
  console.log(`סה"כ ייובאו: ${totalImported} רשומות`);
  console.log(`סה"כ שגיאות: ${totalErrors} רשומות`);
  console.log('\n✅ הייבוא הושלם!');
}

importAll();

