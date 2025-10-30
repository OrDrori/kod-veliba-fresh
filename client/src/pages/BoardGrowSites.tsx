import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Info, Plus, Pencil, Trash2, Filter, Search, Globe, BarChart3, DollarSign, Mail } from "lucide-react";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import { BoardInfoBubbleNew } from "@/components/BoardInfoBubbleNew";
import SortFilterDialog from "@/components/SortFilterDialog";
import { useSortFilter } from "@/hooks/useSortFilter";

const rowColors = ["bg-white", "bg-gray-50"];

export default function BoardGrowSites() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: sites = [], isLoading } = trpc.growSites.list.useQuery();
  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(sites, "grow-sites");

  const createMutation = trpc.growSites.create.useMutation({
    onSuccess: () => {
      utils.growSites.list.invalidate();
      toast.success("אתר נוסף בהצלחה!");
      setIsAddOpen(false);
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  const updateMutation = trpc.growSites.update.useMutation({
    onSuccess: () => {
      utils.growSites.list.invalidate();
      toast.success("אתר עודכן בהצלחה!");
      setIsEditOpen(false);
      setEditingSite(null);
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  const deleteMutation = trpc.growSites.delete.useMutation({
    onSuccess: () => {
      utils.growSites.list.invalidate();
      toast.success("אתר נמחק בהצלחה!");
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      owner: formData.get("owner") as string || null,
      status: formData.get("status") as string || "planning",
      priority: formData.get("priority") as string || "medium",
      clientId: formData.get("clientId") ? parseInt(formData.get("clientId") as string) : null,
      siteType: formData.get("siteType") as string || null,
      technology: formData.get("technology") as string || null,
      url: formData.get("url") as string || null,
      budget: formData.get("budget") ? parseFloat(formData.get("budget") as string) : null,
      hoursSpent: formData.get("hoursSpent") ? parseFloat(formData.get("hoursSpent") as string) : null,
      notes: formData.get("notes") as string || null,
    };
    createMutation.mutate(data);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSite) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingSite.id,
      name: formData.get("name") as string,
      owner: formData.get("owner") as string || null,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      clientId: formData.get("clientId") ? parseInt(formData.get("clientId") as string) : null,
      siteType: formData.get("siteType") as string || null,
      technology: formData.get("technology") as string || null,
      url: formData.get("url") as string || null,
      budget: formData.get("budget") ? parseFloat(formData.get("budget") as string) : null,
      hoursSpent: formData.get("hoursSpent") ? parseFloat(formData.get("hoursSpent") as string) : null,
      notes: formData.get("notes") as string || null,
    };
    updateMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("האם אתה בטוח שברצונך למחוק אתר זה?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Filter
  let filteredSites = sites.filter((site: any) => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (site.technology && site.technology.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === "all" || site.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    { id: "name", label: "שם האתר", icon: <Globe className="w-4 h-4" />, width: "20%" },
    { id: "owner", label: "אחראי", width: "12%" },
    { id: "status", label: "סטטוס", width: "12%" },
    { id: "priority", label: "עדיפות", width: "10%" },
    { id: "siteType", label: "סוג אתר", width: "12%" },
    { id: "technology", label: "טכנולוגיה", width: "12%" },
    { id: "url", label: "URL", width: "15%" },
    { id: "actions", label: "פעולות", width: "7%" },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      planning: { label: "תכנון", color: "bg-gray-500" },
      design: { label: "עיצוב", color: "bg-blue-500" },
      development: { label: "פיתוח", color: "bg-yellow-500" },
      testing: { label: "בדיקות", color: "bg-orange-500" },
      live: { label: "פעיל", color: "bg-green-500" },
      maintenance: { label: "תחזוקה", color: "bg-purple-500" },
      paused: { label: "מושהה", color: "bg-red-500" },
      missing_details: { label: "פרטים חסרים", color: "bg-pink-500" },
    };
    const config = statusConfig[status] || { label: status, color: "bg-gray-500" };
    return (
      <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: any = {
      low: { label: "נמוכה", color: "bg-blue-500" },
      medium: { label: "בינונית", color: "bg-yellow-500" },
      high: { label: "גבוהה", color: "bg-orange-500" },
      urgent: { label: "דחופה", color: "bg-red-500" },
    };
    const config = priorityConfig[priority] || { label: priority, color: "bg-gray-500" };
    return (
      <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

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
        title="🌐 Grow Sites - ניהול אתרים"
        description="ניהול מרכזי של כל האתרים והפרויקטים הדיגיטליים"
        columns={columns}
        onAddItem={() => setIsAddOpen(true)}
        headerActions={
          <div className="flex gap-2">
            <BoardInfoBubbleNew
              boardName="בורד Grow Sites"
              description="ניהול משימות טכניות עבור חברת GROW - הצוות הטכני שלהם לטיפול בבאגים והתקנות ללקוחות שלהם."
              features={[
                "קבלת משימה מ-GROW",
                "ניתוח הבעיה/דרישה",
                "ביצוע התיקון/התקנה",
                "בדיקות QA",
                "דיווח חזרה ל-GROW",
                "סגירת המשימה",
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
                  id: "sites",
                  label: "אתרים פעילים",
                  icon: <Globe className="w-5 h-5 text-white" />,
                  description: "צפה באתרים פעילים",
                  action: () => toast.info("טוען אתרים...")
                },
                {
                  id: "report",
                  label: "דוח משימות",
                  icon: <BarChart3 className="w-5 h-5 text-white" />,
                  description: "צפה בדוח משימות",
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
                "כאשר משימה מסומנת כ-'הושלם' — המערכת שולחת דיווח אוטומטי ל-GROW",
                "כאשר משימה חורגת מתאריך יעד — המערכת שולחת תזכורת למנהל פרויקט"
              ]}
            />
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="חיפוש..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-64"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <Filter className="ml-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="planning">תכנון</SelectItem>
                <SelectItem value="design">עיצוב</SelectItem>
                <SelectItem value="development">פיתוח</SelectItem>
                <SelectItem value="testing">בדיקות</SelectItem>
                <SelectItem value="live">פעיל</SelectItem>
                <SelectItem value="maintenance">תחזוקה</SelectItem>
                <SelectItem value="paused">מושהה</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        {filteredSites && filteredSites.length > 0 ? (
          filteredSites.map((site: any, index: number) => (
            <MondayTableRow key={site.id} color={rowColors[index % rowColors.length]}>
              <MondayTableCell>
                <div className="font-semibold text-gray-900">{site.name}</div>
              </MondayTableCell>
              <MondayTableCell>
                {site.owner || "-"}
              </MondayTableCell>
              <MondayTableCell>
                {getStatusBadge(site.status)}
              </MondayTableCell>
              <MondayTableCell>
                {getPriorityBadge(site.priority)}
              </MondayTableCell>
              <MondayTableCell>
                {site.siteType || "-"}
              </MondayTableCell>
              <MondayTableCell>
                {site.technology || "-"}
              </MondayTableCell>
              <MondayTableCell>
                {site.url ? (
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {site.url.substring(0, 30)}...
                  </a>
                ) : "-"}
              </MondayTableCell>
              <MondayTableCell>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingSite(site);
                      setIsEditOpen(true);
                    }}
                    className="hover:bg-blue-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(site.id)}
                    className="hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </MondayTableCell>
            </MondayTableRow>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="text-center py-8 text-gray-500">
              אין אתרים להצגה
            </td>
          </tr>
        )}
      </MondayTable>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף אתר חדש</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">שם האתר *</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="owner">אחראי</Label>
                <Input id="owner" name="owner" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">סטטוס</Label>
                <Select name="status" defaultValue="planning">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">תכנון</SelectItem>
                    <SelectItem value="design">עיצוב</SelectItem>
                    <SelectItem value="development">פיתוח</SelectItem>
                    <SelectItem value="testing">בדיקות</SelectItem>
                    <SelectItem value="live">פעיל</SelectItem>
                    <SelectItem value="maintenance">תחזוקה</SelectItem>
                    <SelectItem value="paused">מושהה</SelectItem>
                    <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">עדיפות</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">נמוכה</SelectItem>
                    <SelectItem value="medium">בינונית</SelectItem>
                    <SelectItem value="high">גבוהה</SelectItem>
                    <SelectItem value="urgent">דחופה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteType">סוג אתר</Label>
                <Input id="siteType" name="siteType" placeholder="תדמית/חנות/אפליקציה" />
              </div>
              <div>
                <Label htmlFor="technology">טכנולוגיה</Label>
                <Input id="technology" name="technology" placeholder="WordPress/React/Next.js" />
              </div>
            </div>

            <div>
              <Label htmlFor="url">URL</Label>
              <Input id="url" name="url" type="url" placeholder="https://example.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">תקציב (₪)</Label>
                <Input id="budget" name="budget" type="number" step="0.01" />
              </div>
              <div>
                <Label htmlFor="hoursSpent">שעות שהושקעו</Label>
                <Input id="hoursSpent" name="hoursSpent" type="number" step="0.5" />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">הערות</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                ביטול
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow">
                הוסף אתר
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>ערוך אתר</DialogTitle>
          </DialogHeader>
          {editingSite && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">שם האתר *</Label>
                  <Input id="edit-name" name="name" defaultValue={editingSite.name} required />
                </div>
                <div>
                  <Label htmlFor="edit-owner">אחראי</Label>
                  <Input id="edit-owner" name="owner" defaultValue={editingSite.owner || ""} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">סטטוס</Label>
                  <Select name="status" defaultValue={editingSite.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">תכנון</SelectItem>
                      <SelectItem value="design">עיצוב</SelectItem>
                      <SelectItem value="development">פיתוח</SelectItem>
                      <SelectItem value="testing">בדיקות</SelectItem>
                      <SelectItem value="live">פעיל</SelectItem>
                      <SelectItem value="maintenance">תחזוקה</SelectItem>
                      <SelectItem value="paused">מושהה</SelectItem>
                      <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-priority">עדיפות</Label>
                  <Select name="priority" defaultValue={editingSite.priority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">נמוכה</SelectItem>
                      <SelectItem value="medium">בינונית</SelectItem>
                      <SelectItem value="high">גבוהה</SelectItem>
                      <SelectItem value="urgent">דחופה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-siteType">סוג אתר</Label>
                  <Input id="edit-siteType" name="siteType" defaultValue={editingSite.siteType || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-technology">טכנולוגיה</Label>
                  <Input id="edit-technology" name="technology" defaultValue={editingSite.technology || ""} />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-url">URL</Label>
                <Input id="edit-url" name="url" type="url" defaultValue={editingSite.url || ""} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-budget">תקציב (₪)</Label>
                  <Input id="edit-budget" name="budget" type="number" step="0.01" defaultValue={editingSite.budget || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-hoursSpent">שעות שהושקעו</Label>
                  <Input id="edit-hoursSpent" name="hoursSpent" type="number" step="0.5" defaultValue={editingSite.hoursSpent || ""} />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-notes">הערות</Label>
                <Textarea id="edit-notes" name="notes" rows={3} defaultValue={editingSite.notes || ""} />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditOpen(false);
                  setEditingSite(null);
                }}>
                  ביטול
                </Button>
                <Button type="submit">
                  שמור שינויים
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

