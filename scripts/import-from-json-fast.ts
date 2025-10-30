import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';
import * as fs from 'fs';

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

async function importFromJSON() {
  console.log('🚀 מתחיל ייבוא מהיר מקובץ JSON...\n');
  console.log('═══════════════════════════════════════\n');

  // Read JSON file
  const jsonData = JSON.parse(fs.readFileSync('/home/ubuntu/monday_full_data.json', 'utf-8'));
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  const results: any = {};

  try {
    // Design Tasks (5063083196)
    console.log('📊 מייבא משימות עיצוב...');
    const designBoard = jsonData.data.boards.find((b: any) => b.id === '5063083196');
    if (designBoard) {
      await db.delete(schema.designTasks);
      let imported = 0;
      for (const item of designBoard.items) {
        try {
          await db.insert(schema.designTasks).values({
            taskName: item.name || '',
            clientId: 1,
            status: 'todo',
            priority: 'medium',
            assignedTo: getColumnValue(item.column_values, 'person'),
            dueDate: getColumnValue(item.column_values, 'date'),
            description: getColumnValue(item.column_values, 'long_text'),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          imported++;
        } catch (e) {}
      }
      results.designTasks = imported;
      console.log(`✅ משימות עיצוב: ${imported} רשומות\n`);
    }

    // Website Projects (5063083167)
    console.log('📊 מייבא פרויקטי אתרים...');
    const websiteBoard = jsonData.data.boards.find((b: any) => b.id === '5063083167');
    if (websiteBoard) {
      await db.delete(schema.websiteProjects);
      let imported = 0;
      for (const item of websiteBoard.items) {
        try {
          await db.insert(schema.websiteProjects).values({
            projectName: item.name || '',
            clientId: 1,
            status: 'planning',
            url: getColumnValue(item.column_values, 'link'),
            technology: getColumnValue(item.column_values, 'text'),
            notes: getColumnValue(item.column_values, 'long_text'),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          imported++;
          if (imported % 50 === 0) console.log(`  ${imported}...`);
        } catch (e) {}
      }
      results.websiteProjects = imported;
      console.log(`✅ פרויקטי אתרים: ${imported} רשומות\n`);
    }

    // Payment Collection (5063084636)
    console.log('📊 מייבא Payment Collection...');
    const paymentBoard = jsonData.data.boards.find((b: any) => b.id === '5063084636');
    if (paymentBoard) {
      await db.delete(schema.paymentCollection);
      let imported = 0;
      for (const item of paymentBoard.items) {
        try {
          await db.insert(schema.paymentCollection).values({
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
          });
          imported++;
          
          // Subitems
          if (item.subitems) {
            for (const sub of item.subitems) {
              try {
                await db.insert(schema.paymentCollection).values({
                  item: sub.name || '',
                  subitem: item.name,
                  amount: getColumnNumber(sub.column_values, 'numbers__1'),
                  targetDate: getColumnValue(sub.column_values, 'date'),
                  paymentDate: getColumnValue(sub.column_values, 'date4'),
                  dateDiff: null,
                  collectionStatus: 'pending',
                  paymentStatus: 'not_paid',
                  notes: getColumnValue(sub.column_values, 'long_text8__1'),
                  currency: 'ILS',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
                imported++;
              } catch (e) {}
            }
          }
          
          if (imported % 100 === 0) console.log(`  ${imported}...`);
        } catch (e) {}
      }
      results.paymentCollection = imported;
      console.log(`✅ Payment Collection: ${imported} רשומות\n`);
    }

    // Deals (5063084390)
    console.log('📊 מייבא עסקאות...');
    const dealsBoard = jsonData.data.boards.find((b: any) => b.id === '5063084390');
    if (dealsBoard) {
      await db.delete(schema.deals);
      let imported = 0;
      for (const item of dealsBoard.items) {
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
          
          if (imported % 100 === 0) console.log(`  ${imported}...`);
        } catch (e) {}
      }
      results.deals = imported;
      console.log(`✅ עסקאות: ${imported} רשומות\n`);
    }

    // Grow Sites (5067122569)
    console.log('📊 מייבא Grow Sites...');
    const growBoard = jsonData.data.boards.find((b: any) => b.id === '5067122569');
    if (growBoard) {
      await db.delete(schema.growSites);
      let imported = 0;
      for (const item of growBoard.items) {
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
          if (imported % 200 === 0) console.log(`  ${imported}...`);
        } catch (e) {}
      }
      results.growSites = imported;
      console.log(`✅ Grow Sites: ${imported} רשומות\n`);
    }

    // Leads (5063083816)
    console.log('📊 מייבא לידים...');
    const leadsBoard = jsonData.data.boards.find((b: any) => b.id === '5063083816');
    if (leadsBoard) {
      await db.delete(schema.leads);
      let imported = 0;
      for (const item of leadsBoard.items) {
        try {
          await db.insert(schema.leads).values({
            leadName: item.name || '',
            contactPerson: getColumnValue(item.column_values, 'text'),
            email: getColumnValue(item.column_values, 'email'),
            phone: getColumnValue(item.column_values, 'phone'),
            source: getColumnValue(item.column_values, 'dropdown') || 'other',
            status: getColumnValue(item.column_values, 'status') || 'new',
            notes: getColumnValue(item.column_values, 'long_text'),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          imported++;
        } catch (e) {}
      }
      results.leads = imported;
      console.log(`✅ לידים: ${imported} רשומות\n`);
    }

    // Billing (if exists)
    console.log('📊 מייבא חיובים...');
    const billingBoard = jsonData.data.boards.find((b: any) => b.name?.includes('חיוב') || b.name?.includes('Billing'));
    if (billingBoard) {
      await db.delete(schema.billingCharges);
      let imported = 0;
      for (const item of billingBoard.items) {
        try {
          await db.insert(schema.billingCharges).values({
            chargeName: item.name || '',
            clientId: 1,
            amount: getColumnNumber(item.column_values, 'numbers') || 0,
            currency: 'ILS',
            status: 'pending',
            chargeDate: getColumnValue(item.column_values, 'date'),
            notes: getColumnValue(item.column_values, 'long_text'),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          imported++;
        } catch (e) {}
      }
      results.billing = imported;
      console.log(`✅ חיובים: ${imported} רשומות\n`);
    }

    // Summary
    console.log('\n🎉 סיכום ייבוא:');
    console.log('═══════════════════════════════════════');
    let total = 0;
    for (const [key, value] of Object.entries(results)) {
      console.log(`${key.padEnd(20)} ${value.toString().padStart(5)} רשומות ✅`);
      total += value as number;
    }
    console.log('═══════════════════════════════════════');
    console.log(`סה"כ ייובאו: ${total} רשומות חדשות`);
    console.log('\n✅ הייבוא הושלם בהצלחה!');

  } catch (error) {
    console.error('❌ שגיאה:', error);
  } finally {
    await connection.end();
  }
}

importFromJSON();

