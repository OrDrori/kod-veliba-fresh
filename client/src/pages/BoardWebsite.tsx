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
import { Edit, Trash2, Globe, Calendar, Plus, BarChart3, DollarSign, Mail } from "lucide-react";
import { toast } from "sonner";
import SortFilterDialog from "@/components/SortFilterDialog";
import { useSortFilter } from "@/hooks/useSortFilter";

const statusColors: Record<string, string> = {
  planning: "bg-gray-100 text-gray-800",
  design: "bg-purple-100 text-purple-800",
  development: "bg-blue-100 text-blue-800",
  testing: "bg-yellow-100 text-yellow-800",
  live: "bg-green-100 text-green-800",
  maintenance: "bg-orange-100 text-orange-800",
  missing_details: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  planning: "תכנון",
  design: "עיצוב",
  development: "פיתוח",
  testing: "בדיקות",
  live: "באוויר",
  maintenance: "תחזוקה",
  missing_details: "פרטים חסרים",
};

const projectTypeLabels: Record<string, string> = {
  wordpress: "וורדפרס",
  custom: "מותאם אישית",
  ecommerce: "חנות מקוונת",
  landing: "דף נחיתה",
  other: "אחר",
};

export default function BoardWebsite() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "custom",
    status: "planning",
    url: "",
    launchDate: "",
    notes: "",
  });

  const { data: projects = [] } = trpc.websiteProjects.list.useQuery();
  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(projects, "website");

  const addMutation = trpc.websiteProjects.create.useMutation({
    onSuccess: () => {
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("פרויקט אתר נוסף בהצלחה");
    },
    onError: () => toast.error("שגיאה בהוספת פרויקט אתר"),
  });

  const updateMutation = trpc.websiteProjects.update.useMutation({
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      resetForm();
      toast.success("פרויקט אתר עודכן בהצלחה");
    },
    onError: () => toast.error("שגיאה בעדכון פרויקט אתר"),
  });

  const deleteMutation = trpc.websiteProjects.delete.useMutation({
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      toast.success("פרויקט אתר נמחק בהצלחה");
    },
    onError: () => toast.error("שגיאה במחיקת פרויקט אתר"),
  });

  const resetForm = () => {
    setFormData({
      projectName: "",
      projectType: "custom",
      status: "planning",
      url: "",
      launchDate: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    if (!formData.projectName) {
      toast.error("נא למלא את שם הפרויקט");
      return;
    }

    addMutation.mutate({
      projectName: formData.projectName,
      projectType: formData.projectType,
      status: formData.status,
      url: formData.url || null,
      launchDate: formData.launchDate ? new Date(formData.launchDate) : null,
      notes: formData.notes || null,
    });
  };

  const handleUpdate = () => {
    if (!selectedProject) return;

    updateMutation.mutate({
      id: selectedProject.id,
      projectName: formData.projectName,
      projectType: formData.projectType,
      status: formData.status,
      url: formData.url || null,
      launchDate: formData.launchDate ? new Date(formData.launchDate) : null,
      notes: formData.notes || null,
    });
  };

  const handleDelete = () => {
    if (selectedProject) {
      deleteMutation.mutate(selectedProject.id);
    }
  };

  const openEditDialog = (project: any) => {
    setSelectedProject(project);
    setFormData({
      projectName: project.projectName || "",
      projectType: project.projectType || "custom",
      status: project.status || "planning",
      url: project.url || "",
      launchDate: project.launchDate ? new Date(project.launchDate).toISOString().split('T')[0] : "",
      notes: project.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (project: any) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const columns = [
    { id: "projectName", label: "שם פרויקט", icon: <Globe className="w-4 h-4" />, width: "25%" },
    { id: "projectType", label: "סוג פרויקט", width: "15%" },
    { id: "status", label: "סטטוס", width: "15%" },
    { id: "url", label: "כתובת אתר", width: "20%" },
    { id: "launchDate", label: "תאריך השקה", icon: <Calendar className="w-4 h-4" />, width: "15%" },
  ];

  return (
    <>
      <MondayTable
        title="פרויקטי אתרים"
        description="מעקב אחר פרויקטי אתרים"
        columns={columns}
        onAddItem={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}
        headerActions={
          <div className="flex items-center gap-2">
            <BoardInfoBubbleNew
              boardName="בורד פרויקטי אתרים"
              description="ניהול מרכזי של כל פרויקטי האתרים של העסק. כולל מעקב אחר אתרי וורדפרס, אתרים מותאמים אישית, חנויות מקוונות, דפי נחיתה ועוד."
              features={[
                "הוסף פרויקט אתר חדש דרך 'פריט חדש'",
                "בחר סוג פרויקט: וורדפרס, מותאם אישית, חנות מקוונת, דף נחיתה, או אחר",
                "שייך ללקוח ספציפי",
                "עדכן סטטוס: תכנון → עיצוב → פיתוח → בדיקות → באוויר → תחזוקה",
                "הוסף URL של האתר",
                "הגדר תאריך השקה מתוכנן"
              ]}
              quickActions={[
                {
                  id: "add",
                  label: "פרויקט חדש",
                  icon: <Plus className="w-5 h-5 text-white" />,
                  description: "צור פרויקט אתר",
                  action: () => toast.info("פתיחת טופס פרויקט...")
                },
                {
                  id: "live",
                  label: "אתרים באוויר",
                  icon: <Globe className="w-5 h-5 text-white" />,
                  description: "צפה באתרים באוויר",
                  action: () => toast.info("טוען אתרים...")
                },
                {
                  id: "maintenance",
                  label: "תחזוקה",
                  icon: <BarChart3 className="w-5 h-5 text-white" />,
                  description: "צפה בתחזוקה",
                  action: () => toast.info("טוען תחזוקה...")
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
                "כאשר פרויקט מסומן כ-'באוויר' — המערכת שולחת התראה ללקוח ולצוות",
                "כאשר פרויקט חורג מתאריך השקה — המערכת שולחת תזכורת למנהל פרויקט"
              ]}
            />
          </div>
        }
      >
        {projects.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center py-12 text-gray-500">
              אין פרויקטי אתרים להצגה - לחץ על "פריט חדש" להוספה
            </td>
          </tr>
        ) : (
          projects.map((project: any) => (
            <MondayTableRow key={project.id}>
              <MondayTableCell>{project.projectName}</MondayTableCell>
              <MondayTableCell>{projectTypeLabels[project.projectType]}</MondayTableCell>
              <MondayTableCell>
                <Badge className={statusColors[project.status]}>
                  {statusLabels[project.status]}
                </Badge>
              </MondayTableCell>
              <MondayTableCell>
                {project.url ? (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {project.url}
                  </a>
                ) : "-"}
              </MondayTableCell>
              <MondayTableCell>
                {project.launchDate ? new Date(project.launchDate).toLocaleDateString("he-IL") : "-"}
              </MondayTableCell>
              <MondayTableCell className="w-24">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(project)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(project)}
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
            <DialogTitle>הוספת פרויקט אתר חדש</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">שם פרויקט *</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="שם הפרויקט"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectType">סוג פרויקט</Label>
                <Select value={formData.projectType} onValueChange={(value) => setFormData({ ...formData, projectType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(projectTypeLabels).map(([value, label]) => (
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
                <Label htmlFor="url">כתובת אתר</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="launchDate">תאריך השקה</Label>
                <Input
                  id="launchDate"
                  type="date"
                  value={formData.launchDate}
                  onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
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
            <Button onClick={handleAdd} className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow">הוסף פרויקט</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת פרויקט אתר</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-projectName">שם פרויקט *</Label>
              <Input
                id="edit-projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="שם הפרויקט"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-projectType">סוג פרויקט</Label>
                <Select value={formData.projectType} onValueChange={(value) => setFormData({ ...formData, projectType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(projectTypeLabels).map(([value, label]) => (
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
                <Label htmlFor="edit-url">כתובת אתר</Label>
                <Input
                  id="edit-url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-launchDate">תאריך השקה</Label>
                <Input
                  id="edit-launchDate"
                  type="date"
                  value={formData.launchDate}
                  onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
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
            <DialogTitle>מחיקת פרויקט אתר</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            האם אתה בטוח שברצונך למחוק את הפרויקט "{selectedProject?.projectName}"? פעולה זו אינה ניתנת לביטול.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-gradient-to-r from-red-600 to-red-700 hover:scale-105 transition-transform">
              מחק פרויקט
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

