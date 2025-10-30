import { date, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// CRM Board - מקור אמת מרכזי
export const crmClients = mysqlTable("crm_clients", {
  id: int("id").autoincrement().primaryKey(),
  mondayId: varchar("monday_id", { length: 50 }).unique(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  idNotes: text("id_notes"), // הערות ת.ז
  businessType: mysqlEnum("business_type", ["retainer", "hourly", "bank", "project", "one_time"]).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "potential", "missing_details"]).default("active").notNull(),
  monthlyRetainer: int("monthly_retainer"),
  hourlyRate: int("hourly_rate"),
  hourlyRateSeparate: int("hourly_rate_separate"), // תעריף שעתי נפרד
  currency: varchar("currency", { length: 10 }).default("ILS"), // מטבע (ILS, USD, EUR)
  startDate: timestamp("start_date"), // תאריך התחלה
  chatLink: varchar("chat_link", { length: 500 }), // צ'אט
  flag: varchar("flag", { length: 50 }), // דגל
  projectsLink: text("projects_link"), // פרויקטים (JSON array)
  contractMonths: int("contract_months"), // מספר חודשים / שנות חוזה
  billingLink: text("billing_link"), // גבייה ותשלומים (JSON array)
  automate: varchar("automate", { length: 100 }), // Automate
  files: text("files"), // קבצים (JSON array)
  lastUpdateDate: timestamp("last_update_date"), // יום עדכון אחרון
  lastUpdateBy: varchar("last_update_by", { length: 255 }), // מאת
  changeLog: text("change_log"), // לוג שינויים
  previousStatus: varchar("previous_status", { length: 100 }), // סטטוס אחרון
  previousStatusDate: timestamp("previous_status_date"), // תאריך סטטוס אחרון
  billingNotes: text("billing_notes"), // הערות לגבייה
  tasksLink: text("tasks_link"), // link to משימות לקוח (JSON array)
  projectsLink2: text("projects_link2"), // link to פרוייקט (JSON array)
  bankHours: int("bank_hours"),
  usedHours: int("used_hours").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Tasks Board - משימות לקוח
export const clientTasks = mysqlTable("client_tasks", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("client_id"),
  taskName: varchar("task_name", { length: 500 }).notNull(),
  subitemSupport: text("subitem_support"), // Subitem - subitems (JSON array)
  owner: varchar("owner", { length: 255 }), // Owner - בעלים
  groupName: varchar("group_name", { length: 255 }), // קבוצה
  taskType: mysqlEnum("task_type", ["development", "design", "support", "meeting", "other"]),
  description: text("description"), // תיאור
  techNotes: text("tech_notes"), // Tech Notes
  status: mysqlEnum("status", ["todo", "in_progress", "review", "done", "blocked", "missing_details"]).default("todo").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  timelineStart: timestamp("timeline_start"), // Timeline - התחלה
  timelineEnd: timestamp("timeline_end"), // Timeline - סיום
  duration: int("duration"), // Duration
  estimatedHours: int("estimated_hours"),
  actualHours: int("actual_hours"),
  files: text("files"), // Files (JSON array)
  dependency: text("dependency"), // Dependency (JSON array)
  automate: varchar("automate", { length: 100 }), // Automate
  files2: text("files2"), // קבצים 2 (JSON array)
  updateDate: timestamp("update_date"), // תאריך עדכון
  updatedBy: varchar("updated_by", { length: 255 }), // מאת
  changeLog: text("change_log"), // לוג שינויים
  previousStatus: varchar("previous_status", { length: 100 }), // סטטוס אחרון
  previousStatusDate: timestamp("previous_status_date"), // תאריך סטטוס אחרון
  crmLink: text("crm_link"), // link to ניהול לקוחות (JSON array)
  assignedTo: varchar("assigned_to", { length: 255 }),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  billable: mysqlEnum("billable", ["yes", "no", "included"]).default("yes").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Billing Board - גבייה וחיובים
export const billingCharges = mysqlTable("billing_charges", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("client_id"),
  taskId: int("task_id"),
  chargeType: mysqlEnum("charge_type", ["retainer", "hourly", "bank", "project", "one_time"]).notNull(),
  amount: int("amount").notNull(),
  hours: int("hours"),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "invoiced", "paid", "cancelled", "missing_details"]).default("pending").notNull(),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  invoiceDate: timestamp("invoice_date"),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  files: text("files"), // JSON array of file URLs/paths
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Leads Board - לידים
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  leadName: varchar("lead_name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  phone2: varchar("phone2", { length: 50 }), // טלפון 2
  source: varchar("source", { length: 100 }),
  interestedIn: text("interested_in"), // התעניין ב
  entryDate: timestamp("entry_date"), // נכנס בתאריך
  flag: varchar("flag", { length: 50 }), // דאגל
  focus: text("focus"), // תמקוד
  insight: text("insight"), // תובנה
  status: mysqlEnum("status", ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost", "missing_details"]).default("new").notNull(),
  estimatedValue: int("estimated_value"),
  notes: text("notes"),
  convertedToClientId: int("converted_to_client_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Contacts Board - אנשי קשר
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  chatLink: varchar("chat_link", { length: 500 }), // צ'אט
  whatsapp: varchar("whatsapp", { length: 50 }), // וואטס אפ
  whatsappWeb: varchar("whatsapp_web", { length: 500 }), // וואטסאפ ווב
  flag: varchar("flag", { length: 50 }), // דגל
  company: varchar("company", { length: 255 }),
  companyLink: varchar("company_link", { length: 500 }), // קישור לחברה
  websiteLink: text("website_link"), // Website (JSON array)
  position: varchar("position", { length: 255 }),
  position2: varchar("position2", { length: 255 }), // תפקיד 2
  mirror: text("mirror"), // שיקוף
  projectLink: text("project_link"), // link to פרוייקט (JSON array)
  projectLink2: text("project_link2"), // link to פרוייקט 2 (JSON array)
  automate: varchar("automate", { length: 100 }), // Automate
  accounts: text("accounts"), // Accounts
  listDropdown: varchar("list_dropdown", { length: 255 }), // רשימה
  mirror2: text("mirror2"), // שיקוף 2
  crmLink: text("crm_link"), // link to ניהול לקוחות (JSON array)
  clientId: int("client_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Design Tasks Board - משימות עיצוב
export const designTasks = mysqlTable("design_tasks", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("client_id"),
  taskName: varchar("task_name", { length: 500 }).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(), // Priority
  designType: mysqlEnum("design_type", ["logo", "banner", "ui", "mockup", "other"]),
  status: mysqlEnum("status", ["todo", "in_progress", "review", "approved", "done", "missing_details"]).default("todo").notNull(),
  description: text("description"), // Description - תיאור מפורט
  briefDescription: varchar("brief_description", { length: 500 }), // Brief Description
  timeTracking: int("time_tracking"), // Time tracking
  assetFiles: text("asset_files"), // Asset Files (JSON array)
  briefId: varchar("brief_id", { length: 100 }), // Brief ID
  creationLog: text("creation_log"), // Creation log
  workFigma: varchar("work_figma", { length: 500 }), // Work Figma
  mirror: text("mirror"), // Mirror
  assignedTo: varchar("assigned_to", { length: 255 }),
  dueDate: timestamp("due_date"),
  fileUrl: varchar("file_url", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Website Board - פרויקטי אתרים
export const websiteProjects = mysqlTable("website_projects", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("client_id"),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  projectType: mysqlEnum("project_type", ["wordpress", "custom", "ecommerce", "landing", "other"]),
  status: mysqlEnum("status", ["planning", "design", "development", "testing", "live", "maintenance", "missing_details"]).default("planning").notNull(),
  url: varchar("url", { length: 500 }),
  login: varchar("login", { length: 500 }), // Login - קישור להתחברות
  username: varchar("username", { length: 255 }), // Username - שם משתמש
  password: varchar("password", { length: 255 }), // Password - סיסמה
  loginOther: text("login_other"), // Login other - פרטי התחברות נוספים
  copyDetails: text("copy_details"), // Copy details - העתקת פרטים
  contactsLink: text("contacts_link"), // Contacts - אנשי קשר (JSON array)
  helperHttp: varchar("helper_http", { length: 500 }), // הלפר / http
  yat: varchar("yat", { length: 255 }), // יאט
  tasksLink: text("tasks_link"), // משימות (JSON array)
  creationLog: text("creation_log"), // Creation log
  launchDate: timestamp("launch_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Grow sites Board - ניהול אתרים
export const growSites = mysqlTable("grow_sites", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  owner: varchar("owner", { length: 255 }),
  status: mysqlEnum("status", ["planning", "design", "development", "testing", "live", "maintenance", "paused", "missing_details"]).default("planning").notNull(),
  timelineStart: date("timeline_start"),
  timelineEnd: date("timeline_end"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  clientId: int("client_id"),
  siteType: varchar("site_type", { length: 100 }), // תדמית/חנות/אפליקציה
  technology: varchar("technology", { length: 255 }), // WordPress/React/וכו'
  url: varchar("url", { length: 500 }),
  notes: text("notes"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  hoursSpent: decimal("hours_spent", { precision: 10, scale: 2 }),
  revenue: decimal("revenue", { precision: 12, scale: 2 }),
  files: text("files"), // JSON array
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Tasks New Board - משימות חדשות
export const tasksNew = mysqlTable("tasks_new", {
  id: int("id").autoincrement().primaryKey(),
  taskName: varchar("task_name", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["new", "assigned", "in_progress", "done", "missing_details"]).default("new").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  assignedTo: varchar("assigned_to", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CRMClient = typeof crmClients.$inferSelect;
export type ClientTask = typeof clientTasks.$inferSelect;
export type BillingCharge = typeof billingCharges.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type DesignTask = typeof designTasks.$inferSelect;
export type WebsiteProject = typeof websiteProjects.$inferSelect;
export type TaskNew = typeof tasksNew.$inferSelect;
export type GrowSite = typeof growSites.$inferSelect;
export type InsertGrowSite = typeof growSites.$inferInsert;

// Deals Board - שאקוזות/עסקאות
export const deals = mysqlTable("deals", {
  id: int("id").autoincrement().primaryKey(),
  dealName: varchar("deal_name", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["active", "won", "lost", "pending", "missing_details"]).default("active").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }), // ערך העסקה
  currency: varchar("currency", { length: 10 }).default("ILS"),
  client: varchar("client", { length: 255 }), // לקוח
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  source: varchar("source", { length: 100 }), // מקור
  stage: varchar("stage", { length: 100 }), // שלב
  probability: int("probability"), // הסתברות (0-100%)
  expectedCloseDate: date("expected_close_date"),
  actualCloseDate: date("actual_close_date"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  team: varchar("team", { length: 255 }),
  notes: text("notes"),
  tags: text("tags"), // JSON array
  files: text("files"), // JSON array
  nextAction: text("next_action"),
  lastContact: timestamp("last_contact"),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Payment Collection Board - גבייה
export const paymentCollection = mysqlTable("payment_collection", {
  id: int("id").autoincrement().primaryKey(),
  item: varchar("item", { length: 500 }).notNull(),
  subitem: varchar("subitem", { length: 500 }),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  targetDate: date("target_date"),
  paymentDate: date("payment_date"),
  dateDiff: int("date_diff"), // הפרש תאריכים
  collectionStatus: mysqlEnum("collection_status", ["pending", "in_progress", "collected", "overdue"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("payment_status", ["not_paid", "partial", "paid", "cancelled"]).default("not_paid").notNull(),
  documents: text("documents"), // JSON array
  link: varchar("link", { length: 500 }),
  notes: text("notes"),
  tags: text("tags"), // JSON array
  account: varchar("account", { length: 255 }), // חשבון
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  contacts: text("contacts"), // JSON array
  website: varchar("website", { length: 500 }),
  currency: varchar("currency", { length: 10 }).default("ILS"),
  amountILS: decimal("amount_ils", { precision: 12, scale: 2 }), // סכום בש"ח
  automation: text("automation"),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// System Improvements Board - שיפורים ועדכוני מערכת
export const systemImprovements = mysqlTable("system_improvements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["feature", "bug", "improvement", "task"]).notNull(),
  phase: varchar("phase", { length: 100 }),
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "testing", "done", "blocked", "missing_details"]).default("todo").notNull(),
  assignedTo: varchar("assigned_to", { length: 255 }),
  estimatedHours: int("estimated_hours"),
  actualHours: int("actual_hours"),
  relatedFiles: text("related_files"), // JSON array
  relatedBoards: text("related_boards"), // JSON array
  checkboxes: text("checkboxes"), // JSON array of {id, text, checked}
  completedCheckboxes: int("completed_checkboxes").default(0),
  totalCheckboxes: int("total_checkboxes").default(0),
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

export type PaymentCollection = typeof paymentCollection.$inferSelect;
export type InsertPaymentCollection = typeof paymentCollection.$inferInsert;

export type SystemImprovement = typeof systemImprovements.$inferSelect;
export type InsertSystemImprovement = typeof systemImprovements.$inferInsert;
// Employees Board - עובדים
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  idNumber: varchar("id_number", { length: 20 }), // תעודת זהות
  role: varchar("role", { length: 100 }), // תפקיד
  department: mysqlEnum("department", ["development", "design", "management", "sales", "support", "other"]),
  employmentType: mysqlEnum("employment_type", ["full_time", "part_time", "contractor", "freelancer"]).default("full_time").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "on_leave", "missing_details"]).default("active").notNull(),
  startDate: date("start_date"), // תאריך תחילת עבודה
  endDate: date("end_date"), // תאריך סיום (אם רלוונטי)
  monthlySalary: int("monthly_salary"), // משכורת חודשית
  hourlyRate: int("hourly_rate"), // תעריף שעתי
  bankAccount: varchar("bank_account", { length: 100 }), // פרטי חשבון בנק
  taxId: varchar("tax_id", { length: 50 }), // מספר עוסק מורשה
  address: text("address"), // כתובת
  emergencyContact: varchar("emergency_contact", { length: 255 }), // איש קשר לחירום
  emergencyPhone: varchar("emergency_phone", { length: 50 }), // טלפון חירום
  skills: text("skills"), // מיומנויות (JSON array)
  certifications: text("certifications"), // הסמכות (JSON array)
  projects: text("projects"), // פרויקטים (JSON array - links to projects)
  performanceReviews: text("performance_reviews"), // ביקורות ביצועים (JSON array)
  vacationDays: int("vacation_days").default(0), // ימי חופשה שנתיים
  usedVacationDays: int("used_vacation_days").default(0), // ימי חופשה מנוצלים
  sickDays: int("sick_days").default(0), // ימי מחלה
  notes: text("notes"),
  avatar: varchar("avatar", { length: 500 }), // קישור לתמונת פרופיל
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// Time Entries - מעקב זמן
export const timeEntries = mysqlTable("time_entries", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id"), // קישור לעובד
  clientId: int("client_id"), // קישור ללקוח
  taskId: int("task_id"), // קישור למשימה
  projectId: int("project_id"), // קישור לפרויקט
  description: text("description"), // תיאור העבודה
  startTime: timestamp("start_time").notNull(), // זמן התחלה
  endTime: timestamp("end_time"), // זמן סיום
  duration: int("duration"), // משך בדקות (מחושב אוטומטית)
  status: mysqlEnum("status", ["running", "paused", "completed", "missing_details"]).default("completed").notNull(),
  billable: mysqlEnum("billable", ["yes", "no", "included"]).default("yes").notNull(),
  hourlyRate: int("hourly_rate"), // תעריף שעתי לרשומה זו
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }), // סכום כולל (מחושב)
  tags: text("tags"), // תגיות (JSON array)
  notes: text("notes"),
  invoiceId: int("invoice_id"), // קישור לחשבונית (אם חויב)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;

// Notifications - התראות
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["task", "payment", "deadline", "system", "employee", "client"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  relatedId: int("related_id"), // ID של הפריט הקשור
  relatedType: varchar("related_type", { length: 50 }), // סוג הפריט (task, client, etc)
  actionUrl: varchar("action_url", { length: 500 }), // קישור לפעולה
  isRead: mysqlEnum("is_read", ["yes", "no"]).default("no").notNull(),
  userId: int("user_id"), // למי ההתראה (אם רלוונטי)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
