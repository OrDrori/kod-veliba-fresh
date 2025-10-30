import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataCubes } from "@/components/DataCubes";
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
  ArrowLeft,
} from "lucide-react";

const boards = [
  {
    name: "CRM",
    path: "/board/crm",
    icon: LayoutDashboard,
    description: "ניהול לקוחות ועסקאות",
  },
  {
    name: "לידים",
    path: "/board/leads",
    icon: UserPlus,
    description: "ניהול לידים חדשים",
  },
  {
    name: "אנשי קשר",
    path: "/board/contacts",
    icon: Phone,
    description: "רשימת אנשי קשר",
  },
  {
    name: "משימות לקוח",
    path: "/board/tasks",
    icon: CheckSquare,
    description: "מעקב אחר משימות ופרויקטים",
  },
  {
    name: "משימות עיצוב",
    path: "/board/design-tasks",
    icon: Palette,
    description: "משימות עיצוב גרפי",
  },
  {
    name: "פרויקטי אתרים",
    path: "/board/website",
    icon: Globe,
    description: "ניהול פרויקטי אתרים",
  },
  {
    name: "גבייה וחיובים",
    path: "/board/billing",
    icon: DollarSign,
    description: "ניהול חיובים ותשלומים",
  },
  {
    name: "משימות נוספות",
    path: "/board/tasks-new",
    icon: ListTodo,
    description: "משימות כלליות",
  },
  {
    name: "עובדים",
    path: "/board/employees",
    icon: Users,
    description: "ניהול עובדים ומשאבי אנוש",
  },
  {
    name: "מעקב זמן",
    path: "/board/time-tracking",
    icon: Clock,
    description: "מעקב שעות עבודה וחישוב עלויות",
  },
];
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1d2e] via-[#252a42] to-[#1a1d2e] p-4 md:p-8">
      {/* Data Cubes */}
      <DataCubes boardType="all" />
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <img src="/code-core-logo.webp" alt="Code & Core" className="h-10 md:h-12 w-auto opacity-90" />
              <div className="border-r border-gray-700 h-6 md:h-8 mx-1 md:mx-2"></div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white" style={{fontFamily: 'Heebo, sans-serif'}}>
                  מערכת ניהול עסקי
                </h1>
                <p className="text-xs md:text-sm text-gray-400">לוח בקרה מנהלים</p>
              </div>
            </div>
          </div>
        </div>

        {/* Boards Grid */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4" style={{fontFamily: 'Heebo, sans-serif'}}>
            בורדים
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {boards.map((board, index) => {
              const Icon = board.icon;
              return (
                <Link key={board.path} href={board.path}>
                  <Card 
                    className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-[#6366F1]/30 transition-all duration-200 cursor-pointer group"
                  >
                    <CardHeader className="pb-3 md:pb-4">
                      <div className="flex items-start justify-between mb-2 md:mb-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-[#6366F1]/20 transition-colors">
                          <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-[#6366F1] transition-colors" />
                        </div>
                        <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 text-gray-600 group-hover:text-[#6366F1] transition-colors" />
                      </div>
                      <CardTitle className="text-sm md:text-base font-semibold text-white mb-1">{board.name}</CardTitle>
                      <CardDescription className="text-xs text-gray-400 line-clamp-2">{board.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Code & Core - מערכת ניהול עסקי מתקדמת
          </p>
        </div>
      </div>
    </div>
  );
}

