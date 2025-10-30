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
  mapper: (item: any, isSubitem: boolean, parentName?: string) => any
) {
  console.log(`\n📊 מייבא ${boardName} (Board ID: ${boardId})...`);

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

        if (imported % 100 === 0 && imported > 0) {
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
  console.log('🚀 מתחיל ייבוא מלא מ-Monday.com...\n');
  console.log('═══════════════════════════════════════\n');

  const results: any = {};

  // 1. CRM - ניהול לקוחות
  results.crm = await importBoard(
    '5063083021',
    'CRM - ניהול לקוחות',
    'crmClients',
    (item, isSubitem) => ({
      clientName: item.name || '',
      contactPerson: getColumnValue(item.column_values, 'text'),
      email: getColumnValue(item.column_values, 'email'),
      phone: getColumnValue(item.column_values, 'phone'),
      businessType: getColumnValue(item.column_values, 'status') || 'retainer',
      status: getColumnValue(item.column_values, 'status_1') || 'active',
      monthlyRetainer: getColumnNumber(item.column_values, 'numbers'),
      hourlyRate: getColumnNumber(item.column_values, 'numbers_1'),
      bankHours: getColumnNumber(item.column_values, 'numbers_2'),
      usedHours: getColumnNumber(item.column_values, 'numbers_3'),
      currency: getColumnValue(item.column_values, 'dropdown') || 'ILS',
      startDate: getColumnValue(item.column_values, 'date'),
      notes: getColumnValue(item.column_values, 'long_text'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // 2. Contacts - אנשי קשר
  results.contacts = await importBoard(
    '5063084084',
    'אנשי קשר',
    'contacts',
    (item, isSubitem) => ({
      name: item.name || '',
      position: getColumnValue(item.column_values, 'text'),
      email: getColumnValue(item.column_values, 'email'),
      phone: getColumnValue(item.column_values, 'phone'),
      company: getColumnValue(item.column_values, 'text_1'),
      status: getColumnValue(item.column_values, 'status') || 'active',
      notes: getColumnValue(item.column_values, 'long_text'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // 3. Leads - לידים
  results.leads = await importBoard(
    '5063083816',
    'לידים',
    'leads',
    (item, isSubitem) => ({
      leadName: item.name || '',
      contactPerson: getColumnValue(item.column_values, 'text'),
      email: getColumnValue(item.column_values, 'email'),
      phone: getColumnValue(item.column_values, 'phone'),
      source: getColumnValue(item.column_values, 'text_1'),
      status: getColumnValue(item.column_values, 'status') || 'new',
      priority: getColumnValue(item.column_values, 'status_1') || 'medium',
      notes: getColumnValue(item.column_values, 'long_text'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // 4. Client Tasks - משימות לקוחות
  results.clientTasks = await importBoard(
    '5063083674',
    'משימות לקוח',
    'clientTasks',
    (item, isSubitem, parentName) => ({
      taskName: item.name || '',
      clientId: null,
      status: getColumnValue(item.column_values, 'status') || 'new',
      priority: getColumnValue(item.column_values, 'status_1') || 'medium',
      assignedTo: getColumnValue(item.column_values, 'person'),
      dueDate: getColumnValue(item.column_values, 'date'),
      description: getColumnValue(item.column_values, 'long_text'),
      estimatedHours: getColumnNumber(item.column_values, 'numbers'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // 5. Design Tasks - משימות עיצוב
  results.designTasks = await importBoard(
    '5063083196',
    'משימות עיצוב',
    'designTasks',
    (item, isSubitem) => ({
      taskName: item.name || '',
      clientId: null,
      status: getColumnValue(item.column_values, 'status') || 'new',
      priority: getColumnValue(item.column_values, 'status_1') || 'medium',
      assignedTo: getColumnValue(item.column_values, 'person'),
      dueDate: getColumnValue(item.column_values, 'date'),
      description: getColumnValue(item.column_values, 'long_text'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // 6. Website Projects - פרויקטי אתרים
  results.website = await importBoard(
    '5063083167',
    'פרויקטי אתרים',
    'websiteProjects',
    (item, isSubitem) => ({
      projectName: item.name || '',
      clientId: null,
      status: getColumnValue(item.column_values, 'status') || 'planning',
      url: getColumnValue(item.column_values, 'link'),
      technology: getColumnValue(item.column_values, 'text'),
      notes: getColumnValue(item.column_values, 'long_text'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // 7. Payment Collection - גבייה
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
      collectionStatus: 'pending',
      paymentStatus: 'not_paid',
      notes: getColumnValue(item.column_values, 'long_text8__1'),
      currency: 'ILS',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // 8. Deals - עסקאות
  results.deals = await importBoard(
    '5063084390',
    'עסקאות',
    'deals',
    (item, isSubitem) => ({
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

  // 9. Grow Sites - ניהול אתרים
  results.growSites = await importBoard(
    '5067122569',
    'Grow Sites',
    'growSites',
    (item, isSubitem) => ({
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
  console.log('\n\n🎉 סיכום ייבוא מלא:');
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
  console.log('\n✅ הייבוא המלא הושלם!');
}

importAll();

