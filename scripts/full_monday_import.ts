import { getDb } from '../server/db';
import * as schema from '../drizzle/schema';

const MONDAY_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU3ODY1ODE2NywiYWFpIjoxMSwidWlkIjo2ODEyOTM1OCwiaWFkIjoiMjAyNS0xMC0yNlQxNTowMjo0Ni4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjIzMTg1NjQsInJnbiI6ImV1YzEifQ.-twZJa9EcQT5_Pvh-0W7OF-KNgPUJVfwneKXA0Kzqak';
const MONDAY_API_URL = 'https://api.monday.com/v2';

// CRM Board ID
const CRM_BOARD_ID = '5063083021';

async function fetchFullCRMData() {
  console.log('🚀 Fetching FULL CRM data from Monday.com...\n');

  const query = `
    query {
      boards(ids: [${CRM_BOARD_ID}]) {
        name
        columns {
          id
          title
          type
        }
        items_page(limit: 100) {
          cursor
          items {
            id
            name
            column_values {
              id
              text
              value
              type
              ... on MirrorValue {
                display_value
              }
              ... on BoardRelationValue {
                display_value
                linked_item_ids
              }
              ... on FormulaValue {
                display_value
              }
              ... on LongTextValue {
                text
              }
              ... on StatusValue {
                text
              }
              ... on PeopleValue {
                persons_and_teams {
                  id
                  kind
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': MONDAY_API_KEY,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  
  if (data.errors) {
    console.error('❌ Monday API Error:', data.errors);
    return null;
  }

  const board = data.data.boards[0];
  console.log(`✅ Fetched ${board.items_page.items.length} items from "${board.name}"`);
  console.log(`📊 Columns: ${board.columns.length}`);
  
  // Print column mapping
  console.log('\n📋 Column Mapping:');
  board.columns.forEach((col: any) => {
    console.log(`   ${col.id.padEnd(25)} → ${col.title} (${col.type})`);
  });

  return board;
}

async function importToDatabase(board: any) {
  console.log('\n💾 Importing to database...\n');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    return;
  }

  let imported = 0;
  let updated = 0;
  let errors = 0;

  for (const item of board.items_page.items) {
    try {
      // Build column value map
      const values: any = {};
      for (const col of item.column_values) {
        values[col.id] = col;
      }

      // Map to database fields
      const record: any = {
        mondayId: item.id,
        clientName: item.name,
      };

      // Map each column based on ID
      // You'll need to update these mappings based on your actual column IDs
      
      // Try to insert or update
      const existing = await db.select().from(schema.crmClients).where(schema.crmClients.mondayId.eq(item.id)).limit(1);
      
      if (existing.length > 0) {
        await db.update(schema.crmClients).set(record).where(schema.crmClients.mondayId.eq(item.id));
        updated++;
      } else {
        await db.insert(schema.crmClients).values(record);
        imported++;
      }
      
      console.log(`✅ ${item.name}`);
    } catch (error) {
      console.error(`❌ Error importing "${item.name}":`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Imported: ${imported}`);
  console.log(`🔄 Updated: ${updated}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('='.repeat(60));
}

async function main() {
  const board = await fetchFullCRMData();
  if (board) {
    // Save to file for analysis
    const { writeFileSync } = await import('fs');
    writeFileSync('/tmp/full_crm_data.json', JSON.stringify(board, null, 2));
    console.log('\n✅ Data saved to /tmp/full_crm_data.json for analysis');
    
    // await importToDatabase(board);
  }
}

main().catch(console.error);

