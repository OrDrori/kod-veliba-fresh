import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// CRM Clients
export async function getAllCRMClients() {
  const db = await getDb();
  if (!db) return [];
  const { crmClients } = await import("../drizzle/schema");
  return await db.select().from(crmClients);
}

export async function createCRMClient(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { crmClients } = await import("../drizzle/schema");
  const result = await db.insert(crmClients).values(data);
  return result;
}

export async function updateCRMClient(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { crmClients } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(crmClients).set(data).where(eq(crmClients.id, id));
}

export async function deleteCRMClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { crmClients } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.delete(crmClients).where(eq(crmClients.id, id));
}

// Client Tasks
export async function getAllClientTasks() {
  const db = await getDb();
  if (!db) return [];
  const { clientTasks } = await import("../drizzle/schema");
  return await db.select().from(clientTasks);
}

export async function createClientTask(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { clientTasks } = await import("../drizzle/schema");
  return await db.insert(clientTasks).values(data);
}

export async function updateClientTask(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { clientTasks } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(clientTasks).set(data).where(eq(clientTasks.id, id));
}

export async function deleteClientTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { clientTasks } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.delete(clientTasks).where(eq(clientTasks.id, id));
}

// Billing Charges
export async function getAllBillingCharges() {
  const db = await getDb();
  if (!db) return [];
  const { billingCharges } = await import("../drizzle/schema");
  return await db.select().from(billingCharges);
}

export async function createBillingCharge(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { billingCharges } = await import("../drizzle/schema");
  return await db.insert(billingCharges).values(data);
}


export async function updateBillingCharge(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { billingCharges } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(billingCharges).set(data).where(eq(billingCharges.id, id));
}

export async function deleteBillingCharge(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { billingCharges } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.delete(billingCharges).where(eq(billingCharges.id, id));
}



// ===== Leads Functions =====
export async function createLead(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { leads } = await import("../drizzle/schema");
  const [result] = await db.insert(leads).values(data);
  return result;
}

export async function getLeads() {
  const db = await getDb();
  if (!db) return [];
  
  const { leads } = await import("../drizzle/schema");
  return await db.select().from(leads);
}

export async function updateLead(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { leads } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(leads).set(data).where(eq(leads.id, id));
}

export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { leads } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.delete(leads).where(eq(leads.id, id));
}



// ===== Contacts Functions =====
export async function createContact(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { contacts } = await import("../drizzle/schema");
  const [result] = await db.insert(contacts).values(data);
  return result;
}

export async function getContacts() {
  const db = await getDb();
  if (!db) return [];
  
  const { contacts } = await import("../drizzle/schema");
  return await db.select().from(contacts);
}

export async function updateContact(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { contacts } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(contacts).set(data).where(eq(contacts.id, id));
}

export async function deleteContact(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { contacts } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.delete(contacts).where(eq(contacts.id, id));
}



// ===== Design Tasks Functions =====
export async function createDesignTask(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { designTasks } = await import("../drizzle/schema");
  const [result] = await db.insert(designTasks).values(data);
  return result;
}

export async function getDesignTasks() {
  const db = await getDb();
  if (!db) return [];
  
  const { designTasks } = await import("../drizzle/schema");
  return await db.select().from(designTasks);
}

export async function updateDesignTask(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { designTasks } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(designTasks).set(data).where(eq(designTasks.id, id));
}

export async function deleteDesignTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { designTasks } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.delete(designTasks).where(eq(designTasks.id, id));
}

// ===== Website Projects Functions =====
export async function createWebsiteProject(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { websiteProjects } = await import("../drizzle/schema");
  const [result] = await db.insert(websiteProjects).values(data);
  return result;
}

export async function getWebsiteProjects() {
  const db = await getDb();
  if (!db) return [];
  
  const { websiteProjects } = await import("../drizzle/schema");
  return await db.select().from(websiteProjects);
}

export async function updateWebsiteProject(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { websiteProjects } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(websiteProjects).set(data).where(eq(websiteProjects.id, id));
}

export async function deleteWebsiteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { websiteProjects } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.delete(websiteProjects).where(eq(websiteProjects.id, id));
}



// System Improvements
export async function getAllSystemImprovements() {
  const db = await getDb();
  if (!db) return [];
  const { systemImprovements } = await import("../drizzle/schema");
  return await db.select().from(systemImprovements);
}

