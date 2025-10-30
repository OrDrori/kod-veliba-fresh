import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import {
  User,
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BoardInfoBubbleNew } from "@/components/BoardInfoBubbleNew";
import SortFilterDialog from "@/components/SortFilterDialog";
import { useSortFilter } from "@/hooks/useSortFilter";

const rowColors = [
  "bg-white",
  "bg-gray-50",
];

export default function BoardBilling() {
  const { data: charges, isLoading } = trpc.billing.list.useQuery();
  const { data: clients } = trpc.crm.list.useQuery();
  const { data: tasks } = trpc.clientTasks.list.useQuery();
  const utils = trpc.useUtils();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<any>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(charges, "billing");
  
  const [formData, setFormData] = useState({
    clientId: "",
    taskId: "",
    chargeType: "hourly",
    description: "",
    amount: "",
    hours: "",
    status: "pending",
    invoiceNumber: "",
    invoiceDate: "",
    paidDate: "",
  });

  const addMutation = trpc.billing.create.useMutation({
    onSuccess: () => {
      utils.billing.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("חיוב נוסף בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בהוספת חיוב: " + error.message);
    },
  });

  const updateMutation = trpc.billing.update.useMutation({
    onSuccess: () => {
      utils.billing.list.invalidate();
      setIsEditDialogOpen(false);
      setSelectedCharge(null);
      resetForm();
      toast.success("חיוב עודכן בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בעדכון חיוב: " + error.message);
    },
  });

  const deleteMutation = trpc.billing.delete.useMutation({
    onSuccess: () => {
      utils.billing.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedCharge(null);
      toast.success("חיוב נמחק בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה במחיקת חיוב: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      clientId: "",
      taskId: "",
      chargeType: "hourly",
      description: "",
      amount: "",
      hours: "",
      status: "pending",
      invoiceNumber: "",
      invoiceDate: "",
      paidDate: "",
    });
  };

  const openEditDialog = (charge: any) => {
    setSelectedCharge(charge);
    setFormData({
      clientId: charge.clientId?.toString() || "",
      taskId: charge.taskId?.toString() || "",
      chargeType: charge.chargeType || "hourly",
      description: charge.description || "",
      amount: charge.amount?.toString() || "",
      hours: charge.hours?.toString() || "",
      status: charge.status || "pending",
      invoiceNumber: charge.invoiceNumber || "",
      invoiceDate: charge.invoiceDate || "",
      paidDate: charge.paidDate || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (charge: any) => {
    setSelectedCharge(charge);
    setIsDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    if (!formData.clientId || !formData.amount) {
      toast.error("נא למלא את כל השדות החובה");
      return;
    }

    addMutation.mutate({
      clientId: parseInt(formData.clientId),
      taskId: formData.taskId && formData.taskId !== "0" ? parseInt(formData.taskId) : null,
      chargeType: formData.chargeType,
      description: formData.description,
      amount: parseFloat(formData.amount),
      hours: formData.hours ? parseFloat(formData.hours) : null,
      status: formData.status,
      invoiceNumber: formData.invoiceNumber || null,
      invoiceDate: formData.invoiceDate || null,
      paidDate: formData.paidDate || null,
    });
  };

  const handleUpdate = () => {
    if (!selectedCharge) return;

    updateMutation.mutate({
      id: selectedCharge.id,
      clientId: parseInt(formData.clientId),
      taskId: formData.taskId && formData.taskId !== "0" ? parseInt(formData.taskId) : null,
      chargeType: formData.chargeType,
      description: formData.description,
      amount: parseFloat(formData.amount),
      hours: formData.hours ? parseFloat(formData.hours) : null,
      status: formData.status,
      invoiceNumber: formData.invoiceNumber || null,
      invoiceDate: formData.invoiceDate || null,
      paidDate: formData.paidDate || null,
    });
  };

  const handleDelete = () => {
    if (!selectedCharge) return;
    deleteMutation.mutate({ id: selectedCharge.id });
  };

  const getClientName = (clientId: number) => {
    const client = clients?.find((c: any) => c.id === clientId);
    return client?.clientName || `לקוח #${clientId}`;
  };

  const getTaskName = (taskId: number | null) => {
    if (!taskId) return "-";
    const task = tasks?.find((t: any) => t.id === taskId);
    return task?.taskName || `משימה #${taskId}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "ממתין", className: "bg-yellow-100 text-yellow-800" },
      invoiced: { label: "חשבונית נשלחה", className: "bg-blue-100 text-blue-800" },
      paid: { label: "שולם", className: "bg-green-100 text-green-800" },
      cancelled: { label: "בוטל", className: "bg-gray-100 text-gray-800" },
      overdue: { label: "באיחור", className: "bg-red-100 text-red-800" },
      missing_details: { label: "פרטים חסרים", className: "bg-orange-100 text-orange-800" },
    };
    const s = statusMap[status as keyof typeof statusMap] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  const getChargeTypeBadge = (chargeType: string) => {
    const typeMap = {
      retainer: { label: "ריטיינר", className: "bg-purple-100 text-purple-800" },
      hourly: { label: "שעתי", className: "bg-blue-100 text-blue-800" },
      bank: { label: "בנק שעות", className: "bg-cyan-100 text-cyan-800" },
      project: { label: "פרויקט", className: "bg-orange-100 text-orange-800" },
    };
    const type = typeMap[chargeType as keyof typeof typeMap] || { label: chargeType, className: "bg-gray-100 text-gray-800" };
    return <Badge className={type.className}>{type.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalAmount = charges?.reduce((sum: number, charge: any) => sum + charge.amount, 0) || 0;
  const paidAmount = charges?.filter((c: any) => c.status === "paid").reduce((sum: number, charge: any) => sum + charge.amount, 0) || 0;
  const pendingAmount = charges?.filter((c: any) => c.status === "pending" || c.status === "invoiced").reduce((sum: number, charge: any) => sum + charge.amount, 0) || 0;

  const columns = [
    { id: "client", label: "לקוח", icon: <User className="w-4 h-4" />, width: "12%" },
    { id: "task", label: "משימה", icon: <DollarSign className="w-4 h-4" />, width: "12%" },
    { id: "type", label: "סוג חיוב", icon: <DollarSign className="w-4 h-4" />, width: "10%" },
    { id: "description", label: "תיאור", icon: <DollarSign className="w-4 h-4" />, width: "15%" },
    { id: "amount", label: "סכום", icon: <DollarSign className="w-4 h-4" />, width: "10%" },
    { id: "hours", label: "שעות", icon: <DollarSign className="w-4 h-4" />, width: "8%" },
    { id: "status", label: "סטטוס", icon: <DollarSign className="w-4 h-4" />, width: "10%" },
    { id: "invoice", label: "מס' חשבונית", icon: <DollarSign className="w-4 h-4" />, width: "10%" },
    { id: "dates", label: "תאריכים", icon: <Calendar className="w-4 h-4" />, width: "10%" },
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
    <div className="flex flex-col h-full bg-gray-50" dir="rtl">
      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>סה"כ חיובים</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalAmount)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>שולם</CardDescription>
              <CardTitle className="text-2xl text-green-600">{formatCurrency(paidAmount)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>ממתין לתשלום</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{formatCurrency(pendingAmount)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>מספר חיובים</CardDescription>
              <CardTitle className="text-2xl">{charges?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Table */}
      <MondayTable
        title="גבייה וחיובים"
        description="ניהול חיובים, חשבוניות ותשלומים"
        columns={columns}
        onAddItem={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}
        headerActions={
          <div className="flex gap-2">
            <BoardInfoBubbleNew
              boardName="בורד גבייה וחיובים"
              description="מעקב מרכזי אחר כל החיובים, החשבוניות והתשלומים של העסק. כולל סטטיסטיקות מרכזיות על הכנסות והחובות."
              features={[
                "הוסף חיוב חדש דרך 'פריט חדש' או המתן לאוטומציה ליצור אותו",
                "בחר לקוח ומשימה (אופציונלי)",
                "הגדר סוג חיוב: שעתי, בנק שעות, ריטיינר, או פרויקט",
                "הזן סכום, שעות, ותיאור",
                "עדכן סטטוס: ממתין → חשבונית נשלחה → שולם",
                "הוסף מספר חשבונית ותאריכים",
                "עקוב אחר הסטטיסטיקות בכרטיסים בראש הדף"
              ]}
              quickActions={[
                {
                  id: "add",
                  label: "חיוב חדש",
                  icon: <Plus className="w-5 h-5 text-white" />,
                  description: "צור חיוב חדש",
                  action: () => toast.info("פתיחת טופס חיוב...")
                },
                {
                  id: "invoice",
                  label: "חשבונית",
                  icon: <DollarSign className="w-5 h-5 text-white" />,
                  description: "צור חשבונית",
                  action: () => toast.info("פתיחת חשבונית...")
                },
                {
                  id: "report",
                  label: "דוח כספי",
                  icon: <BarChart3 className="w-5 h-5 text-white" />,
                  description: "צפה בדוח כספי",
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
                "כאשר משימה מסומנת כ-'הושלם' + לחיוב — המערכת יוצרת אוטומטית חיוב חדש בבורד גבייה",
                "כאשר חיוב עובר 30 יום ללא תשלום — המערכת שולחת תזכורת למנהל"
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
          sortedData.map((charge: any, index: number) => (
            <MondayTableRow key={charge.id} color={rowColors[index % rowColors.length]}>
              <MondayTableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                    {getClientName(charge.clientId).charAt(0)}
                  </div>
                  <span className="font-semibold">{getClientName(charge.clientId)}</span>
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <span className="text-sm">{getTaskName(charge.taskId)}</span>
              </MondayTableCell>
              <MondayTableCell>{getChargeTypeBadge(charge.chargeType)}</MondayTableCell>
              <MondayTableCell>
                <div className="text-sm max-w-xs truncate">{charge.description}</div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="font-bold text-green-700">{formatCurrency(charge.amount)}</div>
              </MondayTableCell>
              <MondayTableCell>
                <span className="text-sm">{charge.hours || "-"}</span>
              </MondayTableCell>
              <MondayTableCell>{getStatusBadge(charge.status)}</MondayTableCell>
              <MondayTableCell>
                <span className="text-sm">{charge.invoiceNumber || "-"}</span>
              </MondayTableCell>
              <MondayTableCell>
                <div className="text-xs text-gray-600">
                  {charge.invoiceDate && (
                    <div>חשבונית: {new Date(charge.invoiceDate).toLocaleDateString("he-IL")}</div>
                  )}
                  {charge.paidDate && (
                    <div>תשלום: {new Date(charge.paidDate).toLocaleDateString("he-IL")}</div>
                  )}
                  {!charge.invoiceDate && !charge.paidDate && "-"}
                </div>
              </MondayTableCell>
              <MondayTableCell>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-100"
                    onClick={() => openEditDialog(charge)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100"
                    onClick={() => openDeleteDialog(charge)}
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
              אין חיובים להצגה
            </td>
          </tr>
        )}
      </MondayTable>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת חיוב חדש</DialogTitle>
            <DialogDescription>מלא את הפרטים להוספת חיוב חדש</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">לקוח *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
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
            <div className="space-y-2">
              <Label htmlFor="taskId">משימה (אופציונלי)</Label>
              <Select
                value={formData.taskId}
                onValueChange={(value) => setFormData({ ...formData, taskId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר משימה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">ללא משימה</SelectItem>
                  {tasks?.map((task: any) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.taskName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chargeType">סוג חיוב</Label>
              <Select
                value={formData.chargeType}
                onValueChange={(value) => setFormData({ ...formData, chargeType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">שעתי</SelectItem>
                  <SelectItem value="bank">בנק שעות</SelectItem>
                  <SelectItem value="retainer">ריטיינר</SelectItem>
                  <SelectItem value="project">פרויקט</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="invoiced">חשבונית נשלחה</SelectItem>
                  <SelectItem value="paid">שולם</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                  <SelectItem value="overdue">באיחור</SelectItem>
                  <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="תיאור החיוב"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">סכום *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">שעות</Label>
              <Input
                id="hours"
                type="number"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">מספר חשבונית</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="INV-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">תאריך חשבונית</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="paidDate">תאריך תשלום</Label>
              <Input
                id="paidDate"
                type="date"
                value={formData.paidDate}
                onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleAdd} disabled={addMutation.isPending} className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow">
              {addMutation.isPending ? "מוסיף..." : "הוסף חיוב"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת חיוב</DialogTitle>
            <DialogDescription>ערוך את פרטי החיוב</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-clientId">לקוח *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
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
            <div className="space-y-2">
              <Label htmlFor="edit-taskId">משימה (אופציונלי)</Label>
              <Select
                value={formData.taskId}
                onValueChange={(value) => setFormData({ ...formData, taskId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר משימה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">ללא משימה</SelectItem>
                  {tasks?.map((task: any) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.taskName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-chargeType">סוג חיוב</Label>
              <Select
                value={formData.chargeType}
                onValueChange={(value) => setFormData({ ...formData, chargeType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">שעתי</SelectItem>
                  <SelectItem value="bank">בנק שעות</SelectItem>
                  <SelectItem value="retainer">ריטיינר</SelectItem>
                  <SelectItem value="project">פרויקט</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">סטטוס</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="invoiced">חשבונית נשלחה</SelectItem>
                  <SelectItem value="paid">שולם</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                  <SelectItem value="overdue">באיחור</SelectItem>
                  <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-description">תיאור</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="תיאור החיוב"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">סכום *</Label>
              <Input
                id="edit-amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hours">שעות</Label>
              <Input
                id="edit-hours"
                type="number"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-invoiceNumber">מספר חשבונית</Label>
              <Input
                id="edit-invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="INV-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-invoiceDate">תאריך חשבונית</Label>
              <Input
                id="edit-invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-paidDate">תאריך תשלום</Label>
              <Input
                id="edit-paidDate"
                type="date"
                value={formData.paidDate}
                onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "שומר..." : "שמור שינויים"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת חיוב</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את החיוב הזה? פעולה זו אינה ניתנת לביטול.
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
              {deleteMutation.isPending ? "מוחק..." : "מחק חיוב"}
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
    </div>
  );
}

