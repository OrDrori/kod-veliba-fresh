import fs from "fs";
import path from "path";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  crm: router({
    list: publicProcedure.query(async () => {
      const { getAllCRMClients } = await import("./db");
      return await getAllCRMClients();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createCRMClient } = await import("./db");
      return await createCRMClient(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateCRMClient } = await import("./db");
      const { id, ...data } = input;
      await updateCRMClient(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteCRMClient } = await import("./db");
      await deleteCRMClient(input.id);
      return { success: true };
    }),
  }),

  clientTasks: router({
    list: publicProcedure.query(async () => {
      const { getAllClientTasks } = await import("./db");
      return await getAllClientTasks();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createClientTask } = await import("./db");
      return await createClientTask(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateClientTask } = await import("./db");
      const { id, ...data } = input;
      await updateClientTask(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteClientTask } = await import("./db");
      await deleteClientTask(input.id);
      return { success: true };
    }),
  }),

  billing: router({
    list: publicProcedure.query(async () => {
      const { getAllBillingCharges } = await import("./db");
      return await getAllBillingCharges();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createBillingCharge } = await import("./db");
      return await createBillingCharge(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateBillingCharge } = await import("./db");
      const { id, ...data } = input;
      await updateBillingCharge(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteBillingCharge } = await import("./db");
      await deleteBillingCharge(input.id);
      return { success: true };
    }),
  }),

  designTasks: router({
    list: publicProcedure.query(async () => {
      const { getDesignTasks } = await import("./db");
      return await getDesignTasks();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createDesignTask } = await import("./db");
      return await createDesignTask(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateDesignTask } = await import("./db");
      const { id, ...data } = input;
      await updateDesignTask(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteDesignTask } = await import("./db");
      await deleteDesignTask(input.id);
      return { success: true };
    }),
  }),

  websiteProjects: router({
    list: publicProcedure.query(async () => {
      const { getWebsiteProjects } = await import("./db");
      return await getWebsiteProjects();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createWebsiteProject } = await import("./db");
      return await createWebsiteProject(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateWebsiteProject } = await import("./db");
      const { id, ...data } = input;
      await updateWebsiteProject(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteWebsiteProject } = await import("./db");
      await deleteWebsiteProject(input.id);
      return { success: true };
    }),
  }),

  contacts: router({
    list: publicProcedure.query(async () => {
      const { getContacts } = await import("./db");
      return await getContacts();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createContact } = await import("./db");
      return await createContact(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateContact } = await import("./db");
      const { id, ...data } = input;
      await updateContact(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteContact } = await import("./db");
      await deleteContact(input.id);
      return { success: true };
    }),
  }),

  leads: router({
    list: publicProcedure.query(async () => {
      const { getLeads } = await import("./db");
      return await getLeads();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createLead } = await import("./db");
      return await createLead(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateLead } = await import("./db");
      const { id, ...data } = input;
      await updateLead(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteLead } = await import("./db");
      await deleteLead(input.id);
      return { success: true };
    }),
  }),

  systemImprovements: router({
    list: publicProcedure.query(async () => {
      const { getAllSystemImprovements } = await import("./db");
      return await getAllSystemImprovements();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createSystemImprovement } = await import("./db");
      return await createSystemImprovement(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateSystemImprovement } = await import("./db");
      const { id, ...data } = input;
      await updateSystemImprovement(id, data);
      return { success: true };
    }),
    updateCheckbox: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateSystemImprovementCheckbox } = await import("./db");
      const { id, checkboxId, checked } = input;
      await updateSystemImprovementCheckbox(id, checkboxId, checked);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteSystemImprovement } = await import("./db");
      await deleteSystemImprovement(input.id);
      return { success: true };
    }),
  }),

  growSites: router({
    list: publicProcedure.query(async () => {
      const { getAllGrowSites } = await import("./db");
      return await getAllGrowSites();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createGrowSite } = await import("./db");
      return await createGrowSite(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateGrowSite } = await import("./db");
      const { id, ...data } = input;
      await updateGrowSite(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteGrowSite } = await import("./db");
      await deleteGrowSite(input.id);
      return { success: true };
    }),
  }),

  paymentCollection: router({
    list: publicProcedure.query(async () => {
      const { getAllPaymentCollection } = await import("./db");
      return await getAllPaymentCollection();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createPaymentCollection } = await import("./db");
      return await createPaymentCollection(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updatePaymentCollection } = await import("./db");
      const { id, ...data } = input;
      await updatePaymentCollection(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deletePaymentCollection } = await import("./db");
      await deletePaymentCollection(input.id);
      return { success: true };
    }),
  }),

  deals: router({
    list: publicProcedure.query(async () => {
      const { getAllDeals } = await import("./db");
      return await getAllDeals();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createDeal } = await import("./db");
      return await createDeal(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateDeal } = await import("./db");
      const { id, ...data } = input;
      await updateDeal(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteDeal } = await import("./db");
      await deleteDeal(input.id);
      return { success: true };
    }),
  }),

  employees: router({
    list: publicProcedure.query(async () => {
      const { getAllEmployees } = await import("./db");
      return await getAllEmployees();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createEmployee } = await import("./db");
      return await createEmployee(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateEmployee } = await import("./db");
      const { id, ...data } = input;
      await updateEmployee(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteEmployee } = await import("./db");
      await deleteEmployee(input.id);
      return { success: true };
    }),
  }),

  timeEntries: router({
    list: publicProcedure.query(async () => {
      const { getAllTimeEntries } = await import("./db");
      return await getAllTimeEntries();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createTimeEntry } = await import("./db");
      return await createTimeEntry(input);
    }),
    update: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateTimeEntry } = await import("./db");
      const { id, ...data } = input;
      await updateTimeEntry(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteTimeEntry } = await import("./db");
      await deleteTimeEntry(input.id);
      return { success: true };
    }),
    startTimer: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { startTimer } = await import("./db");
      return await startTimer(input);
    }),
    stopTimer: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { stopTimer } = await import("./db");
      return await stopTimer(input.id);
    }),
  }),

  ai: router({
    chat: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { chatWithAI } = await import("./ai");
      return await chatWithAI(input);
    }),
    history: publicProcedure.input((val: any) => val).query(async ({ input }) => {
      const { getConversationHistory } = await import("./ai");
      return await getConversationHistory(input.conversationId);
    }),
    conversations: publicProcedure.input((val: any) => val).query(async ({ input }) => {
      const { getEmployeeConversations } = await import("./ai");
      return await getEmployeeConversations(input.employeeId);
    }),
  }),

  notifications: router({
    list: publicProcedure.query(async () => {
      const { getAllNotifications } = await import("./db");
      return await getAllNotifications();
    }),
    unread: publicProcedure.query(async () => {
      const { getUnreadNotifications } = await import("./db");
      return await getUnreadNotifications();
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createNotification } = await import("./db");
      return await createNotification(input);
    }),
    markAsRead: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { markNotificationAsRead } = await import("./db");
      await markNotificationAsRead(input.id);
      return { success: true };
    }),
    markAllAsRead: publicProcedure.mutation(async () => {
      const { markAllNotificationsAsRead } = await import("./db");
      await markAllNotificationsAsRead();
      return { success: true };
    }),
    delete: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteNotification } = await import("./db");
      await deleteNotification(input.id);
      return { success: true };
    }),
  }),

  icount: router({
    invoices: publicProcedure.query(async () => {
      const filePath = path.join(process.cwd(), "..", "icount_invoices_data.json");
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }),
    retainers: publicProcedure.query(async () => {
      const filePath = path.join(process.cwd(), "..", "icount_retainers_data.json");
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }),
    debtors: publicProcedure.query(async () => {
      const filePath = path.join(process.cwd(), "..", "icount_debtors_data.json");
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }),
    merged: publicProcedure.query(async () => {
      const filePath = path.join(process.cwd(), "merged_accounting_data.json");
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }),
  }),
});

export type AppRouter = typeof appRouter;
