import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  DollarSign,
  UserPlus,
  Phone,
  Palette,
  Globe,
  ListTodo,
} from "lucide-react";

const boards = [
  { name: "CRM", path: "/board/crm", icon: LayoutDashboard, color: "text-blue-600" },
  { name: "משימות לקוח", path: "/board/tasks", icon: CheckSquare, color: "text-green-600" },
  { name: "גבייה", path: "/board/billing", icon: DollarSign, color: "text-purple-600" },
  { name: "לידים", path: "/board/leads", icon: UserPlus, color: "text-orange-600" },
  { name: "אנשי קשר", path: "/board/contacts", icon: Phone, color: "text-pink-600" },
  { name: "Design Tasks", path: "/board/design", icon: Palette, color: "text-indigo-600" },
  { name: "Website", path: "/board/website", icon: Globe, color: "text-cyan-600" },
  { name: "Tasks - New", path: "/board/tasks-new", icon: ListTodo, color: "text-teal-600" },
];

interface BoardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function BoardLayout({ children, title }: BoardLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            KV
          </div>
          <h1 className="text-xl font-semibold text-gray-900">קוד וליבה - Demo System</h1>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-l border-gray-200 min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-1">
            {boards.map((board) => {
              const Icon = board.icon;
              const isActive = location === board.path;
              return (
                <Link key={board.path} href={board.path}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? board.color : "text-gray-400")} />
                    <span>{board.name}</span>
                  </a>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

