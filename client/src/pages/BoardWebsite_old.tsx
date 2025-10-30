import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, User, Calendar, DollarSign } from "lucide-react";

export default function BoardWebsite() {
  const columns = [
    { id: "project", label: "פרויקט", icon: <Globe className="w-4 h-4" />, width: "25%" },
    { id: "client", label: "לקוח", width: "20%" },
    { id: "type", label: "סוג אתר", width: "15%" },
    { id: "status", label: "סטטוס", width: "15%" },
    { id: "deadline", label: "דדליין", icon: <Calendar className="w-4 h-4" />, width: "15%" },
    { id: "budget", label: "תקציב", icon: <DollarSign className="w-4 h-4" />, width: "10%" },
  ];

  return (
    <MondayTable
      title="פרויקטי אתרים"
      description="ניהול פרויקטי אתרים"
      columns={columns}
      onAddItem={() => console.log("Add website project")}
    >
      <tr>
        <td colSpan={columns.length} className="text-center py-12 text-gray-500">
          אין פרויקטי אתרים להצגה - לחץ על "פריט חדש" להוספה
        </td>
      </tr>
    </MondayTable>
  );
}
