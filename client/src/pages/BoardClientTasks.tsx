import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import {
  User,
  Calendar,
  Clock,
  AlertCircle,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  BarChart3,
  DollarSign,
  Mail,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BoardInfoBubbleNew } from "@/components/BoardInfoBubbleNew";
import SortFilterDialog from "@/components/SortFilterDialog";
import { useSortFilter } from "@/hooks/useSortFilter";

const rowColors = [
  "bg-white",
  "bg-gray-50",
];

export default function BoardClientTasks() {
  const { data: tasks, isLoading } = trpc.clientTasks.list.useQuery();
  const { data: clients } = trpc.crm.list.useQuery();
  const utils = trpc.useUtils();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(tasks, "client-tasks");
  
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    clientId: "",
    taskType: "development",
    status: "todo",
    priority: "medium",
    estimatedHours: "",
    actualHours: "",
    billable: "yes",
    dueDate: "",
  });

  const createBillingMutation = trpc.billing.create.useMutation({
    onSuccess: () => {
      utils.billing.list.invalidate();
    },
  });

  const addMutation = trpc.clientTasks.create.useMutation({
    onSuccess: () => {
      utils.clientTasks.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("משימה נוספה בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בהוספת משימה: " + error.message);
    },
  });

  const updateMutation = trpc.clientTasks.update.useMutation({
    onSuccess: async (_, variables) => {
      utils.clientTasks.list.invalidate();
      
      // Automation: Create billing when task is marked as completed and billable
      if (variables.status === "הושלם" && variables.billable === "כלול" && selectedTask) {
        const actualHours = variables.actualHours || selectedTask.actualHours || 0;
        const hourlyRate = 350; // Default hourly rate
        const amount = actualHours * hourlyRate;
        
        if (actualHours > 0) {
          try {
            await createBillingMutation.mutateAsync({
              clientId: selectedTask.clientId,
              taskId: selectedTask.id,
              chargeType: "hourly",
              status: "pending",
              description: `חיוב עבור משימה: ${selectedTask.taskName}`,
              amount: amount,
              hours: actualHours,
            });
            
            toast.success(`חיוב אוטומטי נוצר! סכום: ${amount} ₪ 💰`);
          } catch (error) {
            console.error("Error creating automatic billing:", error);
            toast.error("שגיאה ביצירת חיוב אוטומטי");
          }
        }
      }
      
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      resetForm();
      toast.success("משימה עודכנה בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בעדכון משימה: " + error.message);
    },
  });

  const deleteMutation = trpc.clientTasks.delete.useMutation({
    onSuccess: () => {
      utils.clientTasks.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedTask(null);
      toast.success("משימה נמחקה בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה במחיקת משימה: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      taskName: "",
      description: "",
      clientId: "",
      taskType: "development",
      status: "todo",
      priority: "medium",
      estimatedHours: "",
      actualHours: "",
      billable: "yes",
      dueDate: "",
    });
  };

  const handleAdd = () => {
    addMutation.mutate({
      taskName: formData.taskName,
      description: formData.description || undefined,
      clientId: parseInt(formData.clientId),
      taskType: formData.taskType as any,
      status: formData.status as any,
      priority: formData.priority as any,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
      actualHours: formData.actualHours ? parseFloat(formData.actualHours) : undefined,
      billable: formData.billable as any,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });
  };

  const handleEdit = () => {
    if (!selectedTask) return;
    updateMutation.mutate({
      id: selectedTask.id,
      taskName: formData.taskName,
      description: formData.description || undefined,
      clientId: parseInt(formData.clientId),
      taskType: formData.taskType as any,
      status: formData.status as any,
      priority: formData.priority as any,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
      actualHours: formData.actualHours ? parseFloat(formData.actualHours) : undefined,
      billable: formData.billable as any,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedTask) return;
    deleteMutation.mutate({ id: selectedTask.id });
  };

  const openEditDialog = (task: any) => {
    setSelectedTask(task);
    setFormData({
      taskName: task.taskName,
      description: task.description || "",
      clientId: task.clientId?.toString() || "",
      taskType: task.taskType,
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimatedHours?.toString() || "",
      actualHours: task.actualHours?.toString() || "",
      billable: task.billable,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: any) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const getClientName = (clientId: number) => {
    const client = clients?.find((c) => c.id === clientId);
    return client?.clientName || `לקוח #${clientId}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      todo: { label: "ממתין", className: "bg-gray-500 text-white" },
      in_progress: { label: "בתהליך", className: "bg-blue-500 text-white" },
      review: { label: "בדיקה", className: "bg-yellow-500 text-white" },
      done: { label: "הושלם", className: "bg-green-500 text-white" },
      blocked: { label: "חסום", className: "bg-red-500 text-white" },
      missing_details: { label: "פרטים חסרים", className: "bg-orange-500 text-white" },
    };
    const status_info = statusMap[status as keyof typeof statusMap] || {
      label: status,
      className: "bg-gray-500 text-white",
    };
    return <Badge className={status_info.className}>{status_info.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { label: "נמוך", className: "bg-green-100 text-green-800" },
      medium: { label: "בינוני", className: "bg-yellow-100 text-yellow-800" },
      high: { label: "גבוה", className: "bg-orange-100 text-orange-800" },
      urgent: { label: "דחוף", className: "bg-red-100 text-red-800" },
    };
    const priority_info = priorityMap[priority as keyof typeof priorityMap] || {
      label: priority,
      className: "bg-gray-100 text-gray-800",
    };
    return <Badge className={priority_info.className}>{priority_info.label}</Badge>;
  };

  const getTaskTypeBadge = (taskType: string) => {
    const typeMap = {
      development: { label: "פיתוח", className: "bg-blue-100 text-blue-800" },
      design: { label: "עיצוב", className: "bg-purple-100 text-purple-800" },
      support: { label: "תמיכה", className: "bg-green-100 text-green-800" },
      bug: { label: "באג", className: "bg-red-100 text-red-800" },
    };
    const type = typeMap[taskType as keyof typeof typeMap] || {
      label: taskType,
      className: "bg-gray-100 text-gray-800",
    };
    return <Badge className={type.className}>{type.label}</Badge>;
  };

  const columns = [
    { id: "name", label: "שם משימה", icon: <AlertCircle className="w-4 h-4" />, width: "20%" },
    { id: "client", label: "לקוח", icon: <User className="w-4 h-4" />, width: "15%" },
    { id: "type", label: "סוג", icon: <Clock className="w-4 h-4" />, width: "10%" },
    { id: "status", label: "סטטוס", icon: <AlertCircle className="w-4 h-4" />, width: "10%" },
    { id: "priority", label: "עדיפות", icon: <AlertCircle className="w-4 h-4" />, width: "10%" },
    { id: "hours", label: "שעות", icon: <Clock className="w-4 h-4" />, width: "10%" },
    { id: "dueDate", label: "תאריך יעד", icon: <Calendar className="w-4 h-4" />, width: "12%" },
    { id: "actions", label: "", width: "6%" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">טוען...</div>
      </div>
    );
  }

  return (
    <>
      <MondayTable
        title="משימות לקוח"
        description="מעקב אחר משימות ופרויקטים"
        columns={columns}
        onAddItem={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}
        headerActions={
          <div className="flex gap-2">
            <BoardInfoBubbleNew
              boardName="בורד משימות לקוח"
              description="מעקב מרכזי אחר כל המשימות והפרויקטים של הלקוחות. ניהול שעות עבודה, סטטוסים, ותאריכי יעד לכל משימה."
              features={[
                "הוסף משימה חדשה דרך 'פריט חדש'",
                "מלא שם משימה ותיאור מפורט",
                "בחר לקוח מהרשימה",
                "הגדר סוג משימה: פיתוח, תמיכה, עיצוב, או אחר",
                "עדכן סטטוס: ממתין → בתהליך → הושלם",
                "הזן שעות משוערות ושעות בפועל",
                "בחר אם המשימה לחיוב או כלולה בריטיינר",
                "כשמסיימים משימה - שנה סטטוס ל-'הושלם' והאוטומציה תיצור חיוב"
              ]}
              quickActions={[
                {
                  id: "add",
                  label: "משימה חדשה",
                  icon: <Plus className="w-5 h-5 text-white" />,
                  description: "צור משימה חדשה",
                  action: () => toast.info("פתיחת טופס משימה...")
                },
                {
                  id: "time",
                  label: "מעקב שעות",
                  icon: <BarChart3 className="w-5 h-5 text-white" />,
                  description: "צפה במעקב שעות",
                  action: () => toast.info("טוען מעקב שעות...")
                },
                {
                  id: "billing",
                  label: "יצירת חיוב",
                  icon: <DollarSign className="w-5 h-5 text-white" />,
                  description: "צור חיוב ממשימה",
                  action: () => toast.info("פתיחת טופס חיוב...")
                },
                {
                  id: "stats",
                  label: "סטטיסטיקות",
                  icon: <Mail className="w-5 h-5 text-white" />,
                  description: "צפה בסטטיסטיקות",
                  action: () => toast.info("טוען סטטיסטיקות...")
                }
              ]}
              automations={[
                "כאשר משימה מסומנת כ-'הושלם' + לחיוב — המערכת יוצרת אוטומטית חיוב בבורד גבייה",
                "כאשר משימה חורגת מתאריך יעד — המערכת שולחת תזכורת אוטומטית"
              ]}
            />
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-gray-700 text-white hover:bg-gray-600 border border-cc-neon-green"
              onClick={() => setFilterDialogOpen(true)}
            >
              סינון {filters.length > 0 && `(${filters.length})`}
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-gray-700 text-white hover:bg-gray-600 border border-cc-neon-green"
              onClick={() => setSortDialogOpen(true)}
            >
              מיון {sortConfig && "✓"}
            </Button>
          </div>
        }
      >
        {sortedData && sortedData.length > 0 ? (
          sortedData.map((task: any, index: number) => (
            <MondayTableRow 
              key={task.id} 
              color={rowColors[index % rowColors.length]}
              onClick={() => {
                setSelectedTask(task);
                setIsEditDialogOpen(true);
              }}
            >
              <MondayTableCell>
                <div className="font-semibold text-gray-900">{task.taskName}</div>
                {task.description && (
                  <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                )}
              </MondayTableCell>
              <MondayTableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                    {getClientName(task.clientId).charAt(0)}
                  </div>
                  <span>{getClientName(task.clientId)}</span>
                </div>
              </MondayTableCell>
              <MondayTableCell>{getTaskTypeBadge(task.taskType)}</MondayTableCell>
              <MondayTableCell>{getStatusBadge(task.status)}</MondayTableCell>
              <MondayTableCell>{getPriorityBadge(task.priority)}</MondayTableCell>
              <MondayTableCell>
                <div className="text-sm">
                  <span className="text-gray-600">{task.actualHours || 0}</span>
                  <span className="text-gray-400"> / </span>
                  <span className="text-gray-900">{task.estimatedHours || 0}</span>
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("he-IL")
                      : "-"}
                  </span>
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-100"
                    onClick={() => openEditDialog(task)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100"
                    onClick={() => openDeleteDialog(task)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </MondayTableCell>
            </MondayTableRow>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="text-center py-12 text-gray-500">
              אין משימות להצגה
            </td>
          </tr>
        )}
      </MondayTable>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת משימה חדשה</DialogTitle>
            <DialogDescription>מלא את הפרטים להוספת משימה חדשה</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="taskName">שם משימה *</Label>
              <Input
                id="taskName"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                placeholder="שם המשימה"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="תיאור המשימה"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">לקוח *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר לקוח" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskType">סוג משימה</Label>
              <Select value={formData.taskType} onValueChange={(value) => setFormData({ ...formData, taskType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">פיתוח</SelectItem>
                  <SelectItem value="design">עיצוב</SelectItem>
                  <SelectItem value="support">תמיכה</SelectItem>
                  <SelectItem value="bug">באג</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">ממתין</SelectItem>
                  <SelectItem value="in_progress">בתהליך</SelectItem>
                  <SelectItem value="review">בדיקה</SelectItem>
                  <SelectItem value="done">הושלם</SelectItem>
                  <SelectItem value="blocked">חסום</SelectItem>
                  <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">עדיפות</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">נמוך</SelectItem>
                  <SelectItem value="medium">בינוני</SelectItem>
                  <SelectItem value="high">גבוה</SelectItem>
                  <SelectItem value="urgent">דחוף</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">שעות משוערות</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualHours">שעות בפועל</Label>
              <Input
                id="actualHours"
                type="number"
                value={formData.actualHours}
                onChange={(e) => setFormData({ ...formData, actualHours: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billable">לחיוב</Label>
              <Select value={formData.billable} onValueChange={(value) => setFormData({ ...formData, billable: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">לחיוב</SelectItem>
                  <SelectItem value="no">ללא חיוב</SelectItem>
                  <SelectItem value="included">כלול</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">תאריך יעד</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleAdd} disabled={!formData.taskName || !formData.clientId || addMutation.isPending} className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow">
              {addMutation.isPending ? "מוסיף..." : "הוסף משימה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת משימה</DialogTitle>
            <DialogDescription>ערוך את פרטי המשימה</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-taskName">שם משימה *</Label>
              <Input
                id="edit-taskName"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-description">תיאור</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-clientId">לקוח *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-taskType">סוג משימה</Label>
              <Select value={formData.taskType} onValueChange={(value) => setFormData({ ...formData, taskType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">פיתוח</SelectItem>
                  <SelectItem value="design">עיצוב</SelectItem>
                  <SelectItem value="support">תמיכה</SelectItem>
                  <SelectItem value="bug">באג</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">סטטוס</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">ממתין</SelectItem>
                  <SelectItem value="in_progress">בתהליך</SelectItem>
                  <SelectItem value="review">בדיקה</SelectItem>
                  <SelectItem value="done">הושלם</SelectItem>
                  <SelectItem value="blocked">חסום</SelectItem>
                  <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">עדיפות</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">נמוך</SelectItem>
                  <SelectItem value="medium">בינוני</SelectItem>
                  <SelectItem value="high">גבוה</SelectItem>
                  <SelectItem value="urgent">דחוף</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-estimatedHours">שעות משוערות</Label>
              <Input
                id="edit-estimatedHours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-actualHours">שעות בפועל</Label>
              <Input
                id="edit-actualHours"
                type="number"
                value={formData.actualHours}
                onChange={(e) => setFormData({ ...formData, actualHours: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-billable">לחיוב</Label>
              <Select value={formData.billable} onValueChange={(value) => setFormData({ ...formData, billable: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">לחיוב</SelectItem>
                  <SelectItem value="no">ללא חיוב</SelectItem>
                  <SelectItem value="included">כלול</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">תאריך יעד</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleEdit} disabled={!formData.taskName || !formData.clientId || updateMutation.isPending}>
              {updateMutation.isPending ? "שומר..." : "שמור שינויים"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת משימה</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את המשימה "{selectedTask?.taskName}"?
              <br />
              פעולה זו אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "מוחק..." : "מחק משימה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SortFilterDialog
        open={sortDialogOpen}
        onClose={() => setSortDialogOpen(false)}
        mode="sort"
        columns={columns.filter(c => c.id !== "actions")}
        currentSort={sortConfig || undefined}
        onApplySort={applySort}
        onClearSort={clearSort}
      />

      <SortFilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        mode="filter"
        columns={columns.filter(c => c.id !== "actions")}
        currentFilters={filters}
        onApplyFilter={applyFilters}
        onClearFilters={clearFilters}
      />
    </>
  );
}
