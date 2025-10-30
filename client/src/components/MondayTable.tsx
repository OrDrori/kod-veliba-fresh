import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Column {
  id: string;
  label: string;
  icon?: ReactNode;
  width?: string;
}

interface MondayTableProps {
  title: string;
  description?: string;
  columns: Column[];
  children: ReactNode;
  onAddItem?: () => void;
  headerActions?: ReactNode;
}

export default function MondayTable({
  title,
  description,
  columns,
  children,
  onAddItem,
  headerActions,
}: MondayTableProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 animate-fadeIn" dir="rtl">
      {/* Header - עיצוב חדש */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 animate-fadeInDown">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900" style={{fontFamily: 'Heebo, sans-serif'}}>{title}</h1>
            {description && <p className="text-xs md:text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {headerActions}
            {onAddItem && (
              <Button
                onClick={onAddItem}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium shadow-sm hover:shadow-md transition-all w-full md:w-auto text-sm md:text-base h-9 md:h-10"
                size="sm"
              >
                <Plus className="w-4 h-4 ml-2" />
                <span>פריט חדש</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto relative">
        {/* Mobile Scroll Indicator */}
        <div className="md:hidden sticky bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100 to-transparent py-2 px-4 text-center z-10 pointer-events-none">
          <span className="text-xs text-indigo-600 font-semibold">← גלול לצפייה במידע נוסף →</span>
        </div>
        <div className="min-w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className="text-right px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700 border-b-2 border-indigo-500"
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center gap-1 md:gap-2">
                      {column.icon}
                      <span className="truncate">{column.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface MondayTableRowProps {
  children: ReactNode;
  color?: string;
  onClick?: () => void;
}

export function MondayTableRow({ children, color = "bg-white", onClick }: MondayTableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`${color} border-r-4 border-transparent hover:border-r-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group animate-fadeInUp`}
    >
      {children}
    </tr>
  );
}

interface MondayTableCellProps {
  children: ReactNode;
  className?: string;
}

export function MondayTableCell({ children, className = "" }: MondayTableCellProps) {
  return (
    <td className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 border-b border-gray-200 ${className}`}>
      <div className="truncate max-w-[200px] md:max-w-none">
        {children}
      </div>
    </td>
  );
}
