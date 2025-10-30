import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Users,
  DollarSign,
  CheckSquare,
  Phone,
  Palette,
  Globe,
  ListTodo,
  ChevronDown,
  ChevronRight,
  Home,
  Plus,
  Settings,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

interface BoardGroup {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  boards: {
    id: string;
    name: string;
    path: string;
    color: string;
    dataKey?: string; // מפתח לשליפת נתונים
  }[];
}

const boardGroups: BoardGroup[] = [
  {
    id: "sales",
    name: "מכירות",
    icon: DollarSign,
    boards: [
      { id: "leads", name: "לידים", path: "/board/leads", color: "bg-orange-500", dataKey: "leads" },
      { id: "crm", name: "CRM", path: "/board/crm", color: "bg-blue-500", dataKey: "crm" },
      { id: "contacts", name: "אנשי קשר", path: "/board/contacts", color: "bg-pink-500", dataKey: "contacts" },
    ],
  },
  {
    id: "projects",
    name: "ניהול פרויקטים",
    icon: CheckSquare,
    boards: [
      { id: "tasks", name: "משימות לקוח", path: "/board/tasks", color: "bg-emerald-500", dataKey: "clientTasks" },
      { id: "design", name: "משימות עיצוב", path: "/board/design-tasks", color: "bg-purple-500", dataKey: "designTasks" },
      { id: "website", name: "פרויקטי אתרים", path: "/board/website", color: "bg-cyan-500", dataKey: "websiteProjects" },
      { id: "grow-sites", name: "Grow Sites", path: "/board/grow-sites", color: "bg-indigo-500", dataKey: "growSites" },
    ],
  },
  {
    id: "finance",
    name: "כספים",
    icon: DollarSign,
    boards: [
      { id: "billing", name: "גבייה וחיובים", path: "/board/billing", color: "bg-emerald-500", dataKey: "billingCharges" },
      { id: "payment-collection", name: "גבייה ותשלומים", path: "/board/payment-collection", color: "bg-teal-500", dataKey: "paymentCollection" },
      { id: "deals", name: "עסקאות", path: "/board/deals", color: "bg-violet-500", dataKey: "deals" },
      { id: "accounting", name: "💚 הנהלת חשבונות - גיל", path: "/accounting", color: "bg-emerald-500" },
      { id: "dashboard-manager", name: "📊 Dashboard מנהלים", path: "/dashboard-manager", color: "bg-rose-500" },
    ],
  },
  {
    id: "hr",
    name: "משאבי אנוש",
    icon: Users,
    boards: [
      { id: "employees", name: "עובדים", path: "/board/employees", color: "bg-blue-500", dataKey: "employees" },
      { id: "time-tracking", name: "מעקב זמן", path: "/board/time-tracking", color: "bg-emerald-500", dataKey: "timeEntries" },
    ],
  },
  {
    id: "system",
    name: "ניהול מערכת",
    icon: Settings,
    boards: [
      { id: "system-improvements", name: "שיפורים ועדכוני מערכת", path: "/board/system-improvements", color: "bg-amber-500", dataKey: "systemImprovements" },
    ],
  },
];

