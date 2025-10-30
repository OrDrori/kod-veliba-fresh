import { ReactNode } from "react";
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
      {/* Header - Design System v2.0 */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 animate-fadeInDown">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex-1">
            <h1 className="heading-3" style={{fontFamily: 'Heebo, sans-serif'}}>{title}</h1>
            {description && <p className="body-small mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {headerActions}
            {onAddItem && (
              <button
                onClick={onAddItem}
                className="btn btn-primary btn-md w-full md:w-auto"
              >
                <Plus className="w-4 h-4 ml-2" />
                <span>פריט חדש</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto relative">
        {/* Mobile Scroll Indicator */}
        <div className="md:hidden sticky bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100 to-transparent py-2 px-4 text-center z-10 pointer-events-none">
          <span className="caption font-semibold" style={{color: 'var(--accent-primary)'}}>← גלול לצפייה במידע נוסף →</span>
        </div>
        <div className="min-w-full overflow-x-auto">
          <table className="table min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
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
      className={`${color} border-r-4 border-transparent hover:border-r-indigo-500 transition-all cursor-pointer group animate-fadeInUp`}
      style={{
        borderRightColor: 'transparent',
        transition: 'all var(--transition-base)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderRightColor = 'var(--accent-primary)';
        e.currentTarget.style.background = 'var(--indigo-50)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderRightColor = 'transparent';
        e.currentTarget.style.background = color;
      }}
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
    <td className={className}>
      <div className="truncate max-w-[200px] md:max-w-none">
        {children}
      </div>
    </td>
  );
}
