import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Pencil,
  Trash2,
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

export default function BoardDeals() {
  const { data: deals, isLoading } = trpc.deals.list.useQuery();
  const utils = trpc.useUtils();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(deals, "deals");
  
  const [formData, setFormData] = useState({
    dealName: "",
    client: "",
    value: "",
    stage: "",
    status: "active",
    probability: "",
    expectedCloseDate: "",
    actualCloseDate: "",
    notes: "",
  });

  const addMutation = trpc.deals.create.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("עסקה נוספה בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בהוספת עסקה: " + error.message);
    },
  });

  const updateMutation = trpc.deals.update.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate();
      setIsEditDialogOpen(false);
      setSelectedDeal(null);
      resetForm();
      toast.success("עסקה עודכנה בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בעדכון עסקה: " + error.message);
    },
  });

  const deleteMutation = trpc.deals.delete.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedDeal(null);
      toast.success("עסקה נמחקה בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה במחיקת עסקה: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      dealName: "",
      client: "",
      value: "",
      stage: "",
      status: "active",
      probability: "",
      expectedCloseDate: "",
      actualCloseDate: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    addMutation.mutate(formData);
  };

  const handleEdit = (deal: any) => {
    setSelectedDeal(deal);
    setFormData({
      dealName: deal.dealName || "",
      client: deal.client || "",
      value: deal.value?.toString() || "",
      stage: deal.stage || "",
      status: deal.status || "active",
      probability: deal.probability?.toString() || "",
      expectedCloseDate: deal.expectedCloseDate || "",
      actualCloseDate: deal.actualCloseDate || "",
      notes: deal.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (selectedDeal) {
      updateMutation.mutate({
        id: selectedDeal.id,
        ...formData,
        value: formData.value ? formData.value : null,
        probability: formData.probability ? parseInt(formData.probability) : null,
      });
    }
  };

  const handleDelete = (deal: any) => {
    setSelectedDeal(deal);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDeal) {
      deleteMutation.mutate({ id: selectedDeal.id });
    }
  };

  const getStageBadge = (stage: string) => {
    const stageMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      lead: { label: "ליד", variant: "outline" },
      qualified: { label: "מוסמך", variant: "secondary" },
      proposal: { label: "הצעה", variant: "secondary" },
      negotiation: { label: "משא ומתן", variant: "secondary" },
      won: { label: "נסגר", variant: "default" },
      lost: { label: "אבד", variant: "destructive" },
    };
    const config = stageMap[stage] || { label: stage, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "פעיל", variant: "default" },
      won: { label: "נוצח", variant: "default" },
      lost: { label: "אבד", variant: "destructive" },
      pending: { label: "בהמתנה", variant: "secondary" },
      missing_details: { label: "פרטים חסרים", variant: "outline" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Calculate statistics
  const totalValue = deals?.reduce((sum, d) => sum + (parseFloat(d.value as string) || 0), 0) || 0;
  const wonDeals = deals?.filter(d => d.stage === "won").length || 0;
  const activeDeals = deals?.filter(d => d.status === "active").length || 0;
  const avgProbability = deals?.length ? 
    deals.reduce((sum, d) => sum + (d.probability || 0), 0) / deals.length : 0;

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
            <CardTitle className="text-sm font-medium">ערך כולל</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">עסקאות שנסגרו</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{wonDeals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">עסקאות פעילות</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeDeals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הסתברות ממוצעת</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgProbability.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">עסקאות</h1>
          <p className="text-muted-foreground">ניהול עסקאות ומכירות</p>
        </div>
        <div className="flex gap-2">
          <BoardInfoBubbleNew
            boardName="עסקאות"
            description="מעקב אחר עסקאות, הזדמנויות מכירה ומשא ומתן"
            features={[
              "מעקב אחר שלבי עסקה",
              "ניהול הסתברות סגירה",
              "דוחות מכירות",
              "תחזיות הכנסות"
            ]}
            automations={[
              "התראה על עסקאות שלא מתקדמות",
              "עדכון סטטוס אוטומטי",
              "תזכורות למעקב"
            ]}
            quickActions={[
              { id: "email", label: "שליחת הצעה", icon: <Mail className="w-4 h-4" />, description: "שלח הצעת מחיר ללקוח", action: () => toast.info("שליחת הצעת מחיר") },
              { id: "report", label: "דוח מכירות", icon: <BarChart3 className="w-4 h-4" />, description: "יצירת דוח מכירות", action: () => toast.info("יצירת דוח מכירות") },
              { id: "forecast", label: "תחזית הכנסות", icon: <TrendingUp className="w-4 h-4" />, description: "תחזית הכנסות צפויות", action: () => toast.info("תחזית הכנסות") },
              { id: "export", label: "ייצוא", icon: <ExternalLink className="w-4 h-4" />, description: "ייצוא נתונים", action: () => toast.info("ייצוא נתונים") }
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
            עסקה חדשה
          </Button>
        </div>
      </div>

      {/* Table */}
      <MondayTable
        title="עסקאות"
        columns={[
          { id: "dealName", label: "שם עסקה" },
          { id: "client", label: "לקוח" },
          { id: "value", label: "סכום" },
          { id: "stage", label: "שלב" },
          { id: "status", label: "סטטוס" },
          { id: "probability", label: "הסתברות" },
          { id: "actions", label: "פעולות" },
        ]}
        onAddItem={() => setIsAddDialogOpen(true)}
      >
        <tbody>
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((deal: any, index: number) => {
              return (
                <MondayTableRow key={deal.id}>
                  <MondayTableCell>{deal.dealName || "-"}</MondayTableCell>
                  <MondayTableCell>{deal.client || "-"}</MondayTableCell>
                  <MondayTableCell>
                    <span className="font-semibold">₪{(parseFloat(deal.value as string) || 0).toLocaleString()}</span>
                  </MondayTableCell>
                  <MondayTableCell>{getStageBadge(deal.stage || "")}</MondayTableCell>
                  <MondayTableCell>{getStatusBadge(deal.status || "active")}</MondayTableCell>
                  <MondayTableCell>
                    <span className="text-sm">{deal.probability || 0}%</span>
                  </MondayTableCell>
                  <MondayTableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(deal)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(deal)}
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
              <td colSpan={7} className="text-center py-8 text-muted-foreground">
                אין עסקאות להצגה
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
            <DialogTitle>{isEditDialogOpen ? "עריכת עסקה" : "עסקה חדשה"}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? "ערוך את פרטי העסקה" : "הוסף עסקה חדשה למעקב"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dealName">שם עסקה *</Label>
                <Input
                  id="dealName"
                  value={formData.dealName}
                  onChange={(e) => setFormData({ ...formData, dealName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="client">שם לקוח</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">סכום *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="probability">הסתברות (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stage">שלב</Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">ליד</SelectItem>
                    <SelectItem value="qualified">מוסמך</SelectItem>
                    <SelectItem value="proposal">הצעה</SelectItem>
                    <SelectItem value="negotiation">משא ומתן</SelectItem>
                    <SelectItem value="won">נסגר</SelectItem>
                    <SelectItem value="lost">אבד</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">סטטוס</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">פעיל</SelectItem>
                    <SelectItem value="won">נוצח</SelectItem>
                    <SelectItem value="lost">אבד</SelectItem>
                    <SelectItem value="pending">בהמתנה</SelectItem>
                    <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expectedCloseDate">תאריך סגירה צפוי</Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="actualCloseDate">תאריך סגירה בפועל</Label>
                <Input
                  id="actualCloseDate"
                  type="date"
                  value={formData.actualCloseDate}
                  onChange={(e) => setFormData({ ...formData, actualCloseDate: e.target.value })}
                />
              </div>
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
            <DialogTitle>מחיקת עסקה</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את העסקה? פעולה זו לא ניתנת לביטול.
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
          { id: "dealName", label: "שם עסקה" },
          { id: "client", label: "לקוח" },
          { id: "value", label: "סכום" },
          { id: "stage", label: "שלב" },
          { id: "probability", label: "הסתברות" },
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
          { id: "dealName", label: "שם עסקה" },
          { id: "clientName", label: "לקוח" },
          { id: "stage", label: "שלב" },
          { id: "status", label: "סטטוס" },
        ]}
      />
    </div>
  );
}