export async function createSystemImprovement(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { systemImprovements } = await import("../drizzle/schema");
  
  // Calculate checkbox stats if checkboxes provided
  if (data.checkboxes) {
    const checkboxArray = typeof data.checkboxes === 'string' 
      ? JSON.parse(data.checkboxes) 
      : data.checkboxes;
    data.totalCheckboxes = checkboxArray.length;
    data.completedCheckboxes = checkboxArray.filter((cb: any) => cb.checked).length;
    data.checkboxes = JSON.stringify(checkboxArray);
  }
  
  const [result] = await db.insert(systemImprovements).values(data);
  return result;
}

export async function updateSystemImprovement(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { systemImprovements } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  // Calculate checkbox stats if checkboxes provided
  if (data.checkboxes) {
    const checkboxArray = typeof data.checkboxes === 'string' 
      ? JSON.parse(data.checkboxes) 
      : data.checkboxes;
    data.totalCheckboxes = checkboxArray.length;
    data.completedCheckboxes = checkboxArray.filter((cb: any) => cb.checked).length;
    
    // If all checkboxes completed, mark as done
    if (data.completedCheckboxes === data.totalCheckboxes && data.totalCheckboxes > 0) {
      data.status = "done";
      data.completedAt = new Date();
    }
    
    data.checkboxes = JSON.stringify(checkboxArray);
  }
  
  await db.update(systemImprovements).set(data).where(eq(systemImprovements.id, id));
}

export async function deleteSystemImprovement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { systemImprovements } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.delete(systemImprovements).where(eq(systemImprovements.id, id));
}

export async function updateSystemImprovementCheckbox(id: number, checkboxId: string, checked: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { systemImprovements } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  // Get current improvement
  const [improvement] = await db.select().from(systemImprovements).where(eq(systemImprovements.id, id));
  
  if (!improvement) {
    throw new Error("System improvement not found");
  }
  
  // Update checkbox
  const checkboxes = JSON.parse(improvement.checkboxes || "[]");
  const checkboxIndex = checkboxes.findIndex((cb: any) => cb.id === checkboxId);
  
  if (checkboxIndex !== -1) {
    checkboxes[checkboxIndex].checked = checked;
  }
  
  // Recalculate stats
  const completedCheckboxes = checkboxes.filter((cb: any) => cb.checked).length;
  const totalCheckboxes = checkboxes.length;
  
  // Update in database
  await db.update(systemImprovements).set({
    checkboxes: JSON.stringify(checkboxes),
    completedCheckboxes,
    totalCheckboxes,
    status: completedCheckboxes === totalCheckboxes && totalCheckboxes > 0 ? "done" : improvement.status,
    completedAt: completedCheckboxes === totalCheckboxes && totalCheckboxes > 0 ? new Date() : improvement.completedAt,
  }).where(eq(systemImprovements.id, id));
}



// Grow Sites
export async function getAllGrowSites() {
  const db = await getDb();
  if (!db) return [];
  const { growSites } = await import("../drizzle/schema");
  return await db.select().from(growSites);
}

