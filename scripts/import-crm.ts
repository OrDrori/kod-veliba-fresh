import { getDb } from "../server/db";
import { crmClients } from "../drizzle/schema";
import * as fs from "fs";
import * as path from "path";

async function importCRM() {
  console.log("🔄 מייבא לקוחות מ-Monday.com...");
  
  const db = await getDb();
  if (!db) {
    console.error("❌ לא ניתן להתחבר לדאטהבייס");
    return;
  }
  
  // Load data
  const dataPath = path.join("/home/ubuntu", "crm_import_data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  
  console.log(`✅ נמצאו ${data.length} לקוחות`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const client of data) {
    try {
      const hourlyRate = client.hourly_rate ? parseInt(client.hourly_rate) : null;
      const retainerAmount = client.retainer_amount ? parseInt(client.retainer_amount) : null;
      const bankHours = client.hours_bank_size ? parseInt(client.hours_bank_size) : null;
      const usedHours = client.hours_used ? parseInt(client.hours_used) : 0;
      
      await db.insert(crmClients).values({
        clientName: client.name,
        businessType: client.business_type as any,
        status: client.status as any,
        hourlyRate: hourlyRate,
        monthlyRetainer: retainerAmount,
        bankHours: bankHours,
        usedHours: usedHours,
        notes: `Monday ID: ${client.monday_id}\nAccount Manager: ${client.account_manager || 'N/A'}\nBilling Method: ${client.billing_method || 'N/A'}`,
      });
      
      imported++;
      if (imported % 10 === 0) {
        console.log(`  ✅ ${imported}/${data.length} לקוחות...`);
      }
    } catch (error) {
      console.error(`  ⚠️ שגיאה בלקוח ${client.name}:`, error);
      skipped++;
    }
  }
  
  console.log(`\n🎉 הושלם!`);
  console.log(`✅ ייבאנו: ${imported} לקוחות`);
  console.log(`⚠️ דילגנו: ${skipped} לקוחות`);
  console.log(`📊 אחוז הצלחה: ${((imported / data.length) * 100).toFixed(1)}%`);
}

importCRM()
  .then(() => {
    console.log("✅ ייבוא הושלם בהצלחה!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ שגיאה בייבוא:", error);
    process.exit(1);
  });

