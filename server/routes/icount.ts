import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

// Load iCount data from JSON files
const loadJsonFile = (filename: string) => {
  try {
    const filePath = path.join(process.cwd(), "..", filename);
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
};

// GET /api/icount/invoices
router.get("/invoices", (req, res) => {
  const data = loadJsonFile("icount_invoices_data.json");
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: "Failed to load invoices data" });
  }
});

// GET /api/icount/retainers
router.get("/retainers", (req, res) => {
  const data = loadJsonFile("icount_retainers_data.json");
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: "Failed to load retainers data" });
  }
});

// GET /api/icount/debtors
router.get("/debtors", (req, res) => {
  const data = loadJsonFile("icount_debtors_data.json");
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: "Failed to load debtors data" });
  }
});

// GET /api/icount/merged
router.get("/merged", (req, res) => {
  const data = loadJsonFile("merged_accounting_data.json");
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: "Failed to load merged data" });
  }
});

export default router;

