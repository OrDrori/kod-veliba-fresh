#!/bin/bash

# Master Import Script - Monday.com → Code & Core System
# This script imports all remaining data from Monday.com
# Estimated time: 2-3 hours

echo "🚀 Master Import Script - Starting..."
echo "=================================================="
echo ""

# Change to project directory
cd /home/ubuntu/kod-veliba-demo

# Function to run import and check result
run_import() {
    local script_name=$1
    local description=$2
    
    echo "🔄 Importing: $description"
    echo "--------------------------------------------------"
    
    if pnpm tsx scripts/$script_name; then
        echo "✅ $description - SUCCESS"
    else
        echo "⚠️ $description - FAILED (continuing...)"
    fi
    
    echo ""
}

# Import order (dependencies matter!)
echo "📊 Import Plan:"
echo "  1. Leads (4 items)"
echo "  2. Website Projects (364 items)"
echo "  3. Grow Sites (1,571 items)"
echo "  4. Client Tasks (246 items + 87 subitems)"
echo "  5. Design Tasks (70 items + 47 subitems)"
echo "  6. Tasks-New (100 items + 468 subitems)"
echo "  7. Deals (208 items + 276 subitems)"
echo ""
echo "Total: 2,563 items + 878 subitems = 3,441 records"
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Start imports
run_import "import-leads.ts" "Leads"
run_import "import-website.ts" "Website Projects"
run_import "import-grow-sites.ts" "Grow Sites"
run_import "import-client-tasks.ts" "Client Tasks"
run_import "import-design-tasks.ts" "Design Tasks"
run_import "import-tasks-new.ts" "Tasks-New"
run_import "import-deals.ts" "Deals"

echo "=================================================="
echo "🎉 Master Import Complete!"
echo ""
echo "📊 Summary:"
echo "  - Check logs above for success/failure status"
echo "  - All data should now be in the database"
echo "  - You can verify in the web UI"
echo ""
echo "Next steps:"
echo "  1. Check the web UI to verify data"
echo "  2. Run: pnpm tsx scripts/verify-import.ts"
echo "  3. Create checkpoint: see instructions in IMPORT_GUIDE.md"
echo ""

