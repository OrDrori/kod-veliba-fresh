# 📦 Import Guide - Monday.com Data Import

## 🎯 Current Status

### ✅ **Completed:**
- **CRM Clients:** 65/65 (100%) ✅
- **Contacts:** 278/278 (100%) ✅
- **Grow Sites Board:** Created with full UI ✅
- **All Boards:** 8 boards with complete CRUD functionality ✅

### ⏳ **Pending Import:**
- **Leads:** 4 items
- **Website Projects:** 364 items
- **Grow Sites Data:** 1,571 items
- **Client Tasks:** 246 items + 87 subitems
- **Design Tasks:** 70 items + 47 subitems
- **Tasks-New:** 100 items + 468 subitems
- **Deals:** 208 items + 276 subitems

**Total Pending: 2,563 items + 878 subitems = 3,441 records**

---

## 🚀 How to Run the Import

### **Option 1: Master Script (Recommended)**

Run all imports at once:

```bash
cd /home/ubuntu/kod-veliba-demo
./scripts/master-import.sh
```

**Estimated time:** 2-3 hours  
**Best time to run:** Overnight or during off-hours

---

### **Option 2: Individual Imports**

Run specific boards one at a time:

```bash
cd /home/ubuntu/kod-veliba-demo

# Leads (fast - 4 items)
pnpm tsx scripts/import-leads.ts

# Website Projects (medium - 364 items)
pnpm tsx scripts/import-website.ts

# Grow Sites (slow - 1,571 items)
pnpm tsx scripts/import-grow-sites.ts

# Client Tasks (medium - 246+87)
pnpm tsx scripts/import-client-tasks.ts

# Design Tasks (fast - 70+47)
pnpm tsx scripts/import-design-tasks.ts

# Tasks-New (medium - 100+468)
pnpm tsx scripts/import-tasks-new.ts

# Deals (medium - 208+276)
pnpm tsx scripts/import-deals.ts
```

---

## 📊 Import Progress Tracking

Each import script will show:
- ✅ Number of items imported
- ⚠️ Number of items skipped (errors)
- 📊 Success percentage
- ⏱️ Estimated time remaining

Example output:
```
🔄 מייבא לקוחות מ-Monday.com...
✅ נמצאו 65 לקוחות
  ✅ 10/65 לקוחות...
  ✅ 20/65 לקוחות...
  ...
🎉 הושלם!
✅ ייבאנו: 65 לקוחות
⚠️ דילגנו: 0 לקוחות
📊 אחוז הצלחה: 100.0%
```

---

## 🔍 Verification

After import, verify the data:

```bash
cd /home/ubuntu/kod-veliba-demo
pnpm tsx scripts/verify-import.ts
```

This will show:
- Total records per board
- Data integrity checks
- Missing relations
- Duplicate detection

---

## ⚠️ Troubleshooting

### **Import fails with "Database connection error"**
- Check that DATABASE_URL is set correctly
- Verify database is accessible
- Try restarting the dev server: `pnpm dev`

### **Import is too slow**
- Run during off-hours
- Consider running individual imports in parallel (advanced)
- Check database performance

### **Some items are skipped**
- Check the error messages in the output
- Common issues:
  - Missing required fields (name, status, etc.)
  - Invalid data formats
  - Duplicate entries
- Skipped items are logged for manual review

---

## 📝 Import Scripts Location

All import scripts are in: `/home/ubuntu/kod-veliba-demo/scripts/`

- `import-crm.ts` - ✅ Already run
- `import-contacts.ts` - ✅ Already run
- `import-leads.ts` - ⏳ Ready to run
- `import-website.ts` - ⏳ Ready to run
- `import-grow-sites.ts` - ⏳ Ready to run
- `import-client-tasks.ts` - ⏳ Ready to run
- `import-design-tasks.ts` - ⏳ Ready to run
- `import-tasks-new.ts` - ⏳ Ready to run
- `import-deals.ts` - ⏳ Ready to run
- `master-import.sh` - Master script (runs all)
- `verify-import.ts` - Verification script

---

## 🎯 Next Steps After Import

1. **Verify Data:**
   ```bash
   pnpm tsx scripts/verify-import.ts
   ```

2. **Check Web UI:**
   - Open the application
   - Navigate through all boards
   - Verify data looks correct

3. **Create Checkpoint:**
   ```bash
   # This will be done automatically after verification
   ```

4. **Enable Automations:**
   - Lead → CRM conversion
   - Task → Billing automation
   - Payment tracking

---

## 💡 Tips

- **Run overnight:** The import takes 2-3 hours
- **Monitor progress:** Check the terminal output
- **Don't interrupt:** Let it complete fully
- **Verify after:** Always run verification script
- **Backup first:** Checkpoint before major imports

---

## 📞 Support

If you encounter issues:
1. Check the error messages
2. Review the logs
3. Try running individual imports
4. Contact support if needed

---

**Good luck with the import!** 🚀

