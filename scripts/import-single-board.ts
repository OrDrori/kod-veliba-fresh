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

async function importCRM() {
  console.log('\n📊 מייבא CRM - ניהול לקוחות...\n');

  const query = `
    query {
      boards(ids: [5063083021]) {
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
    console.error('❌ לא מצאתי את הבורד CRM!');
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
    // First, delete existing CRM data
    console.log('🗑️  מוחק נתונים קיימים ב-CRM...');
    await db.delete(schema.crmClients);
    console.log('✅ נתונים קיימים נמחקו!\n');

    for (const item of board.items_page.items) {
      try {
        // Map businessType from Hebrew to English
        const businessTypeHeb = getColumnValue(item.column_values, 'dropdown_mkvjnesk');
        let businessType = 'retainer';
        if (businessTypeHeb) {
          if (businessTypeHeb.includes('ריטיינר')) businessType = 'retainer';
          else if (businessTypeHeb.includes('שעתי')) businessType = 'hourly';
          else if (businessTypeHeb.includes('בנק')) businessType = 'bank';
          else if (businessTypeHeb.includes('פרויקט')) businessType = 'project';
          else if (businessTypeHeb.includes('חד פעמי')) businessType = 'one_time';
        }

        // Map status from Hebrew to English
        const statusHeb = getColumnValue(item.column_values, 'status');
        let status = 'active';
        if (statusHeb) {
          if (statusHeb.includes('פעיל')) status = 'active';
          else if (statusHeb.includes('לא פעיל')) status = 'inactive';
          else if (statusHeb.includes('פוטנציאלי')) status = 'potential';
        }

        const client = {
          clientName: item.name || '',
          contactPerson: getColumnValue(item.column_values, 'person'),
          email: getColumnValue(item.column_values, 'lookup_mkqhd7z3'), // דואל (mirror)
          phone: getColumnValue(item.column_values, 'lookup_mkqhe794'), // נייד (mirror)
          businessType,
          status,
          monthlyRetainer: getColumnNumber(item.column_values, 'numeric_mkvjnesk'), // סכום ריטיינר
          hourlyRate: getColumnNumber(item.column_values, 'numeric_mkvj40rx'), // תעריף שעתי
          bankHours: getColumnNumber(item.column_values, 'numeric_mkvj45jx'), // גודל בנק שעות
          usedHours: getColumnNumber(item.column_values, 'numeric_mkvj6xv8'), // שעות שנוצלו
          currency: 'ILS',
          startDate: getColumnValue(item.column_values, 'date_mkqhjvfy'), // תאריך מעקב הבא
          notes: getColumnValue(item.column_values, 'text_mkqhh1jp'), // נק' לשיפור
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(schema.crmClients).values(client);
        imported++;

        if (imported % 10 === 0) {
          console.log(`✅ ייובאו ${imported} לקוחות...`);
        }

      } catch (error: any) {
        errors++;
        if (errors <= 3) {
          console.error(`❌ שגיאה בלקוח ${item.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ CRM הושלם!`);
    console.log(`📊 ייובאו: ${imported} לקוחות`);
    if (errors > 0) {
      console.log(`❌ שגיאות: ${errors} לקוחות`);
    }

  } catch (error) {
    console.error('❌ שגיאה כללית:', error);
  } finally {
    await connection.end();
  }
}

importCRM();

