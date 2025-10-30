# 🔍 ניתוח מפורט - 4 בורדים קריטיים

**תאריך:** 28 אוקטובר 2025  
**מקור:** Monday.com API (Read-Only)  
**מטרה:** Phase 2 - הוספת 4 בורדים קריטיים למערכת

---

## 📊 סיכום כללי

| # | בורד | Items | Columns | עדיפות | סטטוס במערכת |
|---|------|-------|---------|--------|--------------|
| 1 | **Grow sites** | 1,571 | 17 | 🔴 קריטי | ❌ לא קיים |
| 2 | **Payment Collection** | 168 | 21 | 🔴 קריטי | ⚠️ טבלה קיימת, אין UI |
| 3 | **Tasks - New** | 100 | 30 | 🔴 קריטי | ❌ לא קיים |
| 4 | **Deals (עסקאות)** | 208 | 22 | 🔴 קריטי | ⚠️ טבלה קיימת, אין UI |

**סה"כ:** 2,047 items, 90 עמודות חדשות

---

## 1️⃣ **Grow sites** - הבורד הכי גדול!

### **מידע כללי:**
- 📊 **Items:** 1,571 (הבורד הכי גדול במערכת!)
- 📋 **עמודות:** 17
- 🎯 **מטרה:** ניהול אתרים שהחברה מפתחת/מנהלת
- 🔗 **Subitems:** 5 items

---

### **17 עמודות:**

| # | שם העמודה | טיפוס | הערות |
|---|-----------|-------|-------|
| 1 | **Name** | name | שם האתר/פרויקט |
| 2 | **Subitems** | subtasks | תתי-משימות |
| 3 | **Owner** | people | בעלים/אחראי |
| 4 | **סטטוס** | status | סטטוס הפרויקט |
| 5 | **ציר זמן** | timeline | תאריכי התחלה וסיום |
| 6 | **Priority** | status | עדיפות |
| 7 | **Files** | file | קבצים מצורפים |
| 8 | **לקוח** | board-relation | קישור לבורד CRM |
| 9 | **סוג אתר** | status | תדמית/חנות/אפליקציה |
| 10 | **טכנולוגיה** | text | WordPress/React/וכו' |
| 11 | **URL** | link | כתובת האתר |
| 12 | **Last updated** | last-updated | עדכון אחרון |
| 13 | **Creation log** | creation-log | תאריך יצירה |
| 14 | **Notes** | long-text | הערות |
| 15 | **Budget** | numeric | תקציב |
| 16 | **Hours spent** | numeric | שעות שהושקעו |
| 17 | **Revenue** | formula | הכנסה (Budget - Hours*Rate) |

---

### **Schema MySQL:**

```sql
CREATE TABLE grow_sites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner VARCHAR(255),
  status VARCHAR(50),
  timeline_start DATE,
  timeline_end DATE,
  priority VARCHAR(50),
  client_id INT,
  site_type VARCHAR(50),
  technology VARCHAR(255),
  url VARCHAR(500),
  notes TEXT,
  budget DECIMAL(10,2),
  hours_spent DECIMAL(10,2),
  revenue DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES crm_clients(id)
);
```

---

### **תכנית יישום:**

#### **Backend (1.5 שעות):**
1. ✅ הוספת schema ל-`drizzle/schema.ts` (30 דקות)
2. ✅ `pnpm db:push` (5 דקות)
3. ✅ פונקציות ב-`server/db.ts`: (30 דקות)
   - `getAllGrowSites()`
   - `getGrowSiteById(id)`
   - `createGrowSite(data)`
   - `updateGrowSite(id, data)`
   - `deleteGrowSite(id)`
4. ✅ Router ב-`server/routers.ts` (25 דקות)

#### **Frontend (1.5 שעות):**
1. ✅ יצירת `BoardGrowSites.tsx` (1 שעה)
   - טבלה עם MondayTable
   - דיאלוגים Add/Edit/Delete
   - Info Bubble
2. ✅ הוספה ל-`App.tsx` (10 דקות)
3. ✅ הוספה ל-`MondaySidebar.tsx` תחת "פרויקטים" (10 דקות)
4. ✅ ייבוא 5-10 דוגמאות נתונים (10 דקות)

**סה"כ:** 3 שעות

---

## 2️⃣ **Payment Collection 📑** - ניהול גבייה

### **מידע כללי:**
- 📊 **Items:** 168
- 📋 **עמודות:** 21
- 🎯 **מטרה:** מעקב אחר תשלומים וגבייה
- 🔗 **Subitems:** 555 items (הרבה!)
- ⚠️ **טבלה כבר קיימת** במערכת!

---

### **21 עמודות:**

