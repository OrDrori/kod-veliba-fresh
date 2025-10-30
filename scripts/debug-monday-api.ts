// Node 22 has built-in fetch

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

async function debugAPI() {
  console.log('🔍 בודק תשובת Monday.com API...\n');

  const query = `
    query {
      boards(ids: [5063084636]) {
        id
        name
        items_page(limit: 2) {
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
  
  console.log('📊 תשובה מלאה:');
  console.log(JSON.stringify(data, null, 2));
}

debugAPI();