export async function getGrowSiteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { growSites } = await import("../drizzle/schema");
  const result = await db.select().from(growSites).where(eq(growSites.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createGrowSite(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { growSites } = await import("../drizzle/schema");
  const result = await db.insert(growSites).values(data);
  return result;
}

export async function updateGrowSite(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { growSites } = await import("../drizzle/schema");
  await db.update(growSites).set(data).where(eq(growSites.id, id));
  return { success: true };
}

export async function deleteGrowSite(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { growSites } = await import("../drizzle/schema");
  await db.delete(growSites).where(eq(growSites.id, id));
  return { success: true };
}



// Payment Collection
export async function getAllPaymentCollection() {
  const db = await getDb();
  if (!db) return [];
  const { paymentCollection } = await import("../drizzle/schema");
  return await db.select().from(paymentCollection);
}

export async function getPaymentCollectionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { paymentCollection } = await import("../drizzle/schema");
  const result = await db.select().from(paymentCollection).where(eq(paymentCollection.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPaymentCollection(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { paymentCollection } = await import("../drizzle/schema");
  const result = await db.insert(paymentCollection).values(data);
  return result;
}

export async function updatePaymentCollection(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { paymentCollection } = await import("../drizzle/schema");
  await db.update(paymentCollection).set(data).where(eq(paymentCollection.id, id));
  return { success: true };
}

export async function deletePaymentCollection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { paymentCollection } = await import("../drizzle/schema");
  await db.delete(paymentCollection).where(eq(paymentCollection.id, id));
  return { success: true };
}

// Deals
export async function getAllDeals() {
  const db = await getDb();
  if (!db) return [];
  const { deals } = await import("../drizzle/schema");
  return await db.select().from(deals);
}

export async function getDealById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { deals } = await import("../drizzle/schema");
  const result = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createDeal(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { deals } = await import("../drizzle/schema");
  const result = await db.insert(deals).values(data);
  return result;
}

export async function updateDeal(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { deals } = await import("../drizzle/schema");
  await db.update(deals).set(data).where(eq(deals.id, id));
  return { success: true };
}

export async function deleteDeal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { deals } = await import("../drizzle/schema");
  await db.delete(deals).where(eq(deals.id, id));
  return { success: true };
}


// Employees
export async function getAllEmployees() {
  const db = await getDb();
  if (!db) return [];
  const { employees } = await import("../drizzle/schema");
  return await db.select().from(employees);
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { employees } = await import("../drizzle/schema");
  const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createEmployee(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { employees } = await import("../drizzle/schema");
  const result = await db.insert(employees).values(data);
  return result;
}

export async function updateEmployee(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { employees } = await import("../drizzle/schema");
  await db.update(employees).set(data).where(eq(employees.id, id));
  return { success: true };
}

export async function deleteEmployee(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { employees } = await import("../drizzle/schema");
  await db.delete(employees).where(eq(employees.id, id));
  return { success: true };
}

// Time Entries
export async function getAllTimeEntries() {
  const db = await getDb();
  if (!db) return [];
  const { timeEntries } = await import("../drizzle/schema");
  return await db.select().from(timeEntries);
}

export async function getTimeEntryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { timeEntries } = await import("../drizzle/schema");
  const result = await db.select().from(timeEntries).where(eq(timeEntries.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTimeEntry(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { timeEntries } = await import("../drizzle/schema");
  
  // Calculate duration if both start and end times are provided
  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    data.duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60); // minutes
    
    // Calculate total amount if hourly rate is provided
    if (data.hourlyRate) {
      data.totalAmount = (data.duration / 60) * data.hourlyRate;
    }
  }
  
  const result = await db.insert(timeEntries).values(data);
  return result;
}

export async function updateTimeEntry(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { timeEntries } = await import("../drizzle/schema");
  
  // Recalculate duration if times are updated
  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    data.duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
    
    if (data.hourlyRate) {
      data.totalAmount = (data.duration / 60) * data.hourlyRate;
    }
  }
  
  await db.update(timeEntries).set(data).where(eq(timeEntries.id, id));
  return { success: true };
}

export async function deleteTimeEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { timeEntries } = await import("../drizzle/schema");
  await db.delete(timeEntries).where(eq(timeEntries.id, id));
  return { success: true };
}

// Start a new timer
export async function startTimer(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { timeEntries } = await import("../drizzle/schema");
  
  const result = await db.insert(timeEntries).values({
    ...data,
    startTime: new Date(),
    status: "running",
  });
  
  return result;
}

// Stop a running timer
export async function stopTimer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { timeEntries } = await import("../drizzle/schema");
  
  const entry = await getTimeEntryById(id);
  if (!entry) throw new Error("Time entry not found");
  
  const endTime = new Date();
  const startTime = new Date(entry.startTime);
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60);
  
  let totalAmount = null;
  if (entry.hourlyRate) {
    totalAmount = (duration / 60) * entry.hourlyRate;
  }
  
  await db.update(timeEntries).set({
    endTime,
    duration,
    totalAmount,
    status: "completed",
  }).where(eq(timeEntries.id, id));
  
  return { success: true, duration, totalAmount };
}

// Notifications
export async function getAllNotifications() {
  const db = await getDb();
  if (!db) return [];
  const { notifications } = await import("../drizzle/schema");
  return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotifications() {
  const db = await getDb();
  if (!db) return [];
  const { notifications } = await import("../drizzle/schema");
  return await db.select().from(notifications).where(eq(notifications.isRead, "no")).orderBy(desc(notifications.createdAt));
}

export async function createNotification(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { notifications } = await import("../drizzle/schema");
  const result = await db.insert(notifications).values(data);
  return result;
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { notifications } = await import("../drizzle/schema");
  await db.update(notifications).set({
    isRead: "yes",
    readAt: new Date(),
  }).where(eq(notifications.id, id));
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { notifications } = await import("../drizzle/schema");
  await db.update(notifications).set({
    isRead: "yes",
    readAt: new Date(),
  }).where(eq(notifications.isRead, "no"));
  return { success: true };
}

export async function deleteNotification(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { notifications } = await import("../drizzle/schema");
  await db.delete(notifications).where(eq(notifications.id, id));
  return { success: true };
}
