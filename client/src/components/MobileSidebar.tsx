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
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface BoardGroup {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  boards: {
    id: string;
    name: string;
    path: string;
    color: string;
  }[];
}

const boardGroups: BoardGroup[] = [
  {
    id: "sales",
    name: "מכירות",
    icon: DollarSign,
    boards: [
      { id: "leads", name: "לידים", path: "/board/leads", color: "bg-orange-500" },
      { id: "crm", name: "CRM", path: "/board/crm", color: "bg-blue-500" },
      { id: "contacts", name: "אנשי קשר", path: "/board/contacts", color: "bg-pink-500" },
    ],
  },
  {
    id: "projects",
    name: "ניהול פרויקטים",
    icon: CheckSquare,
    boards: [
      { id: "tasks", name: "משימות לקוח", path: "/board/tasks", color: "bg-green-500" },
      { id: "design", name: "משימות עיצוב", path: "/board/design-tasks", color: "bg-purple-500" },
      { id: "website", name: "פרויקטי אתרים", path: "/board/website", color: "bg-cyan-500" },
      { id: "grow-sites", name: "Grow Sites", path: "/board/grow-sites", color: "bg-indigo-500" },
    ],
  },
  {
    id: "finance",
    name: "כספים",
    icon: DollarSign,
    boards: [
      { id: "billing", name: "גבייה וחיובים", path: "/board/billing", color: "bg-emerald-500" },
    ],
  },
  {
    id: "system",
    name: "ניהול מערכת",
    icon: Settings,
    boards: [
      { id: "system-improvements", name: "שיפורים ועדכוני מערכת", path: "/board/system-improvements", color: "bg-yellow-500" },
    ],
  },
];

export default function MobileSidebar() {
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["sales", "projects", "finance", "system"]);
  const [open, setOpen] = useState(false);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const isActive = (path: string) => location === path;

  const closeSidebar = () => setOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1a1d2e] border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-[#1a1d2e] border-gray-700 p-0">
            <SheetTitle className="sr-only">תפריט ניווט</SheetTitle>
            <div className="h-full flex flex-col text-white" dir="rtl">
              {/* Header */}
              <div className="p-4 border-b border-gray-700">
                <Link href="/" onClick={closeSidebar}>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-[#2a2d3e] p-2 rounded-lg transition-colors">
                    <img src="/code-core-logo.webp" alt="Code & Core" className="h-10 w-auto" />
                  </div>
                </Link>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-2">
                {/* Home */}
                <Link href="/" onClick={closeSidebar}>
                  <div
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                      location === "/" ? "bg-[#6366F1] text-[#1a1d2e] font-semibold" : "hover:bg-[#2a2d3e] text-gray-300"
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span className="text-base font-medium">בית</span>
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
                          className="flex items-center justify-between px-3 py-3 hover:bg-[#2a2d3e] rounded-lg cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                            <Icon className="w-5 h-5 text-gray-400" />
                            <span className="text-base font-medium text-gray-300">{group.name}</span>
                          </div>
                        </div>

                        {/* Boards */}
                        {isExpanded && (
                          <div className="mr-6 mt-1 space-y-1">
                            {group.boards.map((board) => (
                              <Link key={board.id} href={board.path} onClick={closeSidebar}>
                                <div
                                  className={`flex items-center gap-2 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                                    isActive(board.path)
                                      ? "bg-[#6366F1] text-[#1a1d2e] font-semibold"
                                      : "hover:bg-[#2a2d3e] text-gray-300"
                                  }`}
                                >
                                  <div className={`w-3 h-3 rounded-full ${board.color}`} />
                                  <span className="text-base">{board.name}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-700">
                <div className="text-xs text-gray-400 text-center">
                  Code & Core © 2025
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/">
          <img src="/code-core-logo.webp" alt="Code & Core" className="h-8 w-auto" />
        </Link>

        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Spacer for fixed header */}
      <div className="lg:hidden h-16" />
    </>
  );
}

