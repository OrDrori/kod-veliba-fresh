import { db } from '/home/ubuntu/kod-veliba-demo/server/db.js';
import { crmClients } from '/home/ubuntu/kod-veliba-demo/drizzle/schema.js';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('/tmp/crm_import_ready.json', 'utf-8'));

console.log(`📊 Importing ${data.length} CRM clients...`);

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
  } catch (error) {
    console.error(`  ❌ Error importing ${record.clientName}:`, error.message);
    errors++;
  }
}

console.log(`\n✅ Import complete!`);
console.log(`  - Imported: ${imported}`);
console.log(`  - Errors: ${errors}`);

process.exit(0);
