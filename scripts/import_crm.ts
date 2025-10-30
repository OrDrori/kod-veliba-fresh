import { getDb } from '../server/db';
import { crmClients } from '../drizzle/schema';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('/tmp/crm_import_ready.json', 'utf-8'));

console.log(`📊 Importing ${data.length} CRM clients...`);

async function importData() {
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    process.exit(1);
  }
  
  let imported = 0;
  let errors = 0;

  for (const record of data) {
    try {
      // Map to DB schema
      const dbRecord = {
        clientName: record.clientName,
        contactPerson: record.contactPerson || null,
        email: record.email || null,
        phone: record.phone || null,
        businessType: record.businessType || 'retainer',
        status: record.status || 'active',
        hourlyRate: record.hourlyRate || null,
        monthlyRetainer: record.monthlyRetainer || null,
        bankHours: record.bankHours || null,
        usedHours: record.usedHours || 0,
        hourlyRateSeparate: record.hourlyRateSeparate || null,
        startDate: record.startDate ? new Date(record.startDate) : null,
        automate: record.automate || null,
        idNotes: record.idNotes || null,
        billingNotes: record.billingNotes || null,
        tasksLink: record.tasksLink || null,
        projectsLink: record.projectsLink || null,
        projectsLink2: record.projectsLink2 || null,
        notes: record.notes || null
      };
      
      await db.insert(crmClients).values(dbRecord);
      imported++;
      
      if (imported % 10 === 0) {
        console.log(`  ✅ Imported ${imported}/${data.length}...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error importing ${record.clientName}:`, error.message);
      errors++;
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`  - Imported: ${imported}`);
  console.log(`  - Errors: ${errors}`);
  
  process.exit(0);
}

importData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

