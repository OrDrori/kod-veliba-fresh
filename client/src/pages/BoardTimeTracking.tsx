import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import {
  Clock,
  Play,
  Pause,
  Square,
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
  Plus,
  BarChart3,
  User,
  Briefcase,
} from "lucide-react";
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

const rowColors = ["bg-white", "bg-gray-50"];

export default function BoardTimeTracking() {
  const { data: timeEntries, isLoading } = trpc.timeEntries.list.useQuery();
  const { data: employees } = trpc.employees.list.useQuery();
  const { data: clients } = trpc.crm.list.useQuery();
  const { data: tasks } = trpc.clientTasks.list.useQuery();
  const utils = trpc.useUtils();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Timer state
  const [runningTimer, setRunningTimer] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(timeEntries, "time-tracking");

  const [formData, setFormData] = useState({
    employeeId: "",
    clientId: "",
    taskId: "",
    description: "",
    startTime: "",
    endTime: "",
    hourlyRate: "",
    billable: "yes",
    notes: "",
  });

  const createMutation = trpc.timeEntries.create.useMutation({
    onSuccess: () => {
      utils.timeEntries.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("רשומת זמן נוספה בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בהוספת רשומה: " + error.message);
    },
  });

  const updateMutation = trpc.timeEntries.update.useMutation({
    onSuccess: () => {
      utils.timeEntries.list.invalidate();
      setIsEditDialogOpen(false);
      setSelectedEntry(null);
      resetForm();
      toast.success("רשומת זמן עודכנה בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בעדכון רשומה: " + error.message);
    },
  });

  const deleteMutation = trpc.timeEntries.delete.useMutation({
    onSuccess: () => {
      utils.timeEntries.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedEntry(null);
      toast.success("רשומת זמן נמחקה בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה במחיקת רשומה: " + error.message);
    },
  });

  const startTimerMutation = trpc.timeEntries.startTimer.useMutation({
    onSuccess: (data) => {
      utils.timeEntries.list.invalidate();
      toast.success("טיימר התחיל!");
    },
    onError: (error) => {
      toast.error("שגיאה בהפעלת טיימר: " + error.message);
    },
  });

  const stopTimerMutation = trpc.timeEntries.stopTimer.useMutation({
    onSuccess: (data) => {
      utils.timeEntries.list.invalidate();
      setRunningTimer(null);
      setElapsedTime(0);
      toast.success(`טיימר הופסק! זמן: ${formatDuration(data.duration || 0)}`);
    },
    onError: (error) => {
      toast.error("שגיאה בעצירת טיימר: " + error.message);
    },
  });

  // Update running timer
  useEffect(() => {
    const running = timeEntries?.find((e: any) => e.status === "running");
    if (running) {
      setRunningTimer(running);
      const start = new Date(running.startTime).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - start) / 1000));
    }
  }, [timeEntries]);

  // Timer tick
  useEffect(() => {
    if (!runningTimer) return;
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [runningTimer]);

  const resetForm = () => {
    setFormData({
      employeeId: "",
      clientId: "",
      taskId: "",
      description: "",
      startTime: "",
      endTime: "",
      hourlyRate: "",
      billable: "yes",
      notes: "",
    });
  };

  const handleAdd = () => {
    createMutation.mutate({
      employeeId: formData.employeeId ? parseInt(formData.employeeId) : undefined,
      clientId: formData.clientId ? parseInt(formData.clientId) : undefined,
      taskId: formData.taskId ? parseInt(formData.taskId) : undefined,
      description: formData.description || undefined,
      startTime: formData.startTime ? new Date(formData.startTime) : undefined,
      endTime: formData.endTime ? new Date(formData.endTime) : undefined,
      hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : undefined,
      billable: formData.billable as any,
      notes: formData.notes || undefined,
      status: "completed",
    });
  };

  const handleEdit = () => {
    if (!selectedEntry) return;
    updateMutation.mutate({
      id: selectedEntry.id,
      employeeId: formData.employeeId ? parseInt(formData.employeeId) : undefined,
      clientId: formData.clientId ? parseInt(formData.clientId) : undefined,
      taskId: formData.taskId ? parseInt(formData.taskId) : undefined,
      description: formData.description || undefined,
      startTime: formData.startTime ? new Date(formData.startTime) : undefined,
      endTime: formData.endTime ? new Date(formData.endTime) : undefined,
      hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : undefined,
      billable: formData.billable as any,
      notes: formData.notes || undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedEntry) return;
    deleteMutation.mutate({ id: selectedEntry.id });
  };

  const handleStartTimer = () => {
    if (runningTimer) {
      toast.error("יש כבר טיימר פעיל!");
      return;
    }
    
    startTimerMutation.mutate({
      employeeId: formData.employeeId ? parseInt(formData.employeeId) : undefined,
      clientId: formData.clientId ? parseInt(formData.clientId) : undefined,
      taskId: formData.taskId ? parseInt(formData.taskId) : undefined,
      description: formData.description || "עבודה ללא תיאור",
      hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : undefined,
      billable: formData.billable as any,
    });
  };

  const handleStopTimer = () => {
    if (!runningTimer) return;
    stopTimerMutation.mutate({ id: runningTimer.id });
  };

  const openEditDialog = (entry: any) => {
    setSelectedEntry(entry);
    setFormData({
      employeeId: entry.employeeId?.toString() || "",
      clientId: entry.clientId?.toString() || "",
      taskId: entry.taskId?.toString() || "",
      description: entry.description || "",
      startTime: entry.startTime ? new Date(entry.startTime).toISOString().slice(0, 16) : "",
      endTime: entry.endTime ? new Date(entry.endTime).toISOString().slice(0, 16) : "",
      hourlyRate: entry.hourlyRate?.toString() || "",
      billable: entry.billable || "yes",
      notes: entry.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (entry: any) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const formatTimerDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees?.find((e: any) => e.id === employeeId);
    return employee?.fullName || `עובד #${employeeId}`;
  };

  const getClientName = (clientId: number) => {
    const client = clients?.find((c: any) => c.id === clientId);
    return client?.clientName || `לקוח #${clientId}`;
  };

  const getTaskName = (taskId: number) => {
    const task = tasks?.find((t: any) => t.id === taskId);
    return task?.taskName || `משימה #${taskId}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      running: { label: "פעיל", className: "bg-green-500 text-white animate-pulse" },
      paused: { label: "מושהה", className: "bg-yellow-500 text-white" },
      completed: { label: "הושלם", className: "bg-blue-500 text-white" },
      missing_details: { label: "פרטים חסרים", className: "bg-orange-500 text-white" },
    };
    const status_info = statusMap[status as keyof typeof statusMap] || {
      label: status,
      className: "bg-gray-500 text-white",
    };
    return <Badge className={status_info.className}>{status_info.label}</Badge>;
  };

  const getBillableBadge = (billable: string) => {
    const billableMap = {
      yes: { label: "לחיוב", className: "bg-green-100 text-green-800" },
      no: { label: "ללא חיוב", className: "bg-gray-100 text-gray-800" },
      included: { label: "כלול", className: "bg-blue-100 text-blue-800" },
    };
    const b = billableMap[billable as keyof typeof billableMap] || {
      label: billable,
      className: "bg-gray-100 text-gray-800",
    };
    return <Badge className={b.className}>{b.label}</Badge>;
  };

  const columns = [
    { id: "employee", label: "עובד", width: "12%" },
    { id: "client", label: "לקוח", width: "12%" },
    { id: "task", label: "משימה", width: "15%" },
    { id: "description", label: "תיאור", width: "15%" },
    { id: "time", label: "זמן", width: "12%" },
    { id: "duration", label: "משך", width: "8%" },
    { id: "billable", label: "לחיוב", width: "8%" },
    { id: "amount", label: "סכום", width: "8%" },
    { id: "status", label: "סטטוס", width: "8%" },
    { id: "actions", label: "פעולות", width: "7%" },
  ];

  // Calculate statistics
  const totalHours = timeEntries?.reduce((sum: number, e: any) => sum + (e.duration || 0), 0) || 0;
  const totalAmount = timeEntries?.reduce((sum: number, e: any) => sum + (parseFloat(e.totalAmount) || 0), 0) || 0;
  const billableHours = timeEntries?.filter((e: any) => e.billable === "yes").reduce((sum: number, e: any) => sum + (e.duration || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">טוען...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timer Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-6 h-6" />
            טיימר זמן
          </CardTitle>
          <CardDescription className="text-white/80">
            {runningTimer ? "טיימר פעיל" : "התחל מעקב זמן"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold font-mono">
              {formatTimerDisplay(elapsedTime)}
            </div>
            <div className="flex gap-2">
              {!runningTimer ? (
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={handleStartTimer}
                >
                  <Play className="w-5 h-5 ml-2" />
                  התחל
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleStopTimer}
                >
                  <Square className="w-5 h-5 ml-2" />
                  עצור
                </Button>
              )}
            </div>
          </div>
          {runningTimer && (
            <div className="mt-4 text-sm opacity-90">
              <div>תיאור: {runningTimer.description || "ללא תיאור"}</div>
              {runningTimer.clientId && <div>לקוח: {getClientName(runningTimer.clientId)}</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">סה"כ שעות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalHours)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">שעות לחיוב</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(billableHours)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">סכום כולל</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Table */}
      <MondayTable
        title="רשומות זמן"
        columns={columns}
        rowColors={rowColors}
        headerActions={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#6366F1] hover:bg-[#00cc00] text-black font-semibold"
            >
              <Plus className="w-4 h-4 ml-2" />
              רשומה ידנית
            </Button>
            <BoardInfoBubbleNew
              boardName="מעקב זמן"
              description="מעקב אחר שעות עבודה, ניהול טיימרים וחישוב עלויות"
              quickActions={[
                {
                  id: "add",
                  label: "הוסף רשומה",
                  icon: <Plus className="w-5 h-5 text-white" />,
                  description: "הוסף רשומת זמן ידנית",
                  action: () => setIsAddDialogOpen(true)
                },
                {
                  id: "stats",
                  label: "דוחות",
                  icon: <BarChart3 className="w-5 h-5 text-white" />,
                  description: "צפה בדוחות זמן",
                  action: () => toast.info("טוען דוחות...")
                }
              ]}
              automations={[
                "כאשר טיימר עוצר — המערכת מחשבת אוטומטית את הזמן והסכום",
                "כאשר רשומה מסומנת כ'לחיוב' — המערכת מוסיפה לחיוב הבא"
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
        {sortedData.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center py-12 text-gray-500">
              אין רשומות זמן להצגה - התחל טיימר או הוסף רשומה ידנית
            </td>
          </tr>
        ) : (
          sortedData.map((entry: any) => (
            <MondayTableRow key={entry.id}>
              <MondayTableCell>
                {entry.employeeId ? (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {getEmployeeName(entry.employeeId)}
                  </div>
                ) : "-"}
              </MondayTableCell>
              <MondayTableCell>
                {entry.clientId ? getClientName(entry.clientId) : "-"}
              </MondayTableCell>
              <MondayTableCell>
                {entry.taskId ? getTaskName(entry.taskId) : "-"}
              </MondayTableCell>
              <MondayTableCell>
                <div className="truncate max-w-[200px]" title={entry.description}>
                  {entry.description || "-"}
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="text-xs">
                  {entry.startTime && new Date(entry.startTime).toLocaleString('he-IL')}
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <span className="font-mono">{formatDuration(entry.duration || 0)}</span>
              </MondayTableCell>
              <MondayTableCell>{getBillableBadge(entry.billable)}</MondayTableCell>
              <MondayTableCell>
                {entry.totalAmount ? `₪${parseFloat(entry.totalAmount).toLocaleString()}` : "-"}
              </MondayTableCell>
              <MondayTableCell>{getStatusBadge(entry.status)}</MondayTableCell>
              <MondayTableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(entry)}
                    disabled={entry.status === "running"}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(entry)}
                    disabled={entry.status === "running"}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </MondayTableCell>
            </MondayTableRow>
          ))
        )}
      </MondayTable>

      {/* Sort Dialog */}
      <SortFilterDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        mode="sort"
        columns={columns}
        currentSort={sortConfig}
        onApplySort={(field, direction) => {
          applySort(field, direction);
          setSortDialogOpen(false);
        }}
        onClearSort={() => {
          clearSort();
          setSortDialogOpen(false);
        }}
      />

      {/* Filter Dialog */}
      <SortFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        mode="filter"
        columns={columns}
        currentFilters={filters}
        onApplyFilters={(newFilters) => {
          applyFilters(newFilters);
          setFilterDialogOpen(false);
        }}
        onClearFilters={() => {
          clearFilters();
          setFilterDialogOpen(false);
        }}
      />

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>הוסף רשומת זמן ידנית</DialogTitle>
            <DialogDescription>
              הזן את פרטי רשומת הזמן
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">עובד</Label>
              <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר עובד" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">לקוח</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר לקוח" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="taskId">משימה</Label>
              <Select value={formData.taskId} onValueChange={(value) => setFormData({ ...formData, taskId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר משימה" />
                </SelectTrigger>
                <SelectContent>
                  {tasks?.map((task: any) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.taskName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">תיאור</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="תיאור העבודה..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">זמן התחלה</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">זמן סיום</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">תעריף שעתי (₪)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="150"
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
            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="הערות נוספות..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleAdd}>
              הוסף רשומה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Similar to Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ערוך רשומת זמן</DialogTitle>
            <DialogDescription>
              עדכן את פרטי רשומת הזמן
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Same fields as Add Dialog */}
            <div className="space-y-2">
              <Label htmlFor="edit-employeeId">עובד</Label>
              <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר עובד" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-clientId">לקוח</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר לקוח" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-description">תיאור</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="תיאור העבודה..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-startTime">זמן התחלה</Label>
              <Input
                id="edit-startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endTime">זמן סיום</Label>
              <Input
                id="edit-endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hourlyRate">תעריף שעתי (₪)</Label>
              <Input
                id="edit-hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="150"
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleEdit}>
              עדכן רשומה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחק רשומת זמן</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את רשומת הזמן הזו?
              פעולה זו אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              מחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
