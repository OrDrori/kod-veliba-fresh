const MONDAY_API_URL = 'https://api.monday.com/v2';
const API_KEY = process.env.MONDAY_API_KEY!;

async function queryMonday(query: string) {
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': API_KEY,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  return data;
}

async function debugCRM() {
  console.log('🔍 בודק עמודות CRM...\n');

  const query = `
    query {
      boards(ids: [5063083021]) {
        id
        name
        columns {
          id
          title
          type
        }
        items_page(limit: 1) {
          items {
            id
            name
            column_values {
              id
              text
              value
              type
            }
          }
        }
      }
    }
  `;

  const data = await queryMonday(query);
  
  if (!data.data || !data.data.boards || data.data.boards.length === 0) {
    console.error('❌ לא מצאתי את הבורד!');
    return;
  }

  const board = data.data.boards[0];
  
  console.log('📋 עמודות בבורד CRM:');
  console.log('═══════════════════════════════════════\n');
  for (const col of board.columns) {
    console.log(`${col.id.padEnd(20)} ${col.title.padEnd(30)} (${col.type})`);
  }

  console.log('\n\n📊 דוגמה ללקוח ראשון:');
  console.log('═══════════════════════════════════════\n');
  
  if (board.items_page.items.length > 0) {
    const item = board.items_page.items[0];
    console.log(`שם: ${item.name}\n`);
    
    for (const cv of item.column_values) {
      if (cv.text) {
        console.log(`${cv.id.padEnd(20)} = "${cv.text}"`);
      }
    }
  }
}

debugCRM();

