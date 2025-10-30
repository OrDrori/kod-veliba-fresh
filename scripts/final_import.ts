import { getDb } from '../server/db';
import { 
  contacts, 
  clientTasks, 
  paymentCollection,
  websiteProjects,
  designTasks
} from '../drizzle/schema';
import fs from 'fs';

// Helper to extract value
function extractText(cv: any): string | null {
  if (!cv) return null;
  const val = cv.text || cv.display_value || cv.email || cv.phone;
  return val && val.trim() !== '' ? val : null;
}

function extractNumber(cv: any): number | null {
  if (!cv) return null;
  const text = cv.text || cv.number;
  if (!text) return null;
  try {
    const num = parseInt(text.toString());
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

function extractDate(cv: any): Date | null {
  if (!cv) return null;
  const dateStr = cv.date || cv.text;
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
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
      const phoneCol = item.column_values?.find((cv: any) => cv.id === 'phone__1');
      const emailCol = item.column_values?.find((cv: any) => cv.id === 'email__1');
      const positionCol = item.column_values?.find((cv: any) => cv.id === 'text__1');
      const notesCol = item.column_values?.find((cv: any) => cv.id === 'long_text__1');
      const clientCol = item.column_values?.find((cv: any) => cv.id === 'board_relation_mkqhzs1a');
      
      const record: any = {
        name: item.name
      };
      
      // Only add fields with values
      const email = extractText(emailCol);
      if (email) record.email = email;
      
      const phone = extractText(phoneCol);
      if (phone) record.phone = phone;
      
      const company = extractText(clientCol);
      if (company) record.company = company;
      
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
      const statusCol = item.column_values?.find((cv: any) => cv.type === 'status');
      const personCol = item.column_values?.find((cv: any) => cv.type === 'people');
      const dateCol = item.column_values?.find((cv: any) => cv.type === 'date');
      const textCol = item.column_values?.find((cv: any) => cv.type === 'long_text');
      
      const statusText = extractText(statusCol) || 'todo';
      const statusMap: any = {
        'done': 'done',
        'working': 'in_progress',
        'stuck': 'blocked',
        'pending': 'todo',
        'todo': 'todo'
      };
      
      const record: any = {
        taskName: item.name,
        status: statusMap[statusText.toLowerCase()] || 'todo',
        priority: 'medium'
      };
      
      const assignee = extractText(personCol);
      if (assignee) record.assignedTo = assignee;
      
      const dueDate = extractDate(dateCol);
      if (dueDate) record.dueDate = dueDate;
      
      const description = extractText(textCol);
      if (description) record.description = description;
      
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
      
      const collectionStatusText = extractText(statusCols?.[0]) || 'pending';
      const paymentStatusText = extractText(statusCols?.[1]) || 'not_paid';
      
      const collectionStatusMap: any = {
        'pending': 'pending',
        'in progress': 'in_progress',
        'collected': 'collected',
        'overdue': 'overdue'
      };
      
      const paymentStatusMap: any = {
        'not paid': 'not_paid',
        'unpaid': 'not_paid',
        'partial': 'partial',
        'paid': 'paid',
        'cancelled': 'cancelled'
      };
      
      const record: any = {
        item: item.name,
        collectionStatus: collectionStatusMap[collectionStatusText.toLowerCase()] || 'pending',
        paymentStatus: paymentStatusMap[paymentStatusText.toLowerCase()] || 'not_paid'
      };
      
      const amount = extractNumber(numberCol);
      if (amount) record.amount = amount.toString();
      
      const targetDate = extractDate(dateCol);
      if (targetDate) record.targetDate = targetDate;
      
      const notes = extractText(textCol);
      if (notes) record.notes = notes;
      
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
      
      const statusText = extractText(statusCol) || 'planning';
      const statusMap: any = {
        'done': 'live',
        'working': 'development',
        'stuck': 'planning',
        'pending': 'planning',
        'planning': 'planning',
        'design': 'design',
        'development': 'development',
        'testing': 'testing',
        'live': 'live',
        'maintenance': 'maintenance'
      };
      
      const record: any = {
        projectName: item.name,
        status: statusMap[statusText.toLowerCase()] || 'planning'
      };
      
      const client = extractText(textCol);
      if (client) record.client = client;
      
      const url = extractText(linkCol);
      if (url) record.url = url;
      
      const launchDate = extractDate(dateCol);
      if (launchDate) record.launchDate = launchDate;
      
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
      
      const statusText = extractText(statusCol) || 'todo';
      const statusMap: any = {
        'done': 'done',
        'working': 'in_progress',
        'stuck': 'todo',
        'pending': 'todo',
        'todo': 'todo',
        'in progress': 'in_progress',
        'review': 'review',
        'approved': 'approved'
      };
      
      const record: any = {
        taskName: item.name,
        priority: 'medium',
        status: statusMap[statusText.toLowerCase()] || 'todo'
      };
      
      const designer = extractText(personCol);
      if (designer) record.assignedTo = designer;
      
      const dueDate = extractDate(dateCol);
      if (dueDate) record.dueDate = dueDate;
      
      const description = extractText(textCol);
      if (description) record.description = description;
      
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
  console.log('🚀 Starting final import!');
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
    console.log(`\n🎯 New records imported: ${total}`);
    console.log(`\n🔥 PLUS 65 CRM + 208 Deals = ${total + 65 + 208} TOTAL! 🔥\n`);
    
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

main();

