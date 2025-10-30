import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BoardInfoBubbleNew } from "@/components/BoardInfoBubbleNew";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Palette, Calendar, User, Plus, BarChart3, DollarSign, Mail } from "lucide-react";
import { toast } from "sonner";
import SortFilterDialog from "@/components/SortFilterDialog";
import { useSortFilter } from "@/hooks/useSortFilter";

const statusColors: Record<string, string> = {
  todo: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  done: "bg-emerald-100 text-emerald-800",
  missing_details: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<string, string> = {
  todo: "לביצוע",
  in_progress: "בתהליך",
  review: "בבדיקה",
  approved: "אושר",
  done: "הושלם",
  missing_details: "פרטים חסרים",
};

const designTypeLabels: Record<string, string> = {
  logo: "לוגו",
  banner: "באנר",
  ui: "ממשק משתמש",
  mockup: "מוקאפ",
  other: "אחר",
};

export default function BoardDesignTasks() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    taskName: "",
    designType: "ui",
    status: "todo",
    assignedTo: "",
    dueDate: "",
    notes: "",
  });

  const { data: tasks = [] } = trpc.designTasks.list.useQuery();
  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(tasks, "design-tasks");

  const addMutation = trpc.designTasks.create.useMutation({
    onSuccess: () => {
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("משימת עיצוב נוספה בהצלחה");
    },
    onError: () => toast.error("שגיאה בהוספת משימת עיצוב"),
  });

  const updateMutation = trpc.designTasks.update.useMutation({
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      resetForm();
      toast.success("משימת עיצוב עודכנה בהצלחה");
    },
    onError: () => toast.error("שגיאה בעדכון משימת עיצוב"),
  });

  const deleteMutation = trpc.designTasks.delete.useMutation({
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedTask(null);
      toast.success("משימת עיצוב נמחקה בהצלחה");
    },
    onError: () => toast.error("שגיאה במחיקת משימת עיצוב"),
  });

  const resetForm = () => {
    setFormData({
      taskName: "",
      designType: "ui",
      status: "todo",
      assignedTo: "",
      dueDate: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    if (!formData.taskName) {
      toast.error("נא למלא את שם המשימה");
      return;
    }

    addMutation.mutate({
      taskName: formData.taskName,
      designType: formData.designType,
      status: formData.status,
      assignedTo: formData.assignedTo || null,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      notes: formData.notes || null,
    });
  };

  const handleUpdate = () => {
    if (!selectedTask) return;

    updateMutation.mutate({
      id: selectedTask.id,
      taskName: formData.taskName,
      designType: formData.designType,
      status: formData.status,
      assignedTo: formData.assignedTo || null,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      notes: formData.notes || null,
    });
  };

  const handleDelete = () => {
    if (selectedTask) {
      deleteMutation.mutate(selectedTask.id);
    }
  };

  const openEditDialog = (task: any) => {
    setSelectedTask(task);
    setFormData({
      taskName: task.taskName || "",
      designType: task.designType || "ui",
      status: task.status || "todo",
      assignedTo: task.assignedTo || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      notes: task.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: any) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const columns = [
    { id: "taskName", label: "שם משימה", icon: <Palette className="w-4 h-4" />, width: "25%" },
    { id: "designType", label: "סוג עיצוב", width: "15%" },
    { id: "status", label: "סטטוס", width: "15%" },
    { id: "assignedTo", label: "מוקצה ל", icon: <User className="w-4 h-4" />, width: "15%" },
    { id: "dueDate", label: "תאריך יעד", icon: <Calendar className="w-4 h-4" />, width: "15%" },
  ];

  return (
    <>
      <MondayTable
        title="משימות עיצוב"
        description="ניהול משימות עיצוב גרפי"
        columns={columns}
        onAddItem={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}
        headerActions={
          <div className="flex items-center gap-2">
            <BoardInfoBubbleNew
              boardName="בורד משימות עיצוב"
              description="ניהול וארגון כל משימות העיצוב הגרפי של העסק. כולל מעקב אחר לוגואים, באנרים, ממשקי משתמש, מוקאפים וכל סוג עיצוב אחר."
              features={[
                "הוסף משימת עיצוב חדשה דרך 'פריט חדש'",
                "בחר סוג עיצוב: לוגו, באנר, ממשק, מוקאפ, כרטיס ביקור, או אחר",
                "שייך ללקוח ספציפי",
                "הגדר מעצב אחראי (דני, שרה, מיכאל, רונית)",
                "עדכן סטטוס: ממתין → בעבודה → בביקורת → הושלם",
                "הגדר תאריך יעד למשימה"
              ]}
              quickActions={[
                {
                  id: "add",
                  label: "משימה חדשה",
                  icon: <Plus className="w-5 h-5 text-white" />,
                  description: "צור משימת עיצוב",
                  action: () => toast.info("פתיחת טופס עיצוב...")
                },
                {
                  id: "designer",
                  label: "מעצבים",
                  icon: <Palette className="w-5 h-5 text-white" />,
                  description: "צפה במעצבים",
                  action: () => toast.info("טוען מעצבים...")
                },
                {
                  id: "gallery",
                  label: "גלריה",
                  icon: <BarChart3 className="w-5 h-5 text-white" />,
                  description: "צפה בגלריית עיצובים",
                  action: () => toast.info("פתיחת גלריה...")
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
                "כאשר משימת עיצוב מסומנת כ-'הושלם' — המערכת שולחת התראה ללקוח אוטומטית",
                "כאשר משימה חורגת מתאריך יעד — המערכת שולחת תזכורת למעצב"
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
              אין משימות עיצוב להצגה - לחץ על "פריט חדש" להוספה
            </td>
          </tr>
        ) : (
          sortedData.map((task: any) => (
            <MondayTableRow key={task.id}>
              <MondayTableCell>{task.taskName}</MondayTableCell>
              <MondayTableCell>{designTypeLabels[task.designType]}</MondayTableCell>
              <MondayTableCell>
                <Badge className={statusColors[task.status]}>
                  {statusLabels[task.status]}
                </Badge>
              </MondayTableCell>
              <MondayTableCell>{task.assignedTo || "-"}</MondayTableCell>
              <MondayTableCell>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString("he-IL") : "-"}
              </MondayTableCell>
              <MondayTableCell className="w-24">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(task)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(task)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </MondayTableCell>
            </MondayTableRow>
          ))
        )}
      </MondayTable>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת משימת עיצוב חדשה</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">שם משימה *</Label>
              <Input
                id="taskName"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                placeholder="תיאור המשימה"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designType">סוג עיצוב</Label>
                <Select value={formData.designType} onValueChange={(value) => setFormData({ ...formData, designType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(designTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
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
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">מוקצה ל</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="שם המעצב"
                />
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
            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="הערות נוספות..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleAdd} className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow">הוסף משימה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת משימת עיצוב</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-taskName">שם משימה *</Label>
              <Input
                id="edit-taskName"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                placeholder="תיאור המשימה"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-designType">סוג עיצוב</Label>
                <Select value={formData.designType} onValueChange={(value) => setFormData({ ...formData, designType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(designTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
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
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-assignedTo">מוקצה ל</Label>
                <Input
                  id="edit-assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="שם המעצב"
                />
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
            <div className="space-y-2">
              <Label htmlFor="edit-notes">הערות</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="הערות נוספות..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleUpdate} className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow">שמור שינויים</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת משימת עיצוב</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            האם אתה בטוח שברצונך למחוק את המשימה "{selectedTask?.taskName}"? פעולה זו אינה ניתנת לביטול.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-gradient-to-r from-red-600 to-red-700 hover:scale-105 transition-transform">
              מחק משימה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SortFilterDialog
        open={sortDialogOpen}
        onClose={() => setSortDialogOpen(false)}
        mode="sort"
        columns={columns}
        currentSort={sortConfig || undefined}
        onApplySort={applySort}
        onClearSort={clearSort}
      />

      <SortFilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        mode="filter"
        columns={columns}
        currentFilters={filters}
        onApplyFilter={applyFilters}
        onClearFilters={clearFilters}
      />
    </>
  );
}

