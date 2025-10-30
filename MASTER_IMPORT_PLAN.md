# 🎯 Master Import Plan - Monday.com → Code & Core System

## Phase 1: Schema Analysis & Design (COMPLETED ✅)
- ✅ Analyzed 9 boards
- ✅ Identified 204 columns  
- ✅ Mapped 5 core vectors
- ✅ Created detailed report

## Phase 2: Schema Update Strategy

### Core Principles:
1. **Unified Vectors** - Same concept = Same field name across all boards
2. **Proper Relations** - Foreign keys for board relations
3. **Data Integrity** - Constraints, validations, triggers
4. **Performance** - Indexes on frequently queried fields

### Unified Field Names:
- `assigned_to` - Person responsible (מנהל תיק, אחראי, owner)
- `status` - Status (סטטוס, מצב)
- `due_date` - Due date (תאריך יעד)
- `client_id` - FK to CRM (לקוח, קישור ללקוח)
- `amount` - Money (סכום, תעריף, מחיר)
- `priority` - Priority (עדיפות)
- `tags` - Tags (תגיות)

## Phase 3: Import Strategy

### Batch Import Order:
1. **CRM** (foundation) → 65 items
2. **Contacts** (linked to CRM) → 278 items
3. **Leads** (converts to CRM) → 4 items
4. **Website Projects** → 364 items
5. **Grow Sites** → 1,571 items
6. **Client Tasks** → 246 items + 87 subitems
7. **Design Tasks** → 70 items + 47 subitems
8. **Tasks-New** → 100 items + 468 subitems
9. **Deals** → 208 items + 276 subitems

**Total: 2,906 items + 1,661 subitems = 4,567 records**

### Import Process:
1. Fetch from Monday.com API (paginated)
2. Transform data (map columns to unified schema)
3. Validate (check required fields, formats)
4. Clean (fix inconsistencies)
5. Insert to DB (with error handling)
6. Log results (success/failure per item)
7. Create relations (FK links)

## Phase 4: Automations

### 1. Lead → CRM
**Trigger:** Lead status = "Won"  
**Action:** Create CRM client with lead data  
**Result:** New client in CRM, linked to original lead

### 2. CRM → Tasks
**Trigger:** New client created (status = active)  
**Action:** Create onboarding task  
**Result:** Task assigned to account manager

### 3. Tasks → Billing
**Trigger:** Task status = "Done" + billable = true  
**Action:** Create billing entry  
**Result:** Automatic invoice generation

### 4. Billing → Payment Collection
**Trigger:** Invoice created  
**Action:** Create payment collection item  
**Result:** Payment tracking starts

## Phase 5: Validation & Integrity (SYN)

### Database Constraints:
- Foreign Keys (client_id, contact_id, etc.)
- Unique constraints (email, phone where needed)
- Check constraints (status values, dates)
- NOT NULL on required fields

### Triggers:
- Before Insert: Validate data format
- After Insert: Log creation
- Before Update: Check permissions
- After Update: Log changes
- Before Delete: Check dependencies

### Indexes:
- Primary keys (id)
- Foreign keys (client_id, assigned_to)
- Frequently queried (status, due_date, created_at)
- Full-text search (name, description)

## Timeline:
- Schema Update: 45 minutes ⏱️
- Import: 90 minutes ⏱️
- Automations: 45 minutes ⏱️
- Testing: 30 minutes ⏱️

**Total: ~3.5 hours**

## Success Criteria:
✅ 95%+ import success rate  
✅ All relations working  
✅ Automations functioning  
✅ No data loss  
✅ System responsive  
✅ SYN maintained (data always in sync)

