import { Router } from "express";
import { getDb } from "../db";
import { systemImprovements, type InsertSystemImprovement } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET all system improvements
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }
    
    const improvements = await db.select().from(systemImprovements);
    res.json(improvements);
  } catch (error) {
    console.error("Error fetching system improvements:", error);
    res.status(500).json({ error: "Failed to fetch system improvements" });
  }
});

// GET single system improvement
router.get("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }
    
    const { id } = req.params;
    const [improvement] = await db
      .select()
      .from(systemImprovements)
      .where(eq(systemImprovements.id, parseInt(id)));
    
    if (!improvement) {
      return res.status(404).json({ error: "System improvement not found" });
    }
    
    res.json(improvement);
  } catch (error) {
    console.error("Error fetching system improvement:", error);
    res.status(500).json({ error: "Failed to fetch system improvement" });
  }
});

// POST create system improvement
router.post("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }
    
    const data: InsertSystemImprovement = req.body;
    
    // Calculate checkbox stats if checkboxes provided
    if (data.checkboxes) {
      const checkboxArray = JSON.parse(data.checkboxes as string);
      data.totalCheckboxes = checkboxArray.length;
      data.completedCheckboxes = checkboxArray.filter((cb: any) => cb.checked).length;
    }
    
    const [newImprovement] = await db.insert(systemImprovements).values(data);
    res.status(201).json(newImprovement);
  } catch (error) {
    console.error("Error creating system improvement:", error);
    res.status(500).json({ error: "Failed to create system improvement" });
  }
});

// PUT update system improvement
router.put("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }
    
    const { id } = req.params;
    const data = req.body;
    
    // Calculate checkbox stats if checkboxes provided
    if (data.checkboxes) {
      const checkboxArray = JSON.parse(data.checkboxes);
      data.totalCheckboxes = checkboxArray.length;
      data.completedCheckboxes = checkboxArray.filter((cb: any) => cb.checked).length;
      
      // If all checkboxes completed, mark as done
      if (data.completedCheckboxes === data.totalCheckboxes && data.totalCheckboxes > 0) {
        data.status = "done";
        data.completedAt = new Date().toISOString();
      }
    }
    
    await db
      .update(systemImprovements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(systemImprovements.id, parseInt(id)));
    
    const [updated] = await db
      .select()
      .from(systemImprovements)
      .where(eq(systemImprovements.id, parseInt(id)));
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating system improvement:", error);
    res.status(500).json({ error: "Failed to update system improvement" });
  }
});

// PUT update checkbox
router.put("/:id/checkbox", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }
    
    const { id } = req.params;
    const { checkboxId, checked } = req.body;
    
    // Get current improvement
    const [improvement] = await db
      .select()
      .from(systemImprovements)
      .where(eq(systemImprovements.id, parseInt(id)));
    
    if (!improvement) {
      return res.status(404).json({ error: "System improvement not found" });
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
    await db
      .update(systemImprovements)
      .set({
        checkboxes: JSON.stringify(checkboxes),
        completedCheckboxes,
        totalCheckboxes,
        status: completedCheckboxes === totalCheckboxes && totalCheckboxes > 0 ? "done" : improvement.status,
        completedAt: completedCheckboxes === totalCheckboxes && totalCheckboxes > 0 ? new Date() : improvement.completedAt,
        updatedAt: new Date(),
      })
      .where(eq(systemImprovements.id, parseInt(id)));
    
    const [updated] = await db
      .select()
      .from(systemImprovements)
      .where(eq(systemImprovements.id, parseInt(id)));
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating checkbox:", error);
    res.status(500).json({ error: "Failed to update checkbox" });
  }
});

// DELETE system improvement
router.delete("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }
    
    const { id } = req.params;
    await db.delete(systemImprovements).where(eq(systemImprovements.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting system improvement:", error);
    res.status(500).json({ error: "Failed to delete system improvement" });
  }
});

export default router;