| # | שם העמודה | טיפוס | הערות |
|---|-----------|-------|-------|
| 1 | **Name** | name | שם החיוב |
| 2 | **Subitems** | subtasks | תתי-פריטים |
| 3 | **סטטוס גבייה** | status | שולם/ממתין/באיחור |
| 4 | **לקוח** | board-relation | קישור ל-CRM |
| 5 | **סכום** | numeric | סכום לגבייה |
| 6 | **תאריך חיוב** | date | מתי לחייב |
| 7 | **תאריך תשלום** | date | מתי שולם בפועל |
| 8 | **אמצעי תשלום** | status | העברה/צ'ק/כרטיס |
| 9 | **חשבונית** | text | מספר חשבונית |
| 10 | **קובץ חשבונית** | file | PDF של החשבונית |
| 11 | **הערות** | long-text | הערות |
| 12 | **Owner** | people | אחראי גבייה |
| 13 | **Priority** | status | עדיפות |
| 14 | **ימים באיחור** | formula | Days(Today - Due Date) |
| 15 | **סטטוס מייל** | status | נשלח/לא נשלח |
| 16 | **תזכורת** | date | תאריך תזכורת |
| 17 | **פרויקט** | board-relation | קישור לפרויקט |
| 18 | **Creation log** | creation-log | תאריך יצירה |
| 19 | **Last updated** | last-updated | עדכון אחרון |
| 20 | **קישור לעסקה** | board-relation | קישור ל-Deals |
| 21 | **סוג חיוב** | status | חד-פעמי/חודשי/שנתי |

---

### **Schema MySQL:**

```sql
CREATE TABLE payment_collection (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50),
  client_id INT,
  amount DECIMAL(10,2),
  due_date DATE,
  payment_date DATE,
  payment_method VARCHAR(50),
  invoice_number VARCHAR(100),
  notes TEXT,
  owner VARCHAR(255),
  priority VARCHAR(50),
  days_overdue INT,
  email_status VARCHAR(50),
  reminder_date DATE,
  project_id INT,
  deal_id INT,
  charge_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES crm_clients(id),
  FOREIGN KEY (deal_id) REFERENCES deals(id)
);
```

---

### **תכנית יישום:**

#### **Backend (1 שעה):**
1. ✅ עדכון schema ב-`drizzle/schema.ts` (20 דקות)
2. ✅ `pnpm db:push` (5 דקות)
3. ✅ פונקציות ב-`server/db.ts` (20 דקות)
4. ✅ Router ב-`server/routers.ts` (15 דקות)

