import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

async function checkNeonData() {
  console.log('🔍 בודק נתונים ב-Neon...\n');

  // יצירת חיבור
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    // ספירת לקוחות
    const clients = await db.select().from(schema.crmClients);
    console.log(`✅ לקוחות (CRM): ${clients.length}`);

    // ספירת אנשי קשר
    const contacts = await db.select().from(schema.contacts);
    console.log(`✅ אנשי קשר: ${contacts.length}`);

    // ספירת משימות לקוח
    const clientTasks = await db.select().from(schema.clientTasks);
    console.log(`✅ משימות לקוח: ${clientTasks.length}`);

    // ספירת משימות עיצוב
    const designTasks = await db.select().from(schema.designTasks);
    console.log(`✅ משימות עיצוב: ${designTasks.length}`);

    // ספירת חיובים
    const billing = await db.select().from(schema.billingCharges);
    console.log(`✅ חיובים: ${billing.length}`);

    // ספירת לידים
    const leads = await db.select().from(schema.leads);
    console.log(`✅ לידים: ${leads.length}`);

    // ספירת פרויקטי אתרים
    const websites = await db.select().from(schema.websiteProjects);
    console.log(`✅ פרויקטי אתרים: ${websites.length}`);

    // ספירת Grow Sites
    const growSites = await db.select().from(schema.growSites);
    console.log(`✅ Grow Sites: ${growSites.length}`);

    // ספירת Deals
    const deals = await db.select().from(schema.deals);
    console.log(`✅ Deals: ${deals.length}`);

    // ספירת Payment Collection
    const payments = await db.select().from(schema.paymentCollection);
    console.log(`✅ Payment Collection: ${payments.length}`);

    // ספירת System Improvements
    const improvements = await db.select().from(schema.systemImprovements);
    console.log(`✅ System Improvements: ${improvements.length}`);

    console.log('\n📊 סיכום:');
    const total = clients.length + contacts.length + clientTasks.length + 
                  designTasks.length + billing.length + leads.length + 
                  websites.length + growSites.length + deals.length + 
                  payments.length + improvements.length;
    console.log(`סה"כ רשומות: ${total}`);

    if (total === 0) {
      console.log('\n⚠️  ה-database ריק! צריך לייבא נתונים.');
    } else {
      console.log('\n✅ יש נתונים ב-database!');
    }

  } catch (error) {
    console.error('❌ שגיאה:', error);
  } finally {
    await connection.end();
  }
}

checkNeonData();

