import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download } from "lucide-react";

interface StatCard {
  label: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface BoardHeaderProps {
  title: string;
  description?: string;
  stats: StatCard[];
  onAddNew?: () => void;
  onFilter?: () => void;
  onExport?: () => void;
  addButtonText?: string;
}

export default function BoardHeader({
  title,
  description,
  stats,
  onAddNew,
  onFilter,
  onExport,
  addButtonText = "הוסף חדש",
}: BoardHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
      {/* כותרת וכפתורים */}
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-all"
            >
              <Download className="w-4 h-4 ml-2" />
              <span className="hidden sm:inline">ייצוא</span>
            </Button>
          )}
          
          {onFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFilter}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-all"
            >
              <Filter className="w-4 h-4 ml-2" />
              <span className="hidden sm:inline">סינון</span>
            </Button>
          )}
          
          {onAddNew && (
            <Button
              size="sm"
              onClick={onAddNew}
              className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="w-4 h-4 ml-2" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* סטטיסטיקות */}
      {stats.length > 0 && (
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.trend && (
                      <p className={`text-xs mt-1 ${stat.trend.isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        {stat.trend.isPositive ? "↑" : "↓"} {stat.trend.value}
                      </p>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
