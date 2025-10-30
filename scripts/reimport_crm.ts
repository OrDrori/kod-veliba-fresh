import { getDb } from '../server/db';
import * as schema from '../drizzle/schema';
import { eq } from 'drizzle-orm';

async function reimportCRM() {
  console.log('🚀 Re-importing CRM data with correct mapping...\n');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    return;
  }

  // Load the full data
  const { readFileSync } = await import('fs');
  const data = JSON.parse(readFileSync('/tmp/full_crm_data.json', 'utf-8'));
  
  let updated = 0;
  let errors = 0;

  for (const item of data.items_page.items) {
    try {
      // Build column value map
      const cols: any = {};
      for (const col of item.column_values) {
        cols[col.id] = col;
      }

      // Helper to get value
      const getValue = (id: string) => {
        const col = cols[id];
        if (!col) return null;
        return col.display_value || col.text || null;
      };

      // Helper to get board_relation IDs (not names!)
      const getRelationIds = (id: string) => {
        const col = cols[id];
        if (!col || col.type !== 'board_relation') return null;
        try {
          const value = JSON.parse(col.value || '{}');
          return value.linkedPulseIds ? value.linkedPulseIds.map((item: any) => item.linkedPulseId).join(',') : null;
        } catch {
          return null;
        }
      };

      const getNumber = (id: string) => {
        const val = getValue(id);
        return val ? parseFloat(val.replace(/,/g, '')) : null;
      };

      // Map to database fields with correct column IDs
      const record: any = {
        mondayId: item.id,
        clientName: item.name,
        accountManager: getValue('person'), // מנהל תיק
        billingMethod: getValue('dropdown_mkvjnesk'), // שיטות חיוב
        hourlyRate: getNumber('numeric_mkvj40rx'), // תעריף שעתי
        monthlyRetainer: getNumber('numeric_mkvjysc6'), // סכום ריטיינר
        bankHours: getNumber('numeric_mkvj45jx'), // גודל בנק שעות
        usedHours: getNumber('numeric_mkvj6xv8'), // שעות שנוצלו
        status: getValue('status'), // סטטוס לקוח
        email: getValue('lookup_mkqhd7z3'), // דואל (mirror)
        phone: getValue('lookup_mkqhe794'), // נייד (mirror)
        contactPerson: getValue('board_relation_mkqhw7j9'), // איש קשר ראשי
        serviceType: getValue('board_relation_mkqh13fx'), // סוג שירות
        projectsLink: getRelationIds('board_relation_mkqqb35n'), // Projects
        tasksLink: getRelationIds('board_relation_mkqj2zap'), // משימות לקוח
        clientBoardId: getValue('text_mkqtamtp'), // מזהה בורד לקוח
        icountId: getValue('text_mktc8nhm'), // ID Icount
        satisfaction: getNumber('rating_mkqhk0ec'), // שביעות רצון
        improvementNotes: getValue('text_mkqhh1jp'), // נק' לשיפור
      };

      // Update existing record
      await db.update(schema.crmClients)
        .set(record)
        .where(eq(schema.crmClients.mondayId, item.id));
      
      updated++;
      console.log(`✅ ${item.name}`);
      
    } catch (error) {
      console.error(`❌ Error updating "${item.name}":`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('='.repeat(60));
}

reimportCRM().catch(console.error);

