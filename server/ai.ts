import { getDb } from "./db";
import { aiConversations, aiMessages, aiActions, clientTasks, crmClients, employees } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// ============================================
// AI PERSONAL ASSISTANT
// ============================================

/**
 * Chat with AI Assistant
 * @param input - { employeeId, conversationId?, message }
 * @returns { conversationId, message, suggestions }
 */
export async function chatWithAI(input: {
  employeeId: number;
  conversationId?: number;
  message: string;
}) {
  const { employeeId, conversationId, message } = input;
  
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 1. Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const [newConv] = await db.insert(aiConversations).values({
      employeeId,
      title: message.substring(0, 50), // First 50 chars as title
    });
    convId = newConv.insertId;
  }

  // 2. Save user message
  await db.insert(aiMessages).values({
    conversationId: convId,
    role: "user",
    content: message,
  });

  // 3. Get context (RAG - Retrieval Augmented Generation)
  const context = await getContextForQuery(message, employeeId);

  // 4. Generate AI response
  const aiResponse = await generateAIResponse(message, context);

  // 5. Save AI message
  await db.insert(aiMessages).values({
    conversationId: convId,
    role: "assistant",
    content: aiResponse.message,
    metadata: JSON.stringify({
      context: context,
      sources: aiResponse.sources,
    }),
  });

  // 6. Save suggested actions (if any)
  if (aiResponse.actions && aiResponse.actions.length > 0) {
    for (const action of aiResponse.actions) {
      await db.insert(aiActions).values({
        messageId: aiResponse.messageId,
        actionType: action.type,
        actionData: JSON.stringify(action.data),
        status: "pending",
      });
    }
  }

  return {
    conversationId: convId,
    message: aiResponse.message,
    actions: aiResponse.actions || [],
  };
}

/**
 * Get conversation history
 * @param conversationId - ID of conversation
 * @returns Array of messages
 */
export async function getConversationHistory(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const messages = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(aiMessages.createdAt);

  return messages;
}

/**
 * Get all conversations for an employee
 * @param employeeId - ID of employee
 * @returns Array of conversations
 */
export async function getEmployeeConversations(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conversations = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.employeeId, employeeId))
    .orderBy(desc(aiConversations.updatedAt));

  return conversations;
}

// ============================================
// INTERNAL FUNCTIONS
// ============================================

/**
 * Get context for AI query (RAG)
 * @param query - User query
 * @param employeeId - Employee ID
 * @returns Context object
 */
async function getContextForQuery(query: string, employeeId: number) {
  const db = await getDb();
  if (!db) return {};
  
  const context: any = {};

  // Detect intent from query
  const intent = detectIntent(query);

  // Get relevant data based on intent
  if (intent.includes("tasks") || intent.includes("משימות")) {
    // Get employee's tasks
    const tasks = await db
      .select()
      .from(clientTasks)
      .where(eq(clientTasks.assignedTo, employeeId.toString()))
      .limit(10);
    context.tasks = tasks;
  }

  if (intent.includes("clients") || intent.includes("לקוחות")) {
    // Get all clients
    const clients = await db.select().from(crmClients).limit(20);
    context.clients = clients;
  }

  if (intent.includes("summary") || intent.includes("סיכום")) {
    // Get summary data
    const tasks = await db
      .select()
      .from(clientTasks)
      .where(eq(clientTasks.assignedTo, employeeId.toString()));
    context.tasks = tasks;
    context.summary = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t: any) => t.status === "done").length,
      pendingTasks: tasks.filter((t: any) => t.status !== "done").length,
    };
  }

  return context;
}

/**
 * Detect intent from user query
 * @param query - User query
 * @returns Intent keywords
 */
