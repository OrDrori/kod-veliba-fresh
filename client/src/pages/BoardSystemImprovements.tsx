import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import {
  Settings,
  CheckSquare,
  Pencil,
  Trash2,
  Plus,
  AlertCircle,
  BarChart3,
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

const typeColors = {
  feature: "bg-blue-100 text-blue-800",
  bug: "bg-red-100 text-red-800",
  improvement: "bg-green-100 text-green-800",
  task: "bg-gray-100 text-gray-800",
};

const priorityColors = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-gray-500 text-white",
};

const statusColors = {
  todo: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  testing: "bg-purple-100 text-purple-800",
  done: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800",
  missing_details: "bg-orange-100 text-orange-800",
};

export default function BoardSystemImprovements() {
  const { data: improvements, isLoading } = trpc.systemImprovements.list.useQuery();
  const utils = trpc.useUtils();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImprovement, setSelectedImprovement] = useState<any>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(improvements, "system-improvements");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "feature",
    phase: "",
    priority: "medium",
    status: "todo",
    assignedTo: "",
    estimatedHours: "",
    notes: "",
  });

  const addMutation = trpc.systemImprovements.create.useMutation({
    onSuccess: () => {
      utils.systemImprovements.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("שיפור נוסף בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בהוספת שיפור: " + error.message);
    },
  });

  const updateMutation = trpc.systemImprovements.update.useMutation({
    onSuccess: () => {
      utils.systemImprovements.list.invalidate();
      setIsEditDialogOpen(false);
      setSelectedImprovement(null);
      resetForm();
      toast.success("שיפור עודכן בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בעדכון שיפור: " + error.message);
    },
  });

  const deleteMutation = trpc.systemImprovements.delete.useMutation({
    onSuccess: () => {
      utils.systemImprovements.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedImprovement(null);
      toast.success("שיפור נמחק בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה במחיקת שיפור: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "feature",
      phase: "",
      priority: "medium",
      status: "todo",
      assignedTo: "",
      estimatedHours: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    addMutation.mutate({
      ...formData,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
    });
  };

  const handleEdit = (improvement: any) => {
    setSelectedImprovement(improvement);
    setFormData({
      title: improvement.title || "",
      description: improvement.description || "",
      type: improvement.type || "feature",
      phase: improvement.phase || "",
      priority: improvement.priority || "medium",
      status: improvement.status || "todo",
      assignedTo: improvement.assignedTo || "",
      estimatedHours: improvement.estimatedHours?.toString() || "",
      notes: improvement.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedImprovement) return;
    
    updateMutation.mutate({
      id: selectedImprovement.id,
      ...formData,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
    });
  };

  const handleDelete = (improvement: any) => {
    setSelectedImprovement(improvement);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedImprovement) return;
    deleteMutation.mutate({ id: selectedImprovement.id });
  };

  if (isLoading) {
    return <div className="p-8">טוען...</div>;
  }

  const columns = [
    { id: 'title', label: 'כותרת' },
    { id: 'type', label: 'סוג' },
    { id: 'phase', label: 'Phase' },
    { id: 'priority', label: 'עדיפות' },
    { id: 'status', label: 'סטטוס' },
    { id: 'assignedTo', label: 'מוקצה ל' },
    { id: 'estimatedHours', label: 'שעות (הערכה)' },
    { id: 'progress', label: 'התקדמות' },
  ];

  return (
    <div className="p-6">
      <MondayTable
        title="שיפורים ועדכוני מערכת"
        description="ניהול כל השיפורים, תכונות חדשות ותיקוני באגים של המערכת"
        columns={[
          { id: 'title', label: 'כותרת' },
          { id: 'type', label: 'סוג' },
          { id: 'phase', label: 'Phase' },
          { id: 'priority', label: 'עדיפות' },
          { id: 'status', label: 'סטטוס' },
          { id: 'assignedTo', label: 'מוקצה ל' },
          { id: 'estimatedHours', label: 'שעות (הערכה)' },
          { id: 'progress', label: 'התקדמות' },
          { id: 'actions', label: 'פעולות' },
        ]}
        onAddItem={() => setIsAddDialogOpen(true)}
        headerActions={
          <div className="flex gap-2">
            <BoardInfoBubbleNew
              boardName="בורד שיפורי מערכת"
              description="ניהול כל השיפורים, תכונות חדשות ותיקוני באגים של המערכת. מעקב התקדמות עם checkboxes דינמיים וprogress tracking."
              features={[
                "הוסף שיפור חדש דרך 'פריט חדש'",
                "בחר סוג: feature, bug, improvement, task",
                "הגדר עדיפות: critical, high, medium, low",
                "עדכן סטטוס: todo → in_progress → testing → done → blocked",
                "הוסף checkboxes דינמיים למעקב התקדמות",
                "צפה ב-progress bar אוטומטי (X/Y checkboxes)",
                "אורגן לפי Phases לניהול מרובה שלבים"
              ]}
              quickActions={[
                {
                  id: "add",
                  label: "שיפור חדש",
                  icon: <Plus className="w-5 h-5 text-white" />,
                  description: "צור שיפור חדש",
                  action: () => toast.info("פתיחת טופס שיפור...")
                },
                {
                  id: "bugs",
                  label: "באגים",
                  icon: <AlertCircle className="w-5 h-5 text-white" />,
                  description: "צפה בבאגים",
                  action: () => toast.info("טוען באגים...")
                },
                {
                  id: "report",
                  label: "דוח התקדמות",
                  icon: <BarChart3 className="w-5 h-5 text-white" />,
                  description: "צפה בדוח התקדמות",
                  action: () => toast.info("טוען דוח...")
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
                "כאשר כל ה-checkboxes מסומנים — המערכת מעדכנת אוטומטית סטטוס ל-'done'",
                "כאשר שיפור מסומן כ-'critical' — המערכת שולחת התראה למנהל"
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
              מיון {sortConfig && '✓'}
            </Button>
          </div>
        }
      >
        {improvements?.map((improvement: any, index: number) => (
            <MondayTableRow key={improvement.id}>
              <MondayTableCell>{improvement.title}</MondayTableCell>
              <MondayTableCell>
                <Badge className={typeColors[improvement.type as keyof typeof typeColors]}>
                  {improvement.type}
                </Badge>
              </MondayTableCell>
              <MondayTableCell>{improvement.phase || "-"}</MondayTableCell>
              <MondayTableCell>
                <Badge className={priorityColors[improvement.priority as keyof typeof priorityColors]}>
                  {improvement.priority}
                </Badge>
              </MondayTableCell>
              <MondayTableCell>
                <Badge className={statusColors[improvement.status as keyof typeof statusColors]}>
                  {improvement.status}
                </Badge>
              </MondayTableCell>
              <MondayTableCell>{improvement.assignedTo || "-"}</MondayTableCell>
              <MondayTableCell>{improvement.estimatedHours || "-"}</MondayTableCell>
              <MondayTableCell>
                {improvement.totalCheckboxes > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--cc-neon-green)] transition-all"
                        style={{
                          width: `${(improvement.completedCheckboxes / improvement.totalCheckboxes) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {improvement.completedCheckboxes}/{improvement.totalCheckboxes}
                    </span>
                  </div>
                ) : (
                  "-"
                )}
              </MondayTableCell>
              <MondayTableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(improvement)}
                    className="hover:bg-[var(--cc-neon-green)] hover:text-white transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(improvement)}
                    className="hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </MondayTableCell>
            </MondayTableRow>
        ))}
      </MondayTable>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף שיפור חדש</DialogTitle>
            <DialogDescription>
              הוסף תכונה חדשה, תיקון באג או שיפור למערכת
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">כותרת *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="לדוגמה: הוספת בורד שיפורים ועדכוני מערכת"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="תיאור מפורט של השיפור..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">סוג *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature (תכונה)</SelectItem>
                    <SelectItem value="bug">Bug (באג)</SelectItem>
                    <SelectItem value="improvement">Improvement (שיפור)</SelectItem>
                    <SelectItem value="task">Task (משימה)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phase">Phase</Label>
                <Input
                  id="phase"
                  value={formData.phase}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                  placeholder="לדוגמה: Phase 0, Phase 1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">עדיפות *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical (קריטי)</SelectItem>
                    <SelectItem value="high">High (גבוה)</SelectItem>
                    <SelectItem value="medium">Medium (בינוני)</SelectItem>
                    <SelectItem value="low">Low (נמוך)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">סטטוס *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo (לביצוע)</SelectItem>
                    <SelectItem value="in_progress">In Progress (בביצוע)</SelectItem>
                    <SelectItem value="testing">Testing (בבדיקה)</SelectItem>
                    <SelectItem value="done">Done (הושלם)</SelectItem>
                    <SelectItem value="blocked">Blocked (חסום)</SelectItem>
                    <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assignedTo">מוקצה ל</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="שם המפתח"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="estimatedHours">הערכת שעות</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  placeholder="מספר שעות"
                />
              </div>
            </div>

            <div className="grid gap-2">
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
            <Button
              onClick={handleAdd}
              disabled={!formData.title || addMutation.isPending}
              className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow"
            >
              {addMutation.isPending ? "מוסיף..." : "הוסף שיפור"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Same as Add but with Update button */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>ערוך שיפור</DialogTitle>
            <DialogDescription>
              ערוך את פרטי השיפור
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Same form fields as Add Dialog */}
            <div className="grid gap-2">
              <Label htmlFor="edit-title">כותרת *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">תיאור</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">סוג *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature (תכונה)</SelectItem>
                    <SelectItem value="bug">Bug (באג)</SelectItem>
                    <SelectItem value="improvement">Improvement (שיפור)</SelectItem>
                    <SelectItem value="task">Task (משימה)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-phase">Phase</Label>
                <Input
                  id="edit-phase"
                  value={formData.phase}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">עדיפות *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical (קריטי)</SelectItem>
                    <SelectItem value="high">High (גבוה)</SelectItem>
                    <SelectItem value="medium">Medium (בינוני)</SelectItem>
                    <SelectItem value="low">Low (נמוך)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">סטטוס *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo (לביצוע)</SelectItem>
                    <SelectItem value="in_progress">In Progress (בביצוע)</SelectItem>
                    <SelectItem value="testing">Testing (בבדיקה)</SelectItem>
                    <SelectItem value="done">Done (הושלם)</SelectItem>
                    <SelectItem value="blocked">Blocked (חסום)</SelectItem>
                    <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-assignedTo">מוקצה ל</Label>
                <Input
                  id="edit-assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-estimatedHours">הערכת שעות</Label>
                <Input
                  id="edit-estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">הערות</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ביטול
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.title || updateMutation.isPending}
              className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow"
            >
              {updateMutation.isPending ? "שומר..." : "שמור שינויים"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת שיפור</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את השיפור "{selectedImprovement?.title}"?
              פעולה זו אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow"
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "מוחק..." : "מחק שיפור"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sort/Filter Dialogs */}
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
    </div>
  );
}