// פונקציה לחישוב פריטים ממתינים לכל בורד
function usePendingCounts() {
  const { data: leads } = trpc.leads.list.useQuery();
  const { data: crm } = trpc.crm.list.useQuery();
  const { data: contacts } = trpc.contacts.list.useQuery();
  const { data: clientTasks } = trpc.clientTasks.list.useQuery();
  const { data: designTasks } = trpc.designTasks.list.useQuery();
  const { data: websiteProjects } = trpc.websiteProjects.list.useQuery();
  const { data: growSites } = trpc.growSites.list.useQuery();
  const { data: billingCharges } = trpc.billingCharges.list.useQuery();
  const { data: paymentCollection } = trpc.paymentCollection.list.useQuery();
  const { data: deals } = trpc.deals.list.useQuery();
  const { data: employees } = trpc.employees.list.useQuery();
  const { data: timeEntries } = trpc.timeEntries.list.useQuery();
  const { data: systemImprovements } = trpc.systemImprovements.list.useQuery();

  // חישוב פריטים ממתינים לכל בורד
  const counts: Record<string, number> = {
    leads: leads?.filter((l: any) => l.status === "new" || l.status === "pending" || l.status === "missing_details").length || 0,
    crm: crm?.filter((c: any) => c.status === "pending" || c.status === "missing_details").length || 0,
    contacts: 0, // אנשי קשר לא צריכים badge
    clientTasks: clientTasks?.filter((t: any) => t.status === "pending" || t.status === "missing_details" || t.status === "blocked").length || 0,
    designTasks: designTasks?.filter((t: any) => t.status === "pending" || t.status === "missing_details" || t.status === "blocked").length || 0,
    websiteProjects: websiteProjects?.filter((p: any) => p.status === "pending" || p.status === "missing_details" || p.status === "blocked").length || 0,
    growSites: growSites?.filter((s: any) => s.status === "pending" || s.status === "missing_details").length || 0,
    billingCharges: billingCharges?.filter((b: any) => b.status === "pending" || b.status === "overdue" || b.status === "missing_details").length || 0,
    paymentCollection: paymentCollection?.filter((p: any) => p.status === "pending" || p.status === "overdue").length || 0,
    deals: deals?.filter((d: any) => d.status === "pending" || d.status === "missing_details").length || 0,
    employees: employees?.filter((e: any) => e.status === "missing_details").length || 0,
    timeEntries: timeEntries?.filter((t: any) => t.status === "missing_details").length || 0,
    systemImprovements: systemImprovements?.filter((s: any) => s.status === "pending" || s.status === "missing_details").length || 0,
  };

  return counts;
}

export default function MondaySidebar() {
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["sales", "projects", "finance", "hr", "system"]);
  const pendingCounts = usePendingCounts();

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const isActive = (path: string) => location === path;

  return (
    <div className="hidden lg:flex w-64 bg-[#1a1d2e] h-screen flex-col text-white" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-[#2a2d3e] p-2 rounded-lg transition-colors">
            <img src="/code-core-logo.webp" alt="Code & Core" className="h-10 w-auto" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Home */}
        <Link href="/">
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              location === "/" ? "bg-indigo-600 text-white font-semibold" : "hover:bg-[#2a2d3e] text-gray-300"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">בית</span>
          </div>
        </Link>

        <div className="mt-6">
          {boardGroups.map((group) => {
            const Icon = group.icon;
            const isExpanded = expandedGroups.includes(group.id);

            return (
              <div key={group.id} className="mb-2">
                {/* Group Header */}
                <div
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center justify-between px-3 py-2 hover:bg-[#2a2d3e] rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">{group.name}</span>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Boards */}
                {isExpanded && (
                  <div className="mr-6 mt-1 space-y-1">
                    {group.boards.map((board) => {
                      const pendingCount = board.dataKey ? pendingCounts[board.dataKey] || 0 : 0;
                      
                      return (
                        <Link key={board.id} href={board.path}>
                          <div
                            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors relative ${
                              isActive(board.path)
                                ? "bg-indigo-600 text-white font-semibold"
                                : "hover:bg-[#2a2d3e] text-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${board.color}`} />
                              <span className="text-sm">{board.name}</span>
                            </div>
                            
                            {/* Badge פועם */}
                            {pendingCount > 0 && (
                              <div className="relative">
                                <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-75" />
                                <div className="relative flex items-center justify-center w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full">
                                  {pendingCount > 9 ? "9+" : pendingCount}
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-[#2a2d3e] hover:text-indigo-400"
        >
          <Plus className="w-4 h-4 ml-2" />
          הוסף בורד חדש
        </Button>
      </div>
    </div>
  );
}
