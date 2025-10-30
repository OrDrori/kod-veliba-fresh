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

async function importDeals() {
  console.log('\n📊 מייבא Deals (עסקאות)...\n');

  const query = `
    query {
      boards(ids: [5063084390]) {
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
    console.error('❌ לא מצאתי את הבורד Deals!');
    return 0;
  }

  const board = data.data.boards[0];
  console.log(`✅ מצאתי בורד: ${board.name}`);
  console.log(`📊 מספר רשומות: ${board.items_page.items.length}\n`);

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  let imported = 0;

  try {
    console.log('🗑️  מוחק נתונים קיימים ב-Deals...');
    await db.delete(schema.deals);
    console.log('✅ נתונים קיימים נמחקו!\n');

    for (const item of board.items_page.items) {
      try {
        await db.insert(schema.deals).values({
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
        });
        imported++;

        // Subitems
        if (item.subitems) {
          for (const sub of item.subitems) {
            try {
              await db.insert(schema.deals).values({
                dealName: `${item.name} - ${sub.name}`,
                status: 'active',
                priority: 'medium',
                value: getColumnNumber(sub.column_values, 'numbers'),
                currency: 'ILS',
                client: getColumnValue(sub.column_values, 'text'),
                contactPerson: getColumnValue(sub.column_values, 'text_1'),
                phone: getColumnValue(sub.column_values, 'phone'),
                email: getColumnValue(sub.column_values, 'email'),
                notes: getColumnValue(sub.column_values, 'long_text'),
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              imported++;
            } catch (e) {}
          }
        }

        if (imported % 100 === 0) {
          console.log(`✅ ייובאו ${imported} עסקאות...`);
        }
      } catch (e) {}
    }

    console.log(`\n✅ Deals הושלם! ייובאו: ${imported} עסקאות\n`);
  } catch (error) {
    console.error('❌ שגיאה:', error);
  } finally {
    await connection.end();
  }

  return imported;
}

async function importGrowSites() {
  console.log('\n📊 מייבא Grow Sites...\n');

  const query = `
    query {
      boards(ids: [5067122569]) {
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
    console.error('❌ לא מצאתי את הבורד Grow Sites!');
    return 0;
  }

  const board = data.data.boards[0];
  console.log(`✅ מצאתי בורד: ${board.name}`);
  console.log(`📊 מספר רשומות: ${board.items_page.items.length}\n`);

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  let imported = 0;

  try {
    console.log('🗑️  מוחק נתונים קיימים ב-Grow Sites...');
    await db.delete(schema.growSites);
    console.log('✅ נתונים קיימים נמחקו!\n');

    for (const item of board.items_page.items) {
      try {
        await db.insert(schema.growSites).values({
          name: item.name || '',
          owner: getColumnValue(item.column_values, 'person'),
          status: 'planning',
          priority: 'medium',
          technology: getColumnValue(item.column_values, 'text'),
          url: getColumnValue(item.column_values, 'link'),
          notes: getColumnValue(item.column_values, 'long_text'),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        imported++;

        if (imported % 200 === 0) {
          console.log(`✅ ייובאו ${imported} אתרים...`);
        }
      } catch (e) {}
    }

    console.log(`\n✅ Grow Sites הושלם! ייובאו: ${imported} אתרים\n`);
  } catch (error) {
    console.error('❌ שגיאה:', error);
  } finally {
    await connection.end();
  }

  return imported;
}

async function importLeads() {
  console.log('\n📊 מייבא Leads (לידים)...\n');

  const query = `
    query {
      boards(ids: [5063083816]) {
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
    console.error('❌ לא מצאתי את הבורד Leads!');
    return 0;
  }

  const board = data.data.boards[0];
  console.log(`✅ מצאתי בורד: ${board.name}`);
  console.log(`📊 מספר רשומות: ${board.items_page.items.length}\n`);

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  let imported = 0;

  try {
    console.log('🗑️  מוחק נתונים קיימים ב-Leads...');
    await db.delete(schema.leads);
    console.log('✅ נתונים קיימים נמחקו!\n');

    for (const item of board.items_page.items) {
      try {
        await db.insert(schema.leads).values({
          leadName: item.name || '',
          contactPerson: getColumnValue(item.column_values, 'text'),
          email: getColumnValue(item.column_values, 'email'),
          phone: getColumnValue(item.column_values, 'phone'),
          source: 'other',
          status: 'new',
          notes: getColumnValue(item.column_values, 'long_text'),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        imported++;
      } catch (e) {}
    }

    console.log(`\n✅ Leads הושלם! ייובאו: ${imported} לידים\n`);
  } catch (error) {
    console.error('❌ שגיאה:', error);
  } finally {
    await connection.end();
  }

  return imported;
}

async function importAll() {
  console.log('🚀 מייבא את הבורדים הנותרים...\n');
  console.log('═══════════════════════════════════════\n');

  const deals = await importDeals();
  const growSites = await importGrowSites();
  const leads = await importLeads();

  console.log('\n🎉 סיכום:');
  console.log('═══════════════════════════════════════');
  console.log(`Deals:      ${deals} עסקאות`);
  console.log(`Grow Sites: ${growSites} אתרים`);
  console.log(`Leads:      ${leads} לידים`);
  console.log(`סה"כ:      ${deals + growSites + leads} רשומות חדשות`);
  console.log('═══════════════════════════════════════');
  console.log('\n✅ הייבוא הושלם!');
}

importAll();

