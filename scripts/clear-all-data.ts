import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';
import { sql } from 'drizzle-orm';

async function clearAllData() {
  console.log('🗑️  מוחק את כל הנתונים מ-Neon...\n');

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    // Disable foreign key checks
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);

    // Delete all data
    console.log('🗑️  מוחק Payment Collection...');
    await db.delete(schema.paymentCollection);

    console.log('🗑️  מוחק Deals...');
    await db.delete(schema.deals);

    console.log('🗑️  מוחק Grow Sites...');
    await db.delete(schema.growSites);

    console.log('🗑️  מוחק System Improvements...');
    await db.delete(schema.systemImprovements);

    console.log('🗑️  מוחק Website Projects...');
    await db.delete(schema.websiteProjects);

    console.log('🗑️  מוחק Design Tasks...');
    await db.delete(schema.designTasks);

    console.log('🗑️  מוחק Client Tasks...');
    await db.delete(schema.clientTasks);

    console.log('🗑️  מוחק Billing...');
    await db.delete(schema.billingCharges);

    console.log('🗑️  מוחק Contacts...');
    await db.delete(schema.contacts);

    console.log('🗑️  מוחק Leads...');
    await db.delete(schema.leads);

    console.log('🗑️  מוחק CRM Clients...');
    await db.delete(schema.crmClients);

    // Re-enable foreign key checks
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

    console.log('\n✅ כל הנתונים נמחקו בהצלחה!');

  } catch (error) {
    console.error('❌ שגיאה:', error);
  } finally {
    await connection.end();
  }
}

clearAllData();

