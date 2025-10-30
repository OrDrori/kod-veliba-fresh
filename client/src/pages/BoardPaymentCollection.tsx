import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import {
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  Mail,
  BarChart3,
  ExternalLink,
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

export default function BoardPaymentCollection() {
  const { data: payments, isLoading } = trpc.paymentCollection.list.useQuery();
  const utils = trpc.useUtils();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(payments, "paymentCollection");
  
  const [formData, setFormData] = useState({
    item: "",
    subitem: "",
    amount: "",
    targetDate: "",
    paymentDate: "",
    collectionStatus: "pending",
    paymentStatus: "not_paid",
    notes: "",
    link: "",
    email: "",
    phone: "",
  });

  const addMutation = trpc.paymentCollection.create.useMutation({
    onSuccess: () => {
      utils.paymentCollection.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("תשלום נוסף בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בהוספת תשלום: " + error.message);
    },
  });

  const updateMutation = trpc.paymentCollection.update.useMutation({
    onSuccess: () => {
      utils.paymentCollection.list.invalidate();
      setIsEditDialogOpen(false);
      setSelectedPayment(null);
      resetForm();
      toast.success("תשלום עודכן בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בעדכון תשלום: " + error.message);
    },
  });

  const deleteMutation = trpc.paymentCollection.delete.useMutation({
    onSuccess: () => {
      utils.paymentCollection.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
      toast.success("תשלום נמחק בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה במחיקת תשלום: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      item: "",
      subitem: "",
      amount: "",
      targetDate: "",
      paymentDate: "",
      collectionStatus: "pending",
      paymentStatus: "not_paid",
      notes: "",
      link: "",
      email: "",
      phone: "",
    });
  };

  const handleAdd = () => {
    addMutation.mutate(formData);
  };

  const handleEdit = (payment: any) => {
    setSelectedPayment(payment);
    setFormData({
      item: payment.item || "",
      subitem: payment.subitem || "",
      amount: payment.amount?.toString() || "",
      targetDate: payment.targetDate || "",
      paymentDate: payment.paymentDate || "",
      collectionStatus: payment.collectionStatus || "pending",
      paymentStatus: payment.paymentStatus || "not_paid",
      notes: payment.notes || "",
      link: payment.link || "",
      email: payment.email || "",
      phone: payment.phone || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (selectedPayment) {
      updateMutation.mutate({
        id: selectedPayment.id,
        ...formData,
        amount: formData.amount ? formData.amount : null,
      });
    }
  };

  const handleDelete = (payment: any) => {
    setSelectedPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPayment) {
      deleteMutation.mutate({ id: selectedPayment.id });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "ממתין", variant: "outline" },
      collected: { label: "נגבה", variant: "default" },
      overdue: { label: "באיחור", variant: "destructive" },
      partial: { label: "חלקי", variant: "secondary" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "ממתין לתשלום", variant: "outline" },
      paid: { label: "שולם", variant: "default" },
      overdue: { label: "באיחור", variant: "destructive" },
      partial: { label: "תשלום חלקי", variant: "secondary" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Calculate statistics
  const totalAmount = payments?.reduce((sum, p) => sum + (parseFloat(p.amount as string) || 0), 0) || 0;
  const collectedCount = payments?.filter(p => p.collectionStatus === "collected").length || 0;
  const pendingCount = payments?.filter(p => p.collectionStatus === "pending").length || 0;
  const overdueCount = payments?.filter(p => p.collectionStatus === "overdue").length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">טוען...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה"כ לגבייה</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">נגבה</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{collectedCount}</div>
            <p className="text-xs text-muted-foreground">פריטים שנגבו</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ממתינים</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">פריטים ממתינים</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">באיחור</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">גבייה ותשלומים</h1>
          <p className="text-muted-foreground">ניהול תשלומים וגבייה מלקוחות</p>
        </div>
        <div className="flex gap-2">
          <BoardInfoBubbleNew
            boardName="גבייה ותשלומים"
            description="מעקב אחר תשלומים, חובות וגבייה מלקוחות"
            features={[
              "מעקב אחר תשלומים ממתינים",
              "ניהול חובות ואיחורים",
              "דוחות גבייה מפורטים",
              "התראות אוטומטיות"
            ]}
            automations={[
              "התראה אוטומטית לתשלומים באיחור",
              "עדכון סטטוס אוטומטי",
              "דוחות חודשיים"
            ]}
            quickActions={[
              { id: "reminder", label: "שליחת תזכורת", icon: <Mail className="w-4 h-4" />, description: "שלח תזכורת לכל הלקוחות עם חובות", action: () => toast.info("שליחת תזכורת לכל הלקוחות עם חובות") },
              { id: "report", label: "דוח חובות", icon: <BarChart3 className="w-4 h-4" />, description: "יצירת דוח חובות מפורט", action: () => toast.info("יצירת דוח חובות מפורט") },
              { id: "export", label: "ייצוא לExcel", icon: <ExternalLink className="w-4 h-4" />, description: "ייצוא נתונים ל-Excel", action: () => toast.info("ייצוא נתונים ל-Excel") },
              { id: "settings", label: "הגדרות תזכורות", icon: <DollarSign className="w-4 h-4" />, description: "הגדרות תזכורות אוטומטיות", action: () => toast.info("הגדרות תזכורות אוטומטיות") }
            ]}
          />
          <Button onClick={() => setFilterDialogOpen(true)} variant="outline">
            סינון
          </Button>
          <Button onClick={() => setSortDialogOpen(true)} variant="outline">
            מיון
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            פריט חדש
          </Button>
        </div>
      </div>

      {/* Table */}
      <MondayTable
        title="גבייה ותשלומים"
        columns={[
          { id: "item", label: "פריט" },
          { id: "amount", label: "סכום לגבייה" },
          { id: "collectionStatus", label: "סטטוס גבייה" },
          { id: "paymentStatus", label: "סטטוס תשלום" },
          { id: "targetDate", label: "תאריך יעד" },
          { id: "actions", label: "פעולות" },
        ]}
        onAddItem={() => setIsAddDialogOpen(true)}
      >
        <tbody>
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((payment: any, index: number) => {
              return (
                <MondayTableRow key={payment.id}>
                  <MondayTableCell>{payment.item || "-"}</MondayTableCell>
                  <MondayTableCell>
                    <span className="font-semibold">₪{(parseFloat(payment.amount as string) || 0).toLocaleString()}</span>
                  </MondayTableCell>
                  <MondayTableCell>{getStatusBadge(payment.collectionStatus || "pending")}</MondayTableCell>
                  <MondayTableCell>{getPaymentStatusBadge(payment.paymentStatus || "not_paid")}</MondayTableCell>
                  <MondayTableCell>
                    {payment.targetDate ? new Date(payment.targetDate).toLocaleDateString("he-IL") : "-"}
                  </MondayTableCell>
                  <MondayTableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(payment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(payment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </MondayTableCell>
                </MondayTableRow>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-8 text-muted-foreground">
                אין תשלומים להצגה
              </td>
            </tr>
          )}
        </tbody>
      </MondayTable>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "עריכת תשלום" : "תשלום חדש"}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? "ערוך את פרטי התשלום" : "הוסף תשלום חדש למעקב"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item">פריט *</Label>
                <Input
                  id="item"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="subitem">תת-פריט</Label>
                <Input
                  id="subitem"
                  value={formData.subitem}
                  onChange={(e) => setFormData({ ...formData, subitem: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">סכום לגבייה *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="collectionStatus">סטטוס גבייה</Label>
                <Select value={formData.collectionStatus} onValueChange={(value) => setFormData({ ...formData, collectionStatus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">ממתין</SelectItem>
                    <SelectItem value="collected">נגבה</SelectItem>
                    <SelectItem value="overdue">באיחור</SelectItem>
                    <SelectItem value="partial">חלקי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentStatus">סטטוס תשלום</Label>
                <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">ממתין לתשלום</SelectItem>
                    <SelectItem value="paid">שולם</SelectItem>
                    <SelectItem value="overdue">באיחור</SelectItem>
                    <SelectItem value="partial">תשלום חלקי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetDate">תאריך יעד</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="paymentDate">תאריך תשלום</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="link">קישור</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              ביטול
            </Button>
            <Button onClick={isEditDialogOpen ? handleUpdate : handleAdd}>
              {isEditDialogOpen ? "עדכון" : "הוספה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת תשלום</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את התשלום? פעולה זו לא ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              מחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sort & Filter Dialogs */}
      <SortFilterDialog
        open={sortDialogOpen}
        onClose={() => setSortDialogOpen(false)}
        mode="sort"
        currentSort={sortConfig || undefined}
        onApplySort={applySort}
        onClearSort={clearSort}
        columns={[
          { id: "clientName", label: "לקוח" },
          { id: "amount", label: "סכום לגבייה" },
          { id: "amountCollected", label: "נגבה" },
          { id: "collectionStatus", label: "סטטוס גבייה" },
          { id: "paymentStatus", label: "סטטוס תשלום" },
          { id: "dueDate", label: "תאריך יעד" },
        ]}
      />
      <SortFilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        mode="filter"
        currentFilters={filters}
        onApplyFilter={applyFilters}
        onClearFilters={clearFilters}
        columns={[
          { id: "clientName", label: "לקוח" },
          { id: "collectionStatus", label: "סטטוס גבייה" },
          { id: "paymentStatus", label: "סטטוס תשלום" },
        ]}
      />
    </div>
  );
}

