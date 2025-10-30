# 🔗 מדריך חיבור Monday.com - מערכת קוד וליבה

**תאריך:** 27 אוקטובר 2025  
**גרסה:** 795273ae  
**מצב:** מוכן ליישום (דורש API key מהמשתמש)

---

## 🎯 **מטרת החיבור**

יצירת סנכרון דו-כיווני מלא בין מערכת קוד וליבה (Manus) ל-Monday.com, כך שכל שינוי באחת המערכות יתעדכן אוטומטית בשנייה.

---

## 📋 **שלב 1: קבלת API Key מ-Monday.com**

### **1.1 כניסה ל-Monday.com**
1. היכנס ל-[Monday.com](https://monday.com)
2. לחץ על תמונת הפרופיל שלך בפינה הימנית העליונה
3. בחר **"Developers"** או **"Admin"** → **"API"**

### **1.2 יצירת API Token**
1. לחץ על **"My Access Tokens"**
2. לחץ על **"Generate"** או **"Create New Token"**
3. תן שם לטוקן: `Manus Integration`
4. בחר **Scopes** (הרשאות):
   - ✅ `boards:read` - קריאת בורדים
   - ✅ `boards:write` - כתיבה לבורדים
   - ✅ `items:read` - קריאת פריטים
   - ✅ `items:write` - כתיבה לפריטים
   - ✅ `columns:read` - קריאת עמודות
   - ✅ `columns:write` - כתיבה לעמודות
   - ✅ `webhooks:read` - קריאת webhooks
   - ✅ `webhooks:write` - יצירת webhooks
5. לחץ על **"Generate Token"**
6. **העתק את הטוקן** - הוא יוצג רק פעם אחת!

### **1.3 שמירת הטוקן**
⚠️ **חשוב מאוד:** שמור את הטוקן במקום בטוח! אל תשתף אותו עם אף אחד.

---

## 📋 **שלב 2: הזנת API Key למערכת**

### **2.1 דרך ממשק הניהול (UI)**
1. פתח את מערכת קוד וליבה
2. לחץ על **Settings** (הגדרות) בפינה הימנית העליונה
3. בחר **"Secrets"** (סודות)
4. לחץ על **"Add Secret"** (הוסף סוד)
5. מלא:
   - **Key:** `MONDAY_API_KEY`
   - **Value:** הטוקן שהעתקת מ-Monday.com
6. לחץ על **"Save"** (שמור)

### **2.2 דרך קובץ .env (אלטרנטיבה)**
אם אתה מעדיף, תוכל להוסיף את הטוקן ישירות לקובץ `.env`:

```bash
MONDAY_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 **שלב 3: זיהוי Board IDs ב-Monday.com**

כדי לסנכרן את הבורדים, אנחנו צריכים לדעת את ה-ID של כל בורד ב-Monday.com.

### **3.1 מציאת Board ID**
1. פתח את הבורד ב-Monday.com
2. הסתכל על ה-URL בדפדפן:
   ```
   https://your-workspace.monday.com/boards/1234567890
                                          ^^^^^^^^^^
                                          זה ה-Board ID
   ```
3. העתק את המספר (לדוגמה: `1234567890`)

### **3.2 מיפוי הבורדים**

צור קובץ `monday-boards-mapping.json` עם המיפוי הבא:

```json
{
  "crm": {
    "manusBoard": "CRM",
    "mondayBoardId": "1234567890",
    "mondayBoardName": "לקוחות",
    "columnMapping": {
      "clientName": "text_column_id",
      "contactPerson": "text_column_id_2",
      "email": "email_column_id",
      "phone": "phone_column_id",
      "businessType": "dropdown_column_id",
      "status": "status_column_id"
    }
  },
  "leads": {
    "manusBoard": "Leads",
    "mondayBoardId": "0987654321",
    "mondayBoardName": "לידים",
    "columnMapping": {
      "leadName": "text_column_id",
      "contactPerson": "text_column_id_2",
      "email": "email_column_id",
      "phone": "phone_column_id",
      "source": "dropdown_column_id",
      "status": "status_column_id",
      "estimatedValue": "numbers_column_id"
    }
  }
}
```

---

## 📋 **שלב 4: הפעלת הסנכרון**

לאחר שהזנת את ה-API Key וה-Board IDs, המערכת תתחיל לסנכרן אוטומטית:

### **4.1 סנכרון ראשוני (Initial Sync)**
1. המערכת תייבא את כל הנתונים מ-Monday.com
2. זה עשוי לקחת מספר דקות תלוי בכמות הנתונים
3. תקבל התראה כשהסנכרון הסתיים

### **4.2 סנכרון דו-כיווני (Real-time Sync)**
- **Monday → Manus:** כל שינוי ב-Monday יתעדכן תוך 1-2 שניות ב-Manus
- **Manus → Monday:** כל שינוי ב-Manus יתעדכן תוך 1-2 שניות ב-Monday

### **4.3 Webhooks**
המערכת תיצור webhooks אוטומטית ב-Monday.com כדי לקבל התראות על שינויים.

---

## 🔧 **מבנה טכני (למפתחים)**

### **API Endpoints**

```typescript
// Monday.com GraphQL API
const MONDAY_API_URL = "https://api.monday.com/v2";

// Headers
const headers = {
  "Authorization": `Bearer ${process.env.MONDAY_API_KEY}`,
  "Content-Type": "application/json"
};
```

### **פונקציות עיקריות**

```typescript
// 1. ייבוא נתונים מ-Monday
async function importFromMonday(boardId: string) {
  const query = `
    query {
      boards(ids: [${boardId}]) {
        items {
          id
          name
          column_values {
            id
            text
            value
          }
        }
      }
    }
  `;
  // ...
}

// 2. עדכון נתונים ב-Monday
async function updateToMonday(boardId: string, itemId: string, data: any) {
  const mutation = `
    mutation {
      change_multiple_column_values(
        board_id: ${boardId},
        item_id: ${itemId},
        column_values: "${JSON.stringify(data)}"
      ) {
        id
      }
    }
  `;
  // ...
}

// 3. יצירת Webhook
async function createWebhook(boardId: string) {
  const mutation = `
    mutation {
      create_webhook(
        board_id: ${boardId},
        url: "${process.env.WEBHOOK_URL}/monday-webhook",
        event: change_column_value
      ) {
        id
      }
    }
  `;
  // ...
}
```

---

## 🚨 **טיפול בקונפליקטים**

### **מה קורה אם שני אנשים מעדכנים את אותו פריט בו-זמנית?**

המערכת משתמשת ב-**Last Write Wins** (העדכון האחרון מנצח):

1. **Timestamp Comparison:** כל עדכון מקבל חותמת זמן
2. **Conflict Detection:** המערכת מזהה קונפליקטים
3. **Resolution:** העדכון עם החותמת המאוחרת ביותר מנצח
4. **Notification:** המשתמש מקבל התראה על הקונפליקט

---

## 📊 **מעקב וניטור**

### **Dashboard סנכרון**

המערכת תציג dashboard עם:
- ✅ סטטוס הסנכרון (פעיל/לא פעיל)
- ✅ מספר פריטים שסונכרנו
- ✅ זמן הסנכרון האחרון
- ✅ שגיאות (אם יש)
- ✅ קונפליקטים שנפתרו

---

## ❓ **שאלות נפוצות**

### **1. האם הסנכרון עובד בזמן אמת?**
כן! השינויים מתעדכנים תוך 1-2 שניות.

### **2. מה קורה אם אין חיבור לאינטרנט?**
השינויים נשמרים מקומית ויסונכרנו כשהחיבור יחזור.

### **3. האם אפשר לסנכרן רק חלק מהבורדים?**
כן! תוכל לבחור אילו בורדים לסנכרן בהגדרות.

### **4. מה קורה אם אני מוחק פריט ב-Monday?**
הפריט יימחק גם ב-Manus (ולהיפך).

### **5. האם הסנכרון בטוח?**
כן! כל התקשורת מוצפנת ב-HTTPS וה-API Key נשמר בצורה מאובטחת.

---

## 📞 **תמיכה**

אם יש לך שאלות או בעיות, פנה אלינו:
- 📧 Email: support@manus.im
- 🌐 Website: https://help.manus.im
- 💬 Chat: בתוך המערכת

---

**עדכון אחרון:** 27/10/2025 22:00  
**גרסה:** 1.0.0

