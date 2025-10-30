import { getDb } from '../server/db';
import { 
  crmClients, 
  contacts, 
  clientTasks, 
  deals, 
  paymentCollection,
  websiteProjects,
  designTasks
} from '../drizzle/schema';
import fs from 'fs';

// Helper function to extract value from Monday column
function extractValue(cv: any, expectedType: string): any {
  if (!cv) return null;
  
  const text = cv.text;
  const value = cv.value;
  const displayValue = cv.display_value;
  
  // Handle different column types
  if (expectedType === 'text' || expectedType === 'string') {
    return text || displayValue || null;
  }
  
  if (expectedType === 'number') {
    if (!text || text.trim() === '') return null;
    try {
      return parseInt(text);
    } catch {
      return null;
    }
  }
  
  if (expectedType === 'date') {
    if (cv.date) return new Date(cv.date);
    if (text && text.trim()) {
      try {
        return new Date(text);
      } catch {
        return null;
      }
    }
    return null;
  }
  
  if (expectedType === 'status') {
    return cv.label || text || null;
  }
  
  if (expectedType === 'people') {
    return text || null;
  }
  
  if (expectedType === 'board_relation') {
    if (cv.linked_item_ids && cv.linked_item_ids.length > 0) {
      return JSON.stringify(cv.linked_item_ids);
    }
    return null;
  }
  
  if (expectedType === 'mirror') {
    return displayValue || text || null;
  }
  
  return text || null;
}

// Helper to find column by ID
function findColumn(item: any, columnId: string): any {
  return item.column_values?.find((cv: any) => cv.id === columnId);
}

