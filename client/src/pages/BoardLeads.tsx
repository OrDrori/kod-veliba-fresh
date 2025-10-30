import { useState } from "react";

import { trpc } from "@/lib/trpc";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, User, Mail, Phone, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { BoardInfoBubbleNew } from "@/components/BoardInfoBubbleNew";
import SortFilterDialog from "@/components/SortFilterDialog";
import { useSortFilter } from "@/hooks/useSortFilter";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  qualified: "bg-green-100 text-green-800",
  proposal: "bg-yellow-100 text-yellow-800",
  negotiation: "bg-orange-100 text-orange-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-red-100 text-red-800",
  missing_details: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<string, string> = {
  new: "חדש",
  contacted: "יצרנו קשר",
  qualified: "מתאים",
  proposal: "הצעת מחיר",
  negotiation: "משא ומתן",
  won: "נסגר",
  lost: "אבד",
  missing_details: "פרטים חסרים",
};

const sourceOptions = ["אתר", "המלצה", "פייסבוק", "גוגל", "לינקדאין", "אחר"];

export default function BoardLeads() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  
  // Sort & Filter
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    leadName: "",
    contactPerson: "",
    email: "",
    phone: "",
    source: "",
    status: "new",
    estimatedValue: "",
    notes: "",
  });

  const { data: leads = [] } = trpc.leads.list.useQuery();
  const utils = trpc.useUtils();
  
  // Sort & Filter hook
  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(leads, "leads");

  const addMutation = trpc.leads.create.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("ליד נוסף בהצלחה");
    },
    onError: () => toast.error("שגיאה בהוספת ליד"),
  });

  const createClientMutation = trpc.crm.create.useMutation({
    onSuccess: () => {
      utils.crm.list.invalidate();
    },
  });

  const updateMutation = trpc.leads.update.useMutation({
    onSuccess: async (_, variables) => {
      utils.leads.list.invalidate();
      
      // Automation: Convert lead to client when status is "won"
      if (variables.status === "won" && selectedLead) {
        try {
          // Create client from lead data
          await createClientMutation.mutateAsync({
            clientName: selectedLead.leadName,
            contactPerson: selectedLead.contactPerson,
            email: selectedLead.email,
            phone: selectedLead.phone,
            businessType: "hourly", // Default
            status: "active",
            monthlyRetainer: selectedLead.estimatedValue || 0,
            notes: `הומר מליד: ${selectedLead.notes || ""}`,
          });
          
          toast.success("ליד הומר ללקוח בהצלחה! 🎉");
        } catch (error) {
          console.error("Error converting lead to client:", error);
          toast.error("שגיאה בהמרת ליד ללקוח");
        }
      }
      
      setIsEditDialogOpen(false);
      setSelectedLead(null);
      resetForm();
      toast.success("ליד עודכן בהצלחה");
    },
    onError: () => toast.error("שגיאה בעדכון ליד"),
  });

  const deleteMutation = trpc.leads.delete.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedLead(null);
      toast.success("ליד נמחק בהצלחה");
    },
    onError: () => toast.error("שגיאה במחיקת ליד"),
  });

  const resetForm = () => {
    setFormData({
      leadName: "",
      contactPerson: "",
      email: "",
      phone: "",
      source: "",
      status: "new",
      estimatedValue: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    if (!formData.leadName) {
      toast.error("נא למלא את שם הליד");
      return;
    }

    addMutation.mutate({
      leadName: formData.leadName,
      contactPerson: formData.contactPerson || null,
      email: formData.email || null,
      phone: formData.phone || null,
      source: formData.source || null,
      status: formData.status,
      estimatedValue: formData.estimatedValue ? parseInt(formData.estimatedValue) : null,
      notes: formData.notes || null,
    });
  };

  const handleUpdate = () => {
    if (!selectedLead) return;

    updateMutation.mutate({
      id: selectedLead.id,
      leadName: formData.leadName,
      contactPerson: formData.contactPerson || null,
      email: formData.email || null,
      phone: formData.phone || null,
      source: formData.source || null,
      status: formData.status,
      estimatedValue: formData.estimatedValue ? parseInt(formData.estimatedValue) : null,
      notes: formData.notes || null,
    });
  };

  const handleDelete = () => {
    if (selectedLead) {
      deleteMutation.mutate(selectedLead.id);
    }
  };

  const openEditDialog = (lead: any) => {
    setSelectedLead(lead);
    setFormData({
      leadName: lead.leadName || "",
      contactPerson: lead.contactPerson || "",
      email: lead.email || "",
      phone: lead.phone || "",
      source: lead.source || "",
      status: lead.status || "new",
      estimatedValue: lead.estimatedValue?.toString() || "",
      notes: lead.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (lead: any) => {
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const columns = [
    { id: "leadName", label: "שם ליד", icon: <User className="w-4 h-4" />, width: "20%" },
    { id: "contactPerson", label: "איש קשר", icon: <User className="w-4 h-4" />, width: "15%" },
    { id: "email", label: "אימייל", icon: <Mail className="w-4 h-4" />, width: "15%" },
    { id: "phone", label: "טלפון", icon: <Phone className="w-4 h-4" />, width: "12%" },
    { id: "source", label: "מקור", width: "10%" },
    { id: "status", label: "סטטוס", width: "12%" },
    { id: "estimatedValue", label: "ערך משוער", icon: <DollarSign className="w-4 h-4" />, width: "10%" },
    { id: "createdAt", label: "תאריך", icon: <Calendar className="w-4 h-4" />, width: "6%" },
  ];

  return (
    <>
      <MondayTable
        title="לידים"
        description="ניהול לידים חדשים"
        columns={columns}
        onAddItem={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}
        headerActions={
          <div className="flex items-center gap-2">
            <BoardInfoBubbleNew
              boardName="בורד לידים"
              description="מעקב אחר כל הלידים (הזדמנויות עסקיות) החדשים. ניהול תהליך המכירה משלב הידעות הראשוני ועד לסגירת העסקה."
              features={[
                "הוסף ליד חדש דרך 'פריט חדש'",
                "מלא פרטים: שם הליד, איש קשר, פרטי התקשרות",
                "בחר מקור: אתר, המלצה, פייסבוק, גוגל, לינקדאין",
                "עדכן סטטוס: חדש → יצרנו קשר → מתאים → הצעת מחיר → משא ומתן → נסגר",
                "הזן ערך משוער לעסקה",
                "כשהליד נסגר - שנה סטטוס ל-'נסגר' והאוטומציה תיצור לקוח ב-CRM"
              ]}
              quickActions={[
                {
                  id: "email",
                  label: "שליחת אימייל",
                  icon: <Mail className="w-5 h-5 text-white" />,
                  description: "שלח אימייל לליד",
                  action: () => toast.info("פתיחת אימייל...")
                },
                {
                  id: "task",
                  label: "יצירת משימה",
                  icon: <User className="w-5 h-5 text-white" />,
                  description: "צור משימה חדשה לליד",
                  action: () => toast.info("פתיחת טופס משימה...")
                },
                {
                  id: "convert",
                  label: "המרה ללקוח",
                  icon: <DollarSign className="w-5 h-5 text-white" />,
                  description: "המר ליד ללקוח ב-CRM",
                  action: () => toast.info("המרה ללקוח...")
                },
                {
                  id: "stats",
                  label: "סטטיסטיקות",
                  icon: <Calendar className="w-5 h-5 text-white" />,
                  description: "צפה בסטטיסטיקות לידים",
                  action: () => toast.info("טוען סטטיסטיקות...")
                }
              ]}
              automations={[
                "כאשר ליד מקבל סטטוס 'נסגר' — המערכת יוצרת אוטומטית לקוח חדש ב-CRM עם כל הפרטים",
                "כאשר ליד נשאר ללא עדכון 30 יום — המערכת שולחת תזכורת אוטומטית למנהל"
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
              אין לידים להצגה - לחץ על "פריט חדש" להוספה
            </td>
          </tr>
        ) : (
          sortedData.map((lead: any) => (
            <MondayTableRow key={lead.id}>
              <MondayTableCell>{lead.leadName}</MondayTableCell>
              <MondayTableCell>{lead.contactPerson || "-"}</MondayTableCell>
              <MondayTableCell>{lead.email || "-"}</MondayTableCell>
              <MondayTableCell>{lead.phone || "-"}</MondayTableCell>
              <MondayTableCell>{lead.source || "-"}</MondayTableCell>
              <MondayTableCell>
                <Badge className={statusColors[lead.status]}>
                  {statusLabels[lead.status]}
                </Badge>
              </MondayTableCell>
              <MondayTableCell>
                {lead.estimatedValue ? `₪${lead.estimatedValue.toLocaleString()}` : "-"}
              </MondayTableCell>
              <MondayTableCell>
                {new Date(lead.createdAt).toLocaleDateString("he-IL")}
              </MondayTableCell>
              <MondayTableCell className="w-24">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(lead)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(lead)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת ליד חדש</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="leadName">שם ליד *</Label>
              <Input
                id="leadName"
                value={formData.leadName}
                onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                placeholder="שם החברה או הליד"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">איש קשר</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="שם איש הקשר"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="050-1234567"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">מקור</Label>
                <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מקור" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
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
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">ערך משוער (₪)</Label>
              <Input
                id="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                placeholder="0"
              />
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
            <Button onClick={handleAdd} className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow">הוסף ליד</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת ליד</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-leadName">שם ליד *</Label>
              <Input
                id="edit-leadName"
                value={formData.leadName}
                onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                placeholder="שם החברה או הליד"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contactPerson">איש קשר</Label>
              <Input
                id="edit-contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="שם איש הקשר"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">אימייל</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">טלפון</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="050-1234567"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-source">מקור</Label>
                <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מקור" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
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
            <div className="space-y-2">
              <Label htmlFor="edit-estimatedValue">ערך משוער (₪)</Label>
              <Input
                id="edit-estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                placeholder="0"
              />
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
            <DialogTitle>מחיקת ליד</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            האם אתה בטוח שברצונך למחוק את הליד "{selectedLead?.leadName}"? פעולה זו אינה ניתנת לביטול.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-gradient-to-r from-red-600 to-red-700 hover:scale-105 transition-transform">
              מחק ליד
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sort Dialog */}
      <SortFilterDialog
        open={sortDialogOpen}
        onClose={() => setSortDialogOpen(false)}
        mode="sort"
        columns={columns.filter(c => c.id !== "actions")}
        currentSort={sortConfig || undefined}
        onApplySort={applySort}
        onClearSort={clearSort}
      />

      {/* Filter Dialog */}
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

