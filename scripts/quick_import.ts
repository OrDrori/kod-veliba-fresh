import { getDb } from '../server/db';
import * as schema from '../drizzle/schema';
import { eq } from 'drizzle-orm';

async function quickImport() {
  console.log('⚡ Quick import - essential fields only\n');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    return;
  }

  const { readFileSync } = await import('fs');
  const data = JSON.parse(readFileSync('/tmp/full_crm_data.json', 'utf-8'));
  
  let updated = 0;

  for (const item of data.items_page.items) {
    const cols: any = {};
    for (const col of item.column_values) {
      cols[col.id] = col;
    }

    const getValue = (id: string) => cols[id]?.display_value || cols[id]?.text || null;
    const getNumber = (id: string) => {
      const val = getValue(id);
      return val ? parseFloat(val.replace(/,/g, '')) : null;
    };

    const record: any = {
      mondayId: item.id,
      clientName: item.name,
      accountManager: getValue('person'),
      hourlyRate: getNumber('numeric_mkvj40rx'),
      status: getValue('status'),
      email: getValue('lookup_mkqhd7z3'),
      phone: getValue('lookup_mkqhe794'),
      contactPerson: getValue('board_relation_mkqhw7j9'),
    };

    await db.update(schema.crmClients)
      .set(record)
      .where(eq(schema.crmClients.mondayId, item.id));
    
    updated++;
    if (updated % 10 === 0) process.stdout.write('.');
  }

  console.log(`\n✅ Updated: ${updated}`);
}

quickImport().catch(console.error);

