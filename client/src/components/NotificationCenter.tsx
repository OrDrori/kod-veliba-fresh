import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Clock,
  DollarSign,
  User,
  Briefcase,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { data: notifications, isLoading } = trpc.notifications.unread.useQuery();
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.unread.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.unread.invalidate();
      utils.notifications.list.invalidate();
      toast.success("כל ההתראות סומנו כנקראו");
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.unread.invalidate();
      utils.notifications.list.invalidate();
      toast.success("התראה נמחקה");
    },
  });

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    markAsReadMutation.mutate({ id: notification.id });
    
    // Navigate if there's an action URL
    if (notification.actionUrl) {
      setLocation(notification.actionUrl);
      setOpen(false);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteMutation.mutate({ id });
  };

  const getIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      task: <Briefcase className="w-4 h-4" />,
      payment: <DollarSign className="w-4 h-4" />,
      deadline: <Clock className="w-4 h-4" />,
      system: <Settings className="w-4 h-4" />,
      employee: <User className="w-4 h-4" />,
      client: <User className="w-4 h-4" />,
    };
    return iconMap[type] || <AlertCircle className="w-4 h-4" />;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colorMap[priority] || "bg-gray-100 text-gray-800";
  };

  const getPriorityLabel = (priority: string) => {
    const labelMap: Record<string, string> = {
      low: "נמוך",
      medium: "בינוני",
      high: "גבוה",
      urgent: "דחוף",
    };
    return labelMap[priority] || priority;
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "עכשיו";
    if (diffMins < 60) return `לפני ${diffMins} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    return notifDate.toLocaleDateString('he-IL');
  };

  const unreadCount = notifications?.length || 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">התראות</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="w-4 h-4 ml-1" />
              סמן הכל כנקרא
            </Button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">טוען...</div>
          ) : unreadCount === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>אין התראות חדשות</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications?.map((notification: any) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => handleDelete(e, notification.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      {notification.message && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                          {getPriorityLabel(notification.priority)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {unreadCount > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button
              variant="link"
              className="w-full text-sm"
              onClick={() => {
                setLocation("/notifications");
                setOpen(false);
              }}
            >
              צפה בכל ההתראות
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
