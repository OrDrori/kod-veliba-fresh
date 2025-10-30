import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { getDb } from '../server/db';
import { crmClients } from '../drizzle/schema';

async function importKarenData() {
  console.log('🚀 Starting Karen data import...\n');

  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    process.exit(1);
  }

  // Import main accounting file (546 rows)
  console.log('📄 Importing main accounting file...');
  const mainFile = readFileSync('/home/ubuntu/upload/_הנהלתחשבונות-גביה-מעודכןאחרון13.10.25(1).xlsx-ראשי.csv', 'utf-8');
  const mainRecords = parse(mainFile, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  console.log(`   Found ${mainRecords.length} records`);

  // Import open invoices (49 rows)
  console.log('📄 Importing open invoices...');
  const invoicesFile = readFileSync('/home/ubuntu/upload/מסמכיםפתוחיםלתשלום-Worksheet.csv', 'utf-8');
  const invoiceRecords = parse(invoicesFile, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  console.log(`   Found ${invoiceRecords.length} invoices`);

  // Import company status (87 rows)
  console.log('📄 Importing company status...');
  const statusFile = readFileSync('/home/ubuntu/upload/סטטוסחברה-גיליון1.csv', 'utf-8');
  const statusRecords = parse(statusFile, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  console.log(`   Found ${statusRecords.length} status records`);

  // Process and merge data
  console.log('\n📊 Processing data...');
  
  const clientsMap = new Map();

  // Process main file
  for (const record of mainRecords) {
    const clientName = record['לקוח'] || record['Client'] || '';
    if (!clientName || clientName.trim() === '') continue;

    clientsMap.set(clientName, {
      clientName,
      ...record
    });
  }

  // Process invoices
  for (const invoice of invoiceRecords) {
    const clientName = invoice['לקוח / ספק'] || '';
    if (!clientName || clientName.trim() === '') continue;

    if (!clientsMap.has(clientName)) {
      clientsMap.set(clientName, { clientName });
    }

    const client = clientsMap.get(clientName);
    if (!client.openInvoices) {
      client.openInvoices = [];
    }

    client.openInvoices.push({
      date: invoice['תאריך'],
      amount: invoice['סה"כ כולל מע"מ'],
      sendReminder: invoice['האם לשלוח מייל  לתזכורת תשלום'],
      lastReminder: invoice['תזכור פעם אחרונה'],
      notes: invoice['הערות']
    });
  }

  // Process status
  for (const status of statusRecords) {
    const clientName = status['Client '] || status['Client'] || '';
    if (!clientName || clientName.trim() === '') continue;

    if (!clientsMap.has(clientName)) {
      clientsMap.set(clientName, { clientName });
    }

    const client = clientsMap.get(clientName);
    client.monthlyIncome = status['MONTELY INCOME'];
    client.status = 'active';
  }

  console.log(`\n✅ Processed ${clientsMap.size} unique clients`);

  // Save summary
  const summary = {
    totalRecords: mainRecords.length,
    totalInvoices: invoiceRecords.length,
    totalStatus: statusRecords.length,
    uniqueClients: clientsMap.size,
    timestamp: new Date().toISOString()
  };

  console.log('\n📊 Summary:');
  console.log(`   Total records: ${summary.totalRecords}`);
  console.log(`   Total invoices: ${summary.totalInvoices}`);
  console.log(`   Total status: ${summary.totalStatus}`);
  console.log(`   Unique clients: ${summary.uniqueClients}`);

  // Save to file for review
  const { writeFileSync } = await import('fs');
  writeFileSync(
    '/tmp/karen_import_summary.json',
    JSON.stringify({
      summary,
      clients: Array.from(clientsMap.values())
    }, null, 2)
  );

  console.log('\n✅ Data saved to /tmp/karen_import_summary.json');
  console.log('🎉 Import complete!');
}

importKarenData().catch(console.error);