#### **Frontend (2 שעות):**
1. ✅ יצירת `BoardPaymentCollection.tsx` (1.5 שעות)
   - טבלה עם MondayTable
   - דיאלוגים Add/Edit/Delete
   - Info Bubble
   - KPI Cards (סה"כ לגבייה, באיחור, שולם)
2. ✅ הוספה ל-`App.tsx` ו-`MondaySidebar.tsx` (10 דקות)
3. ✅ ייבוא דוגמאות נתונים (20 דקות)

**סה"כ:** 3 שעות

---

## 3️⃣ **📋 Tasks - New** - מערכת משימות מתקדמת

### **מידע כללי:**
- 📊 **Items:** 100
- 📋 **עמודות:** 30 (הכי הרבה!)
- 🎯 **מטרה:** ניהול משימות מתקדם עם מעקב זמן וחיוב
- 🔗 **Subitems:** 468 items (הרבה!)

---

### **30 עמודות:**

| # | שם העמודה | טיפוס | הערות |
|---|-----------|-------|-------|
| 1 | **Name** | name | שם המשימה |
| 2 | **Subitems** | subtasks | תתי-משימות |
| 3 | **Owner** | people | אחראי |
| 4 | **🌐 Website** | board-relation | קישור לאתר |
| 5 | **סטטוס משימה** | status | סטטוס |
| 6 | **ציר זמן - צפוי** | timeline | תאריכים |
| 7 | **משך ימים** | numeric | כמה ימים |
| 8 | **Priority** | status | עדיפות |
| 9 | **Files** | file | קבצים |
| 10 | **סוג אייטם** | status | פיתוח/עיצוב/תוכן |
| 11 | **מעקב התקדמות** | mirror | מראה מבורד אחר |
| 12 | **Creation log** | creation-log | תאריך יצירה |
| 13 | **משך זמן** | mirror | מראה |
| 14 | **שם לקוח** | board-relation | קישור ל-CRM |
| 15 | **יתרת בנק שעות** | mirror | מראה |
| 16 | **תעריף שעתי** | mirror | מראה |
| 17 | **סכום לחיוב (שעתי)** | formula | Hours * Rate |
| 18 | **סוג חיוב סופי** | status | שעתי/קבוע |
| 19 | **שעות בפועל** | numeric | שעות שעבדו |
| 20 | **סטטוס גביה (?)** | status | חויב/לא חויב |
| 21 | **אייטם מבורד לקוח** | text | קישור |
| 22 | **עודכן לאחרונה** | last-updated | עדכון אחרון |
| 23 | **בריאות פרויקט** | status | ירוק/צהוב/אדום |
| 24 | **מסמכי פרויקט** | file | מסמכים |
| 25 | **שלב פרויקט** | status | שלב |
| 26 | **סטטוס מייל** | status | נשלח/לא |
| 27 | **מזהה מייל** | text | ID |
| 28 | **monday Doc v2** | direct-doc | מסמך |
| 29 | **Time tracking** | time-tracking | מעקב זמן |
| 30 | **נסגר בתאריך** | date | תאריך סגירה |

---

### **Schema MySQL:**

```sql
CREATE TABLE tasks_new (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner VARCHAR(255),
  website_id INT,
  status VARCHAR(50),
  timeline_start DATE,
  timeline_end DATE,
  duration_days INT,
  priority VARCHAR(50),
  item_type VARCHAR(50),
  client_id INT,
  hourly_rate DECIMAL(10,2),
  billing_amount DECIMAL(10,2),
  billing_type VARCHAR(50),
  actual_hours DECIMAL(10,2),
  billing_status VARCHAR(50),
  project_health VARCHAR(50),
  project_stage VARCHAR(50),
  email_status VARCHAR(50),
  email_id VARCHAR(255),
  closed_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES crm_clients(id),
  FOREIGN KEY (website_id) REFERENCES grow_sites(id)
);
```

---

### **תכנית יישום:**

#### **Backend (2 שעות):**
1. ✅ הוספת schema ל-`drizzle/schema.ts` (45 דקות)
2. ✅ `pnpm db:push` (5 דקות)
3. ✅ פונקציות ב-`server/db.ts` (40 דקות)
4. ✅ Router ב-`server/routers.ts` (30 דקות)

#### **Frontend (2 שעות):**
1. ✅ יצירת `BoardTasksNew.tsx` (1.5 שעות)
   - טבלה עם MondayTable (30 עמודות!)
   - דיאלוגים Add/Edit/Delete
   - Info Bubble
   - Time Tracking integration
2. ✅ הוספה ל-`App.tsx` ו-`MondaySidebar.tsx` (10 דקות)
3. ✅ ייבוא דוגמאות נתונים (20 דקות)

**סה"כ:** 4 שעות

---

## 4️⃣ **עסקאות 💲 (Deals)** - ניהול עסקאות

### **מידע כללי:**
- 📊 **Items:** 208
- 📋 **עמודות:** 22
- 🎯 **מטרה:** ניהול pipeline מכירות
- 🔗 **Subitems:** 276 items
- ⚠️ **טבלה כבר קיימת** במערכת!

---

### **22 עמודות:**

| # | שם העמודה | טיפוס | הערות |
|---|-----------|-------|-------|
| 1 | **Name** | name | שם העסקה |
| 2 | **Subitems** | subtasks | תתי-פריטים |
| 3 | **שלב** | status | ליד/הצעה/משא ומתן/נסגר |
| 4 | **📞 אנשי קשר** | board-relation | קישור לאנשי קשר |
| 5 | **יועץ** | people | מי מטפל |
| 6 | **שעות** | numeric | כמה שעות |
| 7 | **מחיר שעה** | numeric | תעריף |
| 8 | **שווי עסקה** | formula | Hours * Rate |
| 9 | **סוג עסקה** | text | פיתוח/עיצוב/תמיכה |
| 10 | **ריטיינר** | numeric | שעות ריטיינר |
| 11 | **חודשי ריטיינר** | numeric | כמה חודשים |
| 12 | **שווי ריטיינר** | formula | Retainer * Months * Rate |
| 13 | **בקשת הלקוח** | long-text | מה הלקוח רוצה |
| 14 | **נסגר בתאריך** | date | מתי נסגר |
| 15 | **נוצר בתאריך** | creation-log | תאריך יצירה |
| 16 | **Last updated** | last-updated | עדכון אחרון |
| 17 | **התחייבות בימי עבודה** | numeric | כמה ימים |
| 18 | **💼 Projects** | board-relation | קישור לפרויקטים |
| 19 | **FollowUp Date** | date | תאריך מעקב |
| 20 | **link to ⏰ תזכורות** | board-relation | קישור לתזכורות |
| 21 | **תזכורת חדשה?** | status | כן/לא |
| 22 | **תאריך מעקב** | date | תאריך |

---

### **Schema MySQL:**

```sql
CREATE TABLE deals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  stage VARCHAR(50),
  contact_id INT,
  consultant VARCHAR(255),
  hours DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  deal_value DECIMAL(10,2),
  deal_type VARCHAR(100),
  retainer_hours DECIMAL(10,2),
  retainer_months INT,
  retainer_value DECIMAL(10,2),
  client_request TEXT,
  closed_date DATE,
  commitment_days INT,
  followup_date DATE,
  reminder_date DATE,
  new_reminder VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
```

---

### **תכנית יישום:**

#### **Backend (1 שעה):**
1. ✅ עדכון schema ב-`drizzle/schema.ts` (20 דקות)
2. ✅ `pnpm db:push` (5 דקות)
3. ✅ פונקציות ב-`server/db.ts` (20 דקות)
4. ✅ Router ב-`server/routers.ts` (15 דקות)

#### **Frontend (2 שעות):**
1. ✅ יצירת `BoardDeals.tsx` (1.5 שעות)
   - טבלה עם MondayTable
   - דיאלוגים Add/Edit/Delete
   - Info Bubble
   - Pipeline visualization (אופציונלי)
2. ✅ הוספה ל-`App.tsx` ו-`MondaySidebar.tsx` (10 דקות)
3. ✅ ייבוא דוגמאות נתונים (20 דקות)

**סה"כ:** 3 שעות

---

## 📊 **סיכום Phase 2:**

### **סה"כ זמן משוער:**

| בורד | Backend | Frontend | סה"כ |
|------|---------|----------|------|
| **Grow sites** | 1.5 שעות | 1.5 שעות | 3 שעות |
| **Payment Collection** | 1 שעה | 2 שעות | 3 שעות |
| **Tasks - New** | 2 שעות | 2 שעות | 4 שעות |
| **Deals** | 1 שעה | 2 שעות | 3 שעות |
| **סה"כ** | **5.5 שעות** | **7.5 שעות** | **13 שעות** |

---

### **תוצאה:**
- ✅ **11 בורדים פעילים** (7 קיימים + 4 חדשים)
- ✅ **3,074 items** במערכת (1,027 + 2,047)
- ✅ **255 עמודות** בדאטהבייס (165 + 90)
- ✅ **73% מהבורדים** במערכת
- ✅ **95% מה-items** מכוסים

---

## 🚀 **סדר עבודה מומלץ:**

### **יום 1: Grow sites + Payment Collection** (6 שעות)
1. ✅ Grow sites - Backend (1.5 שעות)
2. ✅ Grow sites - Frontend (1.5 שעות)
3. ✅ Payment Collection - Backend (1 שעה)
4. ✅ Payment Collection - Frontend (2 שעות)

**Checkpoint 1** - 2 בורדים חדשים פעילים

---

### **יום 2: Tasks-New + Deals** (7 שעות)
1. ✅ Tasks-New - Backend (2 שעות)
2. ✅ Tasks-New - Frontend (2 שעות)
3. ✅ Deals - Backend (1 שעה)
4. ✅ Deals - Frontend (2 שעות)

**Checkpoint 2** - כל 4 הבורדים פעילים!

---

### **יום 3: QA + Checkpoint סופי** (2 שעות)
1. ✅ בדיקות מקיפות (1 שעה)
2. ✅ תיקון באגים (30 דקות)
3. ✅ יצירת דוח QA (15 דקות)
4. ✅ Checkpoint סופי (15 דקות)

---

## 📋 **Checklist לכל בורד:**

### **Backend:**
- [ ] הוספת schema ל-`drizzle/schema.ts`
- [ ] `pnpm db:push` הצליח
- [ ] 5 פונקציות ב-`server/db.ts`:
  - [ ] `getAll...()`
  - [ ] `get...ById(id)`
  - [ ] `create...(data)`
  - [ ] `update...(id, data)`
  - [ ] `delete...(id)`
- [ ] Router ב-`server/routers.ts` עם 5 endpoints
- [ ] בדיקה ב-tRPC Playground

### **Frontend:**
- [ ] קומפוננט `Board....tsx` נוצר
- [ ] MondayTable עם כל העמודות
- [ ] דיאלוג Add עובד
- [ ] דיאלוג Edit עובד
- [ ] דיאלוג Delete עובד
- [ ] Info Bubble עם תיאור הבורד
- [ ] Route ב-`App.tsx`
- [ ] פריט ב-`MondaySidebar.tsx`
- [ ] 5-10 דוגמאות נתונים
- [ ] בדיקה בדפדפן

### **QA:**
- [ ] CRUD עובד (Create/Read/Update/Delete)
- [ ] Info Bubble פותח ונסגר
- [ ] כל העמודות מוצגות
- [ ] סינון עובד
- [ ] מיון עובד
- [ ] חיפוש עובד
- [ ] אין שגיאות בקונסול
- [ ] עיצוב Code & Core נשמר

---

**מוכן להתחיל?** 🚀