function detectIntent(query: string): string[] {
  const keywords: string[] = [];
  const q = query.toLowerCase();

  // Tasks
  if (q.includes("משימ") || q.includes("task")) keywords.push("tasks");
  
  // Clients
  if (q.includes("לקוח") || q.includes("client")) keywords.push("clients");
  
  // Summary
  if (q.includes("סיכום") || q.includes("summary") || q.includes("דוח") || q.includes("report")) {
    keywords.push("summary");
  }
  
  // Urgent
  if (q.includes("דחוף") || q.includes("urgent") || q.includes("חשוב") || q.includes("important")) {
    keywords.push("urgent");
  }

  return keywords;
}

/**
 * Generate AI response using Gemini 2.5 Flash
 * @param query - User query
 * @param context - Context data
 * @returns AI response
 */
async function generateAIResponse(query: string, context: any) {
  try {
    // Build context string for Gemini
    let contextStr = "";
    
    if (context.tasks && context.tasks.length > 0) {
      contextStr += "\n\n📋 משימות:\n";
      context.tasks.slice(0, 10).forEach((task: any, index: number) => {
        contextStr += `${index + 1}. ${task.taskName}\n`;
        contextStr += `   - סטטוס: ${getStatusLabel(task.status)}\n`;
        contextStr += `   - עדיפות: ${task.priority || "רגילה"}\n`;
        if (task.dueDate) {
          contextStr += `   - תאריך יעד: ${new Date(task.dueDate).toLocaleDateString("he-IL")}\n`;
        }
      });
    }
    
    if (context.clients && context.clients.length > 0) {
      contextStr += "\n\n👥 לקוחות:\n";
      context.clients.slice(0, 10).forEach((client: any, index: number) => {
        contextStr += `${index + 1}. ${client.clientName}\n`;
        contextStr += `   - סטטוס: ${getStatusLabel(client.status)}\n`;
        contextStr += `   - סוג עסקי: ${getBusinessTypeLabel(client.businessType)}\n`;
      });
    }
    
    if (context.summary) {
      const { totalTasks, completedTasks, pendingTasks } = context.summary;
      contextStr += "\n\n📊 סיכום:\n";
      contextStr += `- סה"כ משימות: ${totalTasks}\n`;
      contextStr += `- הושלמו: ${completedTasks} (${Math.round((completedTasks / totalTasks) * 100)}%)\n`;
      contextStr += `- ממתינות: ${pendingTasks}\n`;
    }

    // Build prompt for Gemini
    const prompt = `אתה עוזר אישי חכם למערכת ניהול עסקית (CRM).
התפקיד שלך הוא לעזור לעובדים לנהל את העבודה שלהם בצורה יעילה.

הקשר (נתונים מהמערכת):${contextStr}

שאלת המשתמש: ${query}

הנחיות:
1. תן תשובה מועילה, ממוקדת וקצרה בעברית
2. השתמש באימוג'ים רלוונטיים (📋, 💡, ✅, ⏰, 🎯)
3. אם יש משימות דחופות - הדגש אותן
4. תן המלצות פרקטיות לפעולה
5. היה ידידותי ומקצועי
6. אם אין נתונים רלוונטיים - הסבר מה אתה יכול לעזור בו

תשובה:`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract actions from response (if any urgent tasks)
    const actions: any[] = [];
    if (context.tasks) {
      const urgentTasks = context.tasks.filter((t: any) => 
        t.priority === "urgent" || t.priority === "high"
      );
      if (urgentTasks.length > 0) {
        actions.push({
          type: "view_task",
          data: { taskId: urgentTasks[0].id },
          label: `צפה במשימה: ${urgentTasks[0].taskName}`,
        });
      }
    }

    return {
      message: text,
      sources: Object.keys(context),
      actions: actions,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // Fallback to rule-based response if Gemini fails
    return generateFallbackResponse(query, context);
  }
}

/**
 * Fallback response if Gemini API fails
 */
function generateFallbackResponse(query: string, context: any) {
  const response: any = {
    message: "",
    sources: [],
    actions: [],
  };

  // Check if we have tasks in context
  if (context.tasks && context.tasks.length > 0) {
    const tasks = context.tasks;
    
    response.message = `יש לך ${tasks.length} משימות:\n\n`;
    
    tasks.slice(0, 5).forEach((task: any, index: number) => {
      const urgentBadge = task.priority === "urgent" || task.priority === "high" ? " (דחוף!)" : "";
      response.message += `${index + 1}. ${task.taskName}${urgentBadge}\n`;
      response.message += `   סטטוס: ${getStatusLabel(task.status)}\n`;
      if (task.dueDate) {
        response.message += `   תאריך יעד: ${new Date(task.dueDate).toLocaleDateString("he-IL")}\n`;
      }
      response.message += `\n`;
    });

    const urgentTasks = tasks.filter((t: any) => t.priority === "urgent" || t.priority === "high");
    if (urgentTasks.length > 0) {
      response.message += `\n💡 המלצה: יש ${urgentTasks.length} משימות דחופות שדורשות טיפול מיידי!`;
      response.actions = [{
        type: "view_task",
        data: { taskId: urgentTasks[0].id },
        label: `צפה במשימה: ${urgentTasks[0].taskName}`,
      }];
    }

    response.sources = ["client_tasks"];
  }
  else if (context.clients && context.clients.length > 0) {
    const clients = context.clients;
    
    response.message = `יש ${clients.length} לקוחות במערכת:\n\n`;
    
    clients.slice(0, 5).forEach((client: any, index: number) => {
      response.message += `${index + 1}. ${client.clientName}\n`;
      response.message += `   סטטוס: ${getStatusLabel(client.status)}\n`;
      response.message += `   סוג עסקי: ${getBusinessTypeLabel(client.businessType)}\n`;
      response.message += `\n`;
    });

    response.sources = ["crm_clients"];
  }
  else if (context.summary) {
    const { totalTasks, completedTasks, pendingTasks } = context.summary;
    
    response.message = `📊 סיכום:\n\n`;
    response.message += `✅ משימות שהושלמו: ${completedTasks}/${totalTasks} (${Math.round((completedTasks / totalTasks) * 100)}%)\n`;
    response.message += `⏳ משימות ממתינות: ${pendingTasks}\n\n`;
    
    if (pendingTasks > 0) {
      response.message += `💡 המלצה: יש ${pendingTasks} משימות שממתינות לטיפול.`;
    } else {
      response.message += `🎉 כל הכבוד! כל המשימות הושלמו!`;
    }

    response.sources = ["client_tasks"];
  }
  else {
    response.message = `שלום! אני העוזר האישי שלך. 👋\n\n`;
    response.message += `אני יכול לעזור לך עם:\n`;
    response.message += `• 📋 משימות - "מה המשימות שלי?"\n`;
    response.message += `• 👥 לקוחות - "הצג לקוחות"\n`;
    response.message += `• 📊 סיכומים - "סיכום השבוע"\n`;
    response.message += `• ⏰ תזכורות - "תזכורות להיום"\n`;
    response.message += `• 💡 המלצות - "מה הכי דחוף?"\n\n`;
    response.message += `במה אוכל לעזור?`;
  }

  return response;
}

/**
 * Get status label in Hebrew
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    todo: "לביצוע",
    in_progress: "בתהליך",
    review: "בבדיקה",
    done: "הושלם",
    blocked: "חסום",
    missing_details: "פרטים חסרים",
    active: "פעיל",
    inactive: "לא פעיל",
    potential: "פוטנציאלי",
    new: "חדש",
    contacted: "יצרנו קשר",
    qualified: "מוסמך",
    proposal: "הצעת מחיר",
    negotiation: "משא ומתן",
    won: "זכינו",
    lost: "הפסדנו",
  };
  return labels[status] || status;
}

/**
 * Get business type label in Hebrew
 */
function getBusinessTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    retainer: "ריטיינר",
    hourly: "שעתי",
    bank: "בנק שעות",
    project: "פרויקט",
    one_time: "חד פעמי",
  };
  return labels[type] || type;
}
