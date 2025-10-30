import { useState } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
  Pencil,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "success" | "warning" | "danger";
}

interface QuickActionsMenuProps {
  actions: QuickAction[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export function QuickActionsMenu({
  actions,
  onEdit,
  onDelete,
}: QuickActionsMenuProps) {
  const [open, setOpen] = useState(false);

  const getVariantClass = (variant?: string) => {
    switch (variant) {
      case "success":
        return "text-green-600 hover:bg-green-50";
      case "warning":
        return "text-yellow-600 hover:bg-yellow-50";
      case "danger":
        return "text-red-600 hover:bg-red-50";
      default:
        return "text-gray-700 hover:bg-gray-50";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-100"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
          פעולות מהירות
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
              setOpen(false);
            }}
            className={`flex items-center gap-2 cursor-pointer ${getVariantClass(action.variant)}`}
          >
            {action.icon}
            <span>{action.label}</span>
          </DropdownMenuItem>
        ))}

        {(onEdit || onDelete) && <DropdownMenuSeparator />}

        {onEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer text-blue-600 hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" />
            <span>ערוך</span>
          </DropdownMenuItem>
        )}

        {onDelete && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>מחק</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Predefined quick actions for common use cases
export const commonActions = {
  email: (email: string) => ({
    id: "email",
    label: "שלח אימייל",
    icon: <Mail className="h-4 w-4" />,
    onClick: () => window.open(`mailto:${email}`),
  }),
  call: (phone: string) => ({
    id: "call",
    label: "התקשר",
    icon: <Phone className="h-4 w-4" />,
    onClick: () => window.open(`tel:${phone}`),
  }),
  whatsapp: (phone: string) => ({
    id: "whatsapp",
    label: "WhatsApp",
    icon: <MessageSquare className="h-4 w-4" />,
    onClick: () => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}`),
    variant: "success" as const,
  }),
  createTask: (onCreateTask: () => void) => ({
    id: "task",
    label: "צור משימה",
    icon: <CheckCircle2 className="h-4 w-4" />,
    onClick: onCreateTask,
  }),
  createMeeting: (onCreateMeeting: () => void) => ({
    id: "meeting",
    label: "קבע פגישה",
    icon: <Calendar className="h-4 w-4" />,
    onClick: onCreateMeeting,
  }),
  createInvoice: (onCreateInvoice: () => void) => ({
    id: "invoice",
    label: "צור חשבונית",
    icon: <DollarSign className="h-4 w-4" />,
    onClick: onCreateInvoice,
    variant: "success" as const,
  }),
  viewDetails: (onViewDetails: () => void) => ({
    id: "details",
    label: "פרטים מלאים",
    icon: <FileText className="h-4 w-4" />,
    onClick: onViewDetails,
  }),
  markUrgent: (onMarkUrgent: () => void) => ({
    id: "urgent",
    label: "סמן דחוף",
    icon: <AlertCircle className="h-4 w-4" />,
    onClick: onMarkUrgent,
    variant: "danger" as const,
  }),
  trackTime: (onTrackTime: () => void) => ({
    id: "time",
    label: "מעקב זמן",
    icon: <Clock className="h-4 w-4" />,
    onClick: onTrackTime,
  }),
};
