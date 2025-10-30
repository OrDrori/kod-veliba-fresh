import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

async function verifyAll() {
  console.log('🔍 בודק את כל הבורדים...\n');
  console.log('═══════════════════════════════════════\n');

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    // CRM
    console.log('📊 בודק CRM...');
    const clients = await db.select().from(schema.crmClients);
    console.log(`✅ CRM: ${clients.length} לקוחות`);
    if (clients.length > 0) {
      const sample = clients[0];
      console.log(`   דוגמה: ${sample.clientName}`);
      console.log(`   - איש קשר: ${sample.contactPerson || 'לא מוגדר'}`);
      console.log(`   - אימייל: ${sample.email || 'לא מוגדר'}`);
      console.log(`   - טלפון: ${sample.phone || 'לא מוגדר'}`);
      console.log(`   - סטטוס: ${sample.status}`);
      console.log(`   - תעריף חודשי: ${sample.monthlyRetainer || 'לא מוגדר'}`);
      console.log(`   - תעריף שעתי: ${sample.hourlyRate || 'לא מוגדר'}`);
      console.log(`   - בנק שעות: ${sample.bankHours || 'לא מוגדר'}`);
      console.log(`   - שעות מנוצלות: ${sample.usedHours || 'לא מוגדר'}`);
    }
    console.log();

    // Contacts
    console.log('📊 בודק Contacts...');
    const contacts = await db.select().from(schema.contacts);
    console.log(`✅ Contacts: ${contacts.length} אנשי קשר`);
    if (contacts.length > 0) {
      const sample = contacts[0];
      console.log(`   דוגמה: ${sample.name}`);
      console.log(`   - אימייל: ${sample.email || 'לא מוגדר'}`);
      console.log(`   - טלפון: ${sample.phone || 'לא מוגדר'}`);
      console.log(`   - חברה: ${sample.company || 'לא מוגדר'}`);
    }
    console.log();

    // Client Tasks
    console.log('📊 בודק Client Tasks...');
    const clientTasks = await db.select().from(schema.clientTasks);
    console.log(`✅ Client Tasks: ${clientTasks.length} משימות`);
    if (clientTasks.length > 0) {
      const sample = clientTasks[0];
      console.log(`   דוגמה: ${sample.taskName}`);
      console.log(`   - סטטוס: ${sample.status}`);
      console.log(`   - עדיפות: ${sample.priority}`);
      console.log(`   - מוקצה ל: ${sample.assignedTo || 'לא מוגדר'}`);
    }
    console.log();

    // Design Tasks
    console.log('📊 בודק Design Tasks...');
    const designTasks = await db.select().from(schema.designTasks);
    console.log(`✅ Design Tasks: ${designTasks.length} משימות עיצוב`);
    if (designTasks.length > 0) {
      const sample = designTasks[0];
      console.log(`   דוגמה: ${sample.taskName}`);
      console.log(`   - סטטוס: ${sample.status}`);
      console.log(`   - עדיפות: ${sample.priority}`);
    }
    console.log();

    // Website Projects
    console.log('📊 בודק Website Projects...');
    const websiteProjects = await db.select().from(schema.websiteProjects);
    console.log(`✅ Website Projects: ${websiteProjects.length} פרויקטים`);
    if (websiteProjects.length > 0) {
      const sample = websiteProjects[0];
      console.log(`   דוגמה: ${sample.projectName}`);
      console.log(`   - סטטוס: ${sample.status}`);
      console.log(`   - URL: ${sample.url || 'לא מוגדר'}`);
      console.log(`   - טכנולוגיה: ${sample.technology || 'לא מוגדר'}`);
    }
    console.log();

    // Payment Collection
    console.log('📊 בודק Payment Collection...');
    const paymentCollection = await db.select().from(schema.paymentCollection);
    console.log(`✅ Payment Collection: ${paymentCollection.length} רשומות`);
    if (paymentCollection.length > 0) {
      const sample = paymentCollection[0];
      console.log(`   דוגמה: ${sample.item}`);
      console.log(`   - סכום: ${sample.amount || 'לא מוגדר'}`);
      console.log(`   - תאריך יעד: ${sample.targetDate || 'לא מוגדר'}`);
      console.log(`   - תאריך תשלום: ${sample.paymentDate || 'לא מוגדר'}`);
      console.log(`   - סטטוס גבייה: ${sample.collectionStatus}`);
      console.log(`   - סטטוס תשלום: ${sample.paymentStatus}`);
    }
    console.log();

    // Deals
    console.log('📊 בודק Deals...');
    const deals = await db.select().from(schema.deals);
    console.log(`✅ Deals: ${deals.length} עסקאות`);
    if (deals.length > 0) {
      const sample = deals[0];
      console.log(`   דוגמה: ${sample.dealName}`);
      console.log(`   - סטטוס: ${sample.status}`);
      console.log(`   - ערך: ${sample.value || 'לא מוגדר'}`);
      console.log(`   - לקוח: ${sample.client || 'לא מוגדר'}`);
    }
    console.log();

    // Grow Sites
    console.log('📊 בודק Grow Sites...');
    const growSites = await db.select().from(schema.growSites);
    console.log(`✅ Grow Sites: ${growSites.length} אתרים`);
    if (growSites.length > 0) {
      const sample = growSites[0];
      console.log(`   דוגמה: ${sample.name}`);
      console.log(`   - סטטוס: ${sample.status}`);
      console.log(`   - בעלים: ${sample.owner || 'לא מוגדר'}`);
      console.log(`   - URL: ${sample.url || 'לא מוגדר'}`);
    }
    console.log();

    // Leads
    console.log('📊 בודק Leads...');
    const leads = await db.select().from(schema.leads);
    console.log(`✅ Leads: ${leads.length} לידים`);
    if (leads.length > 0) {
      const sample = leads[0];
      console.log(`   דוגמה: ${sample.leadName}`);
      console.log(`   - סטטוס: ${sample.status}`);
      console.log(`   - מקור: ${sample.source}`);
    }
    console.log();

    // Billing
    console.log('📊 בודק Billing...');
    const billing = await db.select().from(schema.billingCharges);
    console.log(`✅ Billing: ${billing.length} חיובים`);
    console.log();

    // Summary
    console.log('\n🎉 סיכום:');
    console.log('═══════════════════════════════════════');
    const total = clients.length + contacts.length + clientTasks.length + 
                  designTasks.length + websiteProjects.length + paymentCollection.length +
                  deals.length + growSites.length + leads.length + billing.length;
    
    console.log(`CRM:                ${clients.length.toString().padStart(5)} לקוחות`);
    console.log(`Contacts:           ${contacts.length.toString().padStart(5)} אנשי קשר`);
    console.log(`Client Tasks:       ${clientTasks.length.toString().padStart(5)} משימות`);
    console.log(`Design Tasks:       ${designTasks.length.toString().padStart(5)} משימות עיצוב`);
    console.log(`Website Projects:   ${websiteProjects.length.toString().padStart(5)} פרויקטים`);
    console.log(`Payment Collection: ${paymentCollection.length.toString().padStart(5)} רשומות גבייה`);
    console.log(`Deals:              ${deals.length.toString().padStart(5)} עסקאות`);
    console.log(`Grow Sites:         ${growSites.length.toString().padStart(5)} אתרים`);
    console.log(`Leads:              ${leads.length.toString().padStart(5)} לידים`);
    console.log(`Billing:            ${billing.length.toString().padStart(5)} חיובים`);
    console.log('═══════════════════════════════════════');
    console.log(`סה"כ:              ${total.toString().padStart(5)} רשומות`);
    console.log('\n✅ כל הנתונים נשלפו בהצלחה מ-Neon!');

  } catch (error) {
    console.error('❌ שגיאה:', error);
  } finally {
    await connection.end();
  }
}

verifyAll();

