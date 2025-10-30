import { getDb } from '../server/db';
import { 
  contacts, 
  clientTasks, 
  paymentCollection,
  websiteProjects,
  designTasks
} from '../drizzle/schema';
import fs from 'fs';

// Helper to find column by title or type
function findColumnByTitle(item: any, titles: string[]): any {
  for (const title of titles) {
    const col = item.column_values?.find((cv: any) => 
      cv.id?.includes(title.toLowerCase()) || 
      cv.text?.includes(title) ||
      cv.type === title
    );
    if (col) return col;
  }
  return null;
}

function extractText(cv: any): string | null {
  if (!cv) return null;
  return cv.text || cv.display_value || cv.email || cv.phone || null;
}

function extractNumber(cv: any): number | null {
  if (!cv) return null;
  const text = cv.text || cv.number;
  if (!text) return null;
  try {
    return parseInt(text.toString());
  } catch {
    return null;
  }
}

function extractDate(cv: any): Date | null {
  if (!cv) return null;
  const dateStr = cv.date || cv.text;
  if (!dateStr) return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
}

async function importContacts() {
  console.log('\n📇 Importing Contacts...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/contacts_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  let errors = 0;
  
  for (const item of data.items) {
    try {
      // Find columns by ID
      const phoneCol = item.column_values?.find((cv: any) => cv.id === 'phone__1');
      const emailCol = item.column_values?.find((cv: any) => cv.id === 'email__1');
      const positionCol = item.column_values?.find((cv: any) => cv.id === 'text__1');
      const notesCol = item.column_values?.find((cv: any) => cv.id === 'long_text__1');
      const clientCol = item.column_values?.find((cv: any) => cv.id === 'board_relation_mkqhzs1a');
      
      const record = {
        contactName: item.name,
        email: extractText(emailCol),
        phone: extractText(phoneCol),
        company: extractText(clientCol),
        position: extractText(positionCol),
        notes: extractText(notesCol)
      };
      
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
  
  console.log(`  ✅ Imported ${imported}/${data.items.length} contacts (${errors} errors)`);
  return imported;
}

async function importClientTasks() {
  console.log('\n🎫 Importing Client Tasks...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/client_tasks_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  let errors = 0;
  
  for (const item of data.items) {
    try {
      // Find status column (usually 'status' or first status type)
      const statusCol = item.column_values?.find((cv: any) => cv.type === 'status');
      const personCol = item.column_values?.find((cv: any) => cv.type === 'people');
      const dateCol = item.column_values?.find((cv: any) => cv.type === 'date');
      const textCol = item.column_values?.find((cv: any) => cv.type === 'long_text');
      
      const statusText = extractText(statusCol) || 'pending';
      const statusMap: any = {
        'done': 'completed',
        'working': 'in_progress',
        'stuck': 'blocked',
        'pending': 'pending'
      };
      
      const record = {
        taskName: item.name,
        status: statusMap[statusText.toLowerCase()] || 'pending',
        priority: 'medium',
        assignee: extractText(personCol),
        dueDate: extractDate(dateCol),
        description: extractText(textCol),
        clientLink: null
      };
      
      await db.insert(clientTasks).values(record);
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
  
  console.log(`  ✅ Imported ${imported}/${data.items.length} client tasks (${errors} errors)`);
  return imported;
}

async function importPaymentCollection() {
  console.log('\n💰 Importing Payment Collection...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/payment_collection_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  let errors = 0;
  
  for (const item of data.items) {
    try {
      const numberCol = item.column_values?.find((cv: any) => cv.type === 'numbers');
      const statusCols = item.column_values?.filter((cv: any) => cv.type === 'status');
      const dateCol = item.column_values?.find((cv: any) => cv.type === 'date');
      const textCol = item.column_values?.find((cv: any) => cv.type === 'long_text');
      
      const record = {
        item: item.name,
        amount: extractNumber(numberCol),
        collectionStatus: extractText(statusCols?.[0]) || 'pending',
        paymentStatus: extractText(statusCols?.[1]) || 'unpaid',
        targetDate: extractDate(dateCol),
        notes: extractText(textCol)
      };
      
      await db.insert(paymentCollection).values(record);
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
  
  console.log(`  ✅ Imported ${imported}/${data.items.length} payment items (${errors} errors)`);
  return imported;
}

async function importWebsiteProjects() {
  console.log('\n🌐 Importing Website Projects...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/website_projects_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  let errors = 0;
  
  for (const item of data.items) {
    try {
      const statusCol = item.column_values?.find((cv: any) => cv.type === 'status');
      const dateCol = item.column_values?.find((cv: any) => cv.type === 'date');
      const linkCol = item.column_values?.find((cv: any) => cv.type === 'link');
      const textCol = item.column_values?.find((cv: any) => cv.type === 'text');
      
      const statusText = extractText(statusCol) || 'in_progress';
      const statusMap: any = {
        'done': 'completed',
        'working': 'in_progress',
        'stuck': 'on_hold',
        'pending': 'planning'
      };
      
      const record = {
        projectName: item.name,
        client: extractText(textCol),
        status: statusMap[statusText.toLowerCase()] || 'in_progress',
        startDate: extractDate(dateCol),
        endDate: null,
        url: extractText(linkCol),
        notes: null
      };
      
      await db.insert(websiteProjects).values(record);
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
  
  console.log(`  ✅ Imported ${imported}/${data.items.length} website projects (${errors} errors)`);
  return imported;
}

async function importDesignTasks() {
  console.log('\n🎨 Importing Design Tasks...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/design_tasks_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  let errors = 0;
  
  for (const item of data.items) {
    try {
      const statusCol = item.column_values?.find((cv: any) => cv.type === 'status');
      const personCol = item.column_values?.find((cv: any) => cv.type === 'people');
      const dateCol = item.column_values?.find((cv: any) => cv.type === 'date');
      const textCol = item.column_values?.find((cv: any) => cv.type === 'long_text');
      
      const statusText = extractText(statusCol) || 'pending';
      const statusMap: any = {
        'done': 'completed',
        'working': 'in_progress',
        'stuck': 'blocked',
        'pending': 'pending'
      };
      
      const record = {
        taskName: item.name,
        priority: 'medium',
        status: statusMap[statusText.toLowerCase()] || 'pending',
        designer: extractText(personCol),
        dueDate: extractDate(dateCol),
        description: extractText(textCol),
        notes: null
      };
      
      await db.insert(designTasks).values(record);
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
  
  console.log(`  ✅ Imported ${imported}/${data.items.length} design tasks (${errors} errors)`);
  return imported;
}

// Main
async function main() {
  console.log('🚀 Starting smart import!');
  console.log('='.repeat(60));
  
  const results: any = {};
  
  try {
    results.contacts = await importContacts();
    results.clientTasks = await importClientTasks();
    results.paymentCollection = await importPaymentCollection();
    results.websiteProjects = await importWebsiteProjects();
    results.designTasks = await importDesignTasks();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 IMPORT COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`  - Contacts: ${results.contacts}`);
    console.log(`  - Client Tasks: ${results.clientTasks}`);
    console.log(`  - Payment Collection: ${results.paymentCollection}`);
    console.log(`  - Website Projects: ${results.websiteProjects}`);
    console.log(`  - Design Tasks: ${results.designTasks}`);
    
    const total = Object.values(results).reduce((a: any, b: any) => a + b, 0);
    console.log(`\n🎯 Total imported: ${total} records`);
    console.log(`\n🔥 PLUS 65 CRM + 208 Deals = ${total + 65 + 208} TOTAL! 🔥\n`);
    
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

main();

