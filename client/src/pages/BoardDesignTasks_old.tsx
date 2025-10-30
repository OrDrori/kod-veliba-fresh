import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, User, Calendar, CheckSquare } from "lucide-react";

export default function BoardDesignTasks() {
  const columns = [
    { id: "task", label: "משימה", icon: <Palette className="w-4 h-4" />, width: "30%" },
    { id: "client", label: "לקוח", width: "20%" },
    { id: "designer", label: "מעצב", icon: <User className="w-4 h-4" />, width: "15%" },
    { id: "status", label: "סטטוס", icon: <CheckSquare className="w-4 h-4" />, width: "15%" },
    { id: "deadline", label: "דדליין", icon: <Calendar className="w-4 h-4" />, width: "15%" },
    { id: "priority", label: "עדיפות", width: "5%" },
  ];

  return (
    <MondayTable
      title="משימות עיצוב"
      description="ניהול משימות עיצוב"
      columns={columns}
      onAddItem={() => console.log("Add design task")}
    >
      <tr>
        <td colSpan={columns.length} className="text-center py-12 text-gray-500">
          אין משימות עיצוב להצגה - לחץ על "פריט חדש" להוספה
        </td>
      </tr>
    </MondayTable>
  );
}