async function importContacts() {
  console.log('\n📇 Importing Contacts...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/contacts_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  
  for (const item of data.items) {
    try {
      const record = {
        contactName: item.name,
        email: extractValue(findColumn(item, 'email'), 'text'),
        phone: extractValue(findColumn(item, 'phone'), 'text'),
        company: extractValue(findColumn(item, 'text'), 'text'),
        position: extractValue(findColumn(item, 'text4'), 'text'),
        notes: extractValue(findColumn(item, 'long_text'), 'text')
      };
      
      await db.insert(contacts).values(record);
      imported++;
      
      if (imported % 50 === 0) {
        console.log(`  ✅ ${imported}/${data.items.length}...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`  ✅ Imported ${imported} contacts`);
  return imported;
}

async function importClientTasks() {
  console.log('\n🎫 Importing Client Tasks...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/client_tasks_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  
  for (const item of data.items) {
    try {
      const record = {
        taskName: item.name,
        status: extractValue(findColumn(item, 'status'), 'status') || 'pending',
        priority: extractValue(findColumn(item, 'priority'), 'status') || 'medium',
        assignee: extractValue(findColumn(item, 'person'), 'people'),
        dueDate: extractValue(findColumn(item, 'date'), 'date'),
        description: extractValue(findColumn(item, 'long_text'), 'text'),
        clientLink: extractValue(findColumn(item, 'board_relation'), 'board_relation')
      };
      
      await db.insert(clientTasks).values(record);
      imported++;
      
      if (imported % 50 === 0) {
        console.log(`  ✅ ${imported}/${data.items.length}...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`  ✅ Imported ${imported} client tasks`);
  return imported;
}

async function importDeals() {
  console.log('\n💼 Importing Deals...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/deals_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  
  for (const item of data.items) {
    try {
      const record = {
        dealName: item.name,
        value: extractValue(findColumn(item, 'numbers'), 'number'),
        stage: extractValue(findColumn(item, 'status'), 'status') || 'lead',
        probability: extractValue(findColumn(item, 'numbers'), 'number') || 50,
        client: extractValue(findColumn(item, 'text'), 'text'),
        closeDate: extractValue(findColumn(item, 'date'), 'date'),
        notes: extractValue(findColumn(item, 'long_text'), 'text')
      };
      
      await db.insert(deals).values(record);
      imported++;
      
      if (imported % 50 === 0) {
        console.log(`  ✅ ${imported}/${data.items.length}...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`  ✅ Imported ${imported} deals`);
  return imported;
}

async function importPaymentCollection() {
  console.log('\n💰 Importing Payment Collection...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/payment_collection_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  
  for (const item of data.items) {
    try {
      const record = {
        item: item.name,
        amount: extractValue(findColumn(item, 'numbers'), 'number'),
        collectionStatus: extractValue(findColumn(item, 'status'), 'status') || 'pending',
        paymentStatus: extractValue(findColumn(item, 'status'), 'status') || 'unpaid',
        targetDate: extractValue(findColumn(item, 'date'), 'date'),
        notes: extractValue(findColumn(item, 'long_text'), 'text')
      };
      
      await db.insert(paymentCollection).values(record);
      imported++;
      
      if (imported % 50 === 0) {
        console.log(`  ✅ ${imported}/${data.items.length}...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`  ✅ Imported ${imported} payment collection items`);
  return imported;
}

async function importWebsiteProjects() {
  console.log('\n🌐 Importing Website Projects...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/website_projects_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  
  for (const item of data.items) {
    try {
      const record = {
        projectName: item.name,
        client: extractValue(findColumn(item, 'text'), 'text'),
        status: extractValue(findColumn(item, 'status'), 'status') || 'in_progress',
        startDate: extractValue(findColumn(item, 'date'), 'date'),
        endDate: extractValue(findColumn(item, 'date'), 'date'),
        url: extractValue(findColumn(item, 'link'), 'text'),
        notes: extractValue(findColumn(item, 'long_text'), 'text')
      };
      
      await db.insert(websiteProjects).values(record);
      imported++;
      
      if (imported % 50 === 0) {
        console.log(`  ✅ ${imported}/${data.items.length}...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`  ✅ Imported ${imported} website projects`);
  return imported;
}

async function importDesignTasks() {
  console.log('\n🎨 Importing Design Tasks...');
  
  const data = JSON.parse(fs.readFileSync('/tmp/design_tasks_full_data.json', 'utf-8'));
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  
  let imported = 0;
  
  for (const item of data.items) {
    try {
      const record = {
        taskName: item.name,
        status: extractValue(findColumn(item, 'status'), 'status') || 'pending',
        priority: extractValue(findColumn(item, 'status'), 'status') || 'medium',
        designer: extractValue(findColumn(item, 'person'), 'people'),
        dueDate: extractValue(findColumn(item, 'date'), 'date'),
        description: extractValue(findColumn(item, 'long_text'), 'text')
      };
      
      await db.insert(designTasks).values(record);
      imported++;
      
      if (imported % 50 === 0) {
        console.log(`  ✅ ${imported}/${data.items.length}...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`  ✅ Imported ${imported} design tasks`);
  return imported;
}

// Main import function
async function main() {
  console.log('🚀 Starting massive import operation!');
  console.log('=' .repeat(60));
  
  const results: any = {};
  
  try {
    results.contacts = await importContacts();
    results.clientTasks = await importClientTasks();
    results.deals = await importDeals();
    results.paymentCollection = await importPaymentCollection();
    results.websiteProjects = await importWebsiteProjects();
    results.designTasks = await importDesignTasks();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 IMPORT COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`  - Contacts: ${results.contacts}`);
    console.log(`  - Client Tasks: ${results.clientTasks}`);
    console.log(`  - Deals: ${results.deals}`);
    console.log(`  - Payment Collection: ${results.paymentCollection}`);
    console.log(`  - Website Projects: ${results.websiteProjects}`);
    console.log(`  - Design Tasks: ${results.designTasks}`);
    
    const total = Object.values(results).reduce((a: any, b: any) => a + b, 0);
    console.log(`\n🎯 Total imported: ${total} records`);
    console.log('\n🔥 WE MADE HISTORY TODAY! 🔥\n');
    
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

main();

