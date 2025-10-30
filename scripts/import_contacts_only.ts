import { getDb } from '../server/db';
import { contacts } from '../drizzle/schema';
import fs from 'fs';

function extractText(cv: any): string | null {
  if (!cv) return null;
  const val = cv.text || cv.display_value || cv.email || cv.phone;
  return val && val.trim() !== '' ? val : null;
}

async function main() {
  console.log('📇 Importing Contacts...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/contacts_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  let errors = 0;
  
  for (const item of data.items) {
    try {
      const phoneCol = item.column_values?.find((cv: any) => cv.id === 'phone__1');
      const emailCol = item.column_values?.find((cv: any) => cv.id === 'email__1');
      const positionCol = item.column_values?.find((cv: any) => cv.id === 'text__1');
      const notesCol = item.column_values?.find((cv: any) => cv.id === 'long_text__1');
      
      const record: any = {
        name: item.name
      };
      
      const email = extractText(emailCol);
      if (email) record.email = email;
      
      const phone = extractText(phoneCol);
      if (phone) record.phone = phone;
      
      const position = extractText(positionCol);
      if (position) record.position = position;
      
      const notes = extractText(notesCol);
      if (notes) record.notes = notes;
      
      await db.insert(contacts).values(record);
      imported++;
      
      if (imported % 50 === 0) {
        console.log(`  ✅ ${imported}/${data.items.length}...`);
      }
    } catch (error: any) {
      errors++;
      if (errors < 5) {
        console.error(`  ❌ ${item.name}: ${error.message}`);
      }
    }
  }
  
  console.log(`✅ Imported ${imported}/${data.items.length} contacts (${errors} errors)`);
  process.exit(0);
}

main();
