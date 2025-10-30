import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  BarChart3,
  Clock,
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
import { toast } from "sonner";
import { BoardInfoBubbleNew } from "@/components/BoardInfoBubbleNew";
import SortFilterDialog from "@/components/SortFilterDialog";
import { useSortFilter } from "@/hooks/useSortFilter";

const rowColors = [
  "bg-white",
  "bg-gray-50",
];

export default function BoardCRM() {
  const { data: clients, isLoading } = trpc.crm.list.useQuery();
  const utils = trpc.useUtils();
  
  // Sort & Filter
  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(clients, "crm");
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    clientName: "",
    contactPerson: "",
    email: "",
    phone: "",
    businessType: "retainer",
    status: "active",
    monthlyRate: "",
    hourlyRate: "",
  });

  const addMutation = trpc.crm.create.useMutation({
    onSuccess: () => {
      utils.crm.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("לקוח נוסף בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בהוספת לקוח: " + error.message);
    },
  });

  const updateMutation = trpc.crm.update.useMutation({
    onSuccess: () => {
      utils.crm.list.invalidate();
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      resetForm();
      toast.success("לקוח עודכן בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בעדכון לקוח: " + error.message);
    },
  });

  const deleteMutation = trpc.crm.delete.useMutation({
    onSuccess: () => {
      utils.crm.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
      toast.success("לקוח נמחק בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה במחיקת לקוח: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      clientName: "",
      contactPerson: "",
      email: "",
      phone: "",
      businessType: "retainer",
      status: "active",
      monthlyRate: "",
      hourlyRate: "",
    });
  };

  const handleAdd = () => {
    addMutation.mutate({
      clientName: formData.clientName,
      contactPerson: formData.contactPerson || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      businessType: formData.businessType as any,
      status: formData.status as any,
      monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : undefined,
      hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
    });
  };

  const handleEdit = () => {
    if (!selectedClient) return;
    updateMutation.mutate({
      id: selectedClient.id,
      clientName: formData.clientName,
      contactPerson: formData.contactPerson || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      businessType: formData.businessType as any,
      status: formData.status as any,
      monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : undefined,
      hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedClient) return;
    deleteMutation.mutate({ id: selectedClient.id });
  };

  const openEditDialog = (client: any) => {
    setSelectedClient(client);
    setFormData({
      clientName: client.clientName,
      contactPerson: client.contactPerson || "",
      email: client.email || "",
      phone: client.phone || "",
      businessType: client.businessType,
      status: client.status,
      monthlyRate: client.monthlyRate?.toString() || "",
      hourlyRate: client.hourlyRate?.toString() || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (client: any) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "פעיל", className: "bg-green-500 text-white" },
      lead: { label: "ליד", className: "bg-blue-500 text-white" },
      inactive: { label: "לא פעיל", className: "bg-gray-500 text-white" },
      potential: { label: "פוטנציאלי", className: "bg-yellow-500 text-white" },
      missing_details: { label: "פרטים חסרים", className: "bg-orange-500 text-white" },
    };
    const status_info = statusMap[status as keyof typeof statusMap] || {
      label: status,
      className: "bg-gray-500 text-white",
    };
    return <Badge className={status_info.className}>{status_info.label}</Badge>;
  };

  const getBusinessTypeBadge = (businessType: string) => {
    const typeMap = {
      retainer: { label: "ריטיינר", className: "bg-purple-100 text-purple-800" },
      hourly: { label: "שעתי", className: "bg-blue-100 text-blue-800" },
      bank: { label: "בנק שעות", className: "bg-cyan-100 text-cyan-800" },
      project: { label: "פרויקט", className: "bg-orange-100 text-orange-800" },
    };
    const type = typeMap[businessType as keyof typeof typeMap] || {
      label: businessType,
      className: "bg-gray-100 text-gray-800",
    };
    return <Badge className={type.className}>{type.label}</Badge>;
  };

  const columns = [
    { id: "name", label: "שם לקוח", icon: <User className="w-4 h-4" />, width: "15%" },
    { id: "contact", label: "איש קשר", icon: <User className="w-4 h-4" />, width: "12%" },
    { id: "email", label: "אימייל", icon: <Mail className="w-4 h-4" />, width: "12%" },
    { id: "phone", label: "טלפון", icon: <Phone className="w-4 h-4" />, width: "10%" },
    { id: "businessType", label: "סוג עסקי", icon: <Briefcase className="w-4 h-4" />, width: "10%" },
    { id: "status", label: "סטטוס", icon: <DollarSign className="w-4 h-4" />, width: "8%" },
    { id: "monthlyRate", label: "תעריף חודשי", icon: <DollarSign className="w-4 h-4" />, width: "8%" },
    { id: "hourlyRate", label: "תעריף שעתי", icon: <DollarSign className="w-4 h-4" />, width: "8%" },
    { id: "bankHours", label: "בנק שעות", icon: <Clock className="w-4 h-4" />, width: "7%" },
    { id: "usedHours", label: "שעות מנוצלות", icon: <Clock className="w-4 h-4" />, width: "7%" },
    { id: "currency", label: "מטבע", icon: <DollarSign className="w-4 h-4" />, width: "5%" },
    { id: "actions", label: "", width: "4%" },
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
        title="CRM - ניהול לקוחות"
        description="ניהול לקוחות ועסקאות"
        columns={columns}
        onAddItem={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}
        headerActions={
          <div className="flex gap-2">
            <BoardInfoBubbleNew
              boardName="CRM"
              description="ניהול מרכזי של כל הלקוחות הפעילים והפוטנציאליים של העסק. כולל מעקב אחר פרטי קשר, סוגי עסקאות, תעריפים, וסטטוס הלקוח."
              features={[
                "הוסף לקוח חדש דרך כפתור 'פריט חדש'",
                "מלא פרטים: שם הלקוח, איש קשר, פרטי התקשרות",
                "בחר סוג עסקי: ריטיינר, בנק שעות, שעתי, פרויקט או חד-פעמי",
                "עדכן סטטוס: פעיל — יצירת קשר — מתאים — הצעת מחיר — משא ומתן — נסגר",
                "שי היר רמושור לעסקה — אוטומציה תיצור ליקון ב-CRM",
                "כשעדכנתם סטטוס ליד ל-נסגר — הצעת מחיר תישלח אוטומטית ותוסיף ליקון ב-CRM"
              ]}
              quickActions={[
                {
                  id: "email",
                  label: "שליחת אימייל",
                  icon: <Mail className="w-5 h-5 text-white" />,
                  description: "שלח אימייל ללקוח",
                  action: () => toast.info("פתיחת אימייל...")
                },
                {
                  id: "task",
                  label: "יצירת משימה",
                  icon: <Plus className="w-5 h-5 text-white" />,
                  description: "צור משימה חדשה ללקוח",
                  action: () => toast.info("פתיחת טופס משימה...")
                },
                {
                  id: "billing",
                  label: "הוספת חיוב",
                  icon: <DollarSign className="w-5 h-5 text-white" />,
                  description: "צור חשבונית חדשה",
                  action: () => toast.info("פתיחת טופס חיוב...")
                },
                {
                  id: "stats",
                  label: "סטטיסטיקות",
                  icon: <BarChart3 className="w-5 h-5 text-white" />,
                  description: "צפה בסטטיסטיקות לקוח",
                  action: () => toast.info("טוען סטטיסטיקות...")
                }
              ]}
              automations={[
                "כאשר ליד בבורד 'לידים' מקבל סטטוס 'נסגר' — המערכת יוצרת אוטומטית לקוח חדש ב-CRM",
                "כאשר מעדכנים סטטוס לקוח ל-'לא פעיל' — המערכת שולחת אימייל אוטומטי למנהל"
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
          sortedData.map((client: any, index: number) => (
            <MondayTableRow 
              key={client.id} 
              color={rowColors[index % rowColors.length]}
              onClick={() => {
                setSelectedClient(client);
                setIsEditDialogOpen(true);
              }}
            >
              <MondayTableCell>
                <div className="font-semibold text-gray-900">{client.clientName}</div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                    {client.contactPerson?.charAt(0) || "?"}
                  </div>
                  <span>{client.contactPerson || "-"}</span>
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="flex items-center gap-2 text-blue-600">
                  <Mail className="w-4 h-4" />
                  <span className="hover:underline cursor-pointer">{client.email || "-"}</span>
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone || "-"}</span>
                </div>
              </MondayTableCell>
              <MondayTableCell>{getBusinessTypeBadge(client.businessType)}</MondayTableCell>
              <MondayTableCell>{getStatusBadge(client.status)}</MondayTableCell>
              <MondayTableCell>
                <div className="font-semibold text-green-600">
                  {client.monthlyRetainer ? `₪${client.monthlyRetainer.toLocaleString()}` : "-"}
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="font-semibold text-blue-600">
                  {client.hourlyRate ? `₪${client.hourlyRate}/שעה` : "-"}
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="font-semibold text-purple-600">
                  {client.bankHours ? `${client.bankHours} שעות` : "-"}
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="font-semibold text-orange-600">
                  {client.usedHours ? `${client.usedHours} שעות` : "-"}
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="text-sm text-gray-600">
                  {client.currency || "ILS"}
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-100"
                    onClick={() => openEditDialog(client)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100"
                    onClick={() => openDeleteDialog(client)}
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
              אין לקוחות להצגה
            </td>
          </tr>
        )}
      </MondayTable>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl animate-scaleIn" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת לקוח חדש</DialogTitle>
            <DialogDescription>מלא את הפרטים להוספת לקוח חדש למערכת</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">שם לקוח *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="שם החברה/לקוח"
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
            <div className="space-y-2">
              <Label htmlFor="businessType">סוג עסקי</Label>
              <Select value={formData.businessType} onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retainer">ריטיינר</SelectItem>
                  <SelectItem value="hourly">שעתי</SelectItem>
                  <SelectItem value="bank">בנק שעות</SelectItem>
                  <SelectItem value="project">פרויקט</SelectItem>
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
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="lead">ליד</SelectItem>
                  <SelectItem value="inactive">לא פעיל</SelectItem>
                  <SelectItem value="potential">פוטנציאלי</SelectItem>
                  <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyRate">תעריף חודשי (₪)</Label>
              <Input
                id="monthlyRate"
                type="number"
                value={formData.monthlyRate}
                onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
                placeholder="5000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">תעריף שעתי (₪)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="350"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={!formData.clientName || addMutation.isPending}
              className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow"
            >
              {addMutation.isPending ? "מוסיף..." : "הוסף לקוח"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl animate-scaleIn" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת לקוח</DialogTitle>
            <DialogDescription>ערוך את פרטי הלקוח</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-clientName">שם לקוח *</Label>
              <Input
                id="edit-clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contactPerson">איש קשר</Label>
              <Input
                id="edit-contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">אימייל</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">טלפון</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-businessType">סוג עסקי</Label>
              <Select value={formData.businessType} onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retainer">ריטיינר</SelectItem>
                  <SelectItem value="hourly">שעתי</SelectItem>
                  <SelectItem value="bank">בנק שעות</SelectItem>
                  <SelectItem value="project">פרויקט</SelectItem>
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
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="lead">ליד</SelectItem>
                  <SelectItem value="inactive">לא פעיל</SelectItem>
                  <SelectItem value="potential">פוטנציאלי</SelectItem>
                  <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-monthlyRate">תעריף חודשי (₪)</Label>
              <Input
                id="edit-monthlyRate"
                type="number"
                value={formData.monthlyRate}
                onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hourlyRate">תעריף שעתי (₪)</Label>
              <Input
                id="edit-hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ביטול
            </Button>            <Button 
              onClick={handleEdit} 
              disabled={!formData.clientName || updateMutation.isPending}
              className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow"
            >
              {updateMutation.isPending ? "שומר..." : "שמור שינויים"}
            </Button>          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת לקוח</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את הלקוח "{selectedClient?.clientName}"?
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
              className="bg-gradient-to-r from-red-600 to-red-700 hover:scale-105 transition-transform"
            >
              {deleteMutation.isPending ? "מוחק..." : "מחק לקוח"}
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

