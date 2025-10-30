import { getDb } from "../server/db";
import { contacts } from "../drizzle/schema";
import * as fs from "fs";
import * as path from "path";

async function importContacts() {
  console.log("🔄 מייבא אנשי קשר מ-Monday.com...");
  
  const db = await getDb();
  if (!db) {
    console.error("❌ לא ניתן להתחבר לדאטהבייס");
    return;
  }
  
  // Load data
  const dataPath = path.join("/home/ubuntu", "contacts_import_data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  
  console.log(`✅ נמצאו ${data.length} אנשי קשר`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const contact of data) {
    try {
      const contactName = contact.name || `Unknown Contact (${contact.monday_id})`;
      
      await db.insert(contacts).values({
        name: contactName,
        phone: contact.phone,
        email: contact.email,
        company: contact.company,
        position: contact.position,
        status: contact.status === 'פעיל' ? 'active' : 'inactive' as any,
        notes: `Monday ID: ${contact.monday_id}`,
      });
      
      imported++;
      if (imported % 50 === 0) {
        console.log(`  ✅ ${imported}/${data.length} אנשי קשר...`);
      }
    } catch (error) {
      console.error(`  ⚠️ שגיאה באיש קשר ${contact.name}:`, error);
      skipped++;
    }
  }
  
  console.log(`\n🎉 הושלם!`);
  console.log(`✅ ייבאנו: ${imported} אנשי קשר`);
  console.log(`⚠️ דילגנו: ${skipped} אנשי קשר`);
  console.log(`📊 אחוז הצלחה: ${((imported / data.length) * 100).toFixed(1)}%`);
}

importContacts()
  .then(() => {
    console.log("✅ ייבוא הושלם בהצלחה!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ שגיאה בייבוא:", error);
    process.exit(1);
  });

