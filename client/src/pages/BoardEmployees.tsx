import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
  Plus,
  BarChart3,
  Users,
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

export default function BoardEmployees() {
  const { data: employees, isLoading } = trpc.employees.list.useQuery();
  const utils = trpc.useUtils();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(employees, "employees");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
    role: "",
    department: "development",
    employmentType: "full_time",
    status: "active",
    startDate: "",
    monthlySalary: "",
    hourlyRate: "",
    vacationDays: "22",
    notes: "",
  });

  const addMutation = trpc.employees.create.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("עובד נוסף בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בהוספת עובד: " + error.message);
    },
  });

  const updateMutation = trpc.employees.update.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      resetForm();
      toast.success("עובד עודכן בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה בעדכון עובד: " + error.message);
    },
  });

  const deleteMutation = trpc.employees.delete.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
      toast.success("עובד נמחק בהצלחה!");
    },
    onError: (error) => {
      toast.error("שגיאה במחיקת עובד: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      idNumber: "",
      role: "",
      department: "development",
      employmentType: "full_time",
      status: "active",
      startDate: "",
      monthlySalary: "",
      hourlyRate: "",
      vacationDays: "22",
      notes: "",
    });
  };

  const handleAdd = () => {
    addMutation.mutate({
      fullName: formData.fullName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      idNumber: formData.idNumber || undefined,
      role: formData.role || undefined,
      department: formData.department as any,
      employmentType: formData.employmentType as any,
      status: formData.status as any,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      monthlySalary: formData.monthlySalary ? parseInt(formData.monthlySalary) : undefined,
      hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : undefined,
      vacationDays: formData.vacationDays ? parseInt(formData.vacationDays) : 22,
      notes: formData.notes || undefined,
    });
  };

  const handleEdit = () => {
    if (!selectedEmployee) return;
    updateMutation.mutate({
      id: selectedEmployee.id,
      fullName: formData.fullName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      idNumber: formData.idNumber || undefined,
      role: formData.role || undefined,
      department: formData.department as any,
      employmentType: formData.employmentType as any,
      status: formData.status as any,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      monthlySalary: formData.monthlySalary ? parseInt(formData.monthlySalary) : undefined,
      hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : undefined,
      vacationDays: formData.vacationDays ? parseInt(formData.vacationDays) : 22,
      notes: formData.notes || undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedEmployee) return;
    deleteMutation.mutate({ id: selectedEmployee.id });
  };

  const openEditDialog = (employee: any) => {
    setSelectedEmployee(employee);
    setFormData({
      fullName: employee.fullName,
      email: employee.email || "",
      phone: employee.phone || "",
      idNumber: employee.idNumber || "",
      role: employee.role || "",
      department: employee.department || "development",
      employmentType: employee.employmentType || "full_time",
      status: employee.status || "active",
      startDate: employee.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : "",
      monthlySalary: employee.monthlySalary?.toString() || "",
      hourlyRate: employee.hourlyRate?.toString() || "",
      vacationDays: employee.vacationDays?.toString() || "22",
      notes: employee.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: any) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "פעיל", className: "bg-green-500 text-white" },
      inactive: { label: "לא פעיל", className: "bg-gray-500 text-white" },
      on_leave: { label: "בחופשה", className: "bg-blue-500 text-white" },
      missing_details: { label: "פרטים חסרים", className: "bg-orange-500 text-white" },
    };
    const status_info = statusMap[status as keyof typeof statusMap] || {
      label: status,
      className: "bg-gray-500 text-white",
    };
    return <Badge className={status_info.className}>{status_info.label}</Badge>;
  };

  const getDepartmentBadge = (department: string) => {
    const departmentMap = {
      development: { label: "פיתוח", className: "bg-blue-100 text-blue-800" },
      design: { label: "עיצוב", className: "bg-purple-100 text-purple-800" },
      management: { label: "ניהול", className: "bg-green-100 text-green-800" },
      sales: { label: "מכירות", className: "bg-yellow-100 text-yellow-800" },
      support: { label: "תמיכה", className: "bg-cyan-100 text-cyan-800" },
      other: { label: "אחר", className: "bg-gray-100 text-gray-800" },
    };
    const dept = departmentMap[department as keyof typeof departmentMap] || {
      label: department,
      className: "bg-gray-100 text-gray-800",
    };
    return <Badge className={dept.className}>{dept.label}</Badge>;
  };

  const getEmploymentTypeBadge = (type: string) => {
    const typeMap = {
      full_time: { label: "משרה מלאה", className: "bg-green-100 text-green-800" },
      part_time: { label: "משרה חלקית", className: "bg-blue-100 text-blue-800" },
      contractor: { label: "קבלן", className: "bg-purple-100 text-purple-800" },
      freelancer: { label: "פרילנסר", className: "bg-orange-100 text-orange-800" },
    };
    const empType = typeMap[type as keyof typeof typeMap] || {
      label: type,
      className: "bg-gray-100 text-gray-800",
    };
    return <Badge className={empType.className}>{empType.label}</Badge>;
  };

  const columns = [
    { id: "name", label: "שם מלא", width: "15%" },
    { id: "role", label: "תפקיד", width: "12%" },
    { id: "department", label: "מחלקה", width: "10%" },
    { id: "employmentType", label: "סוג העסקה", width: "12%" },
    { id: "status", label: "סטטוס", width: "10%" },
    { id: "contact", label: "פרטי קשר", width: "15%" },
    { id: "salary", label: "משכורת", width: "10%" },
    { id: "vacation", label: "ימי חופשה", width: "8%" },
    { id: "actions", label: "פעולות", width: "8%" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">טוען...</div>
      </div>
    );
  }

  return (
    <>
      <MondayTable
        title="עובדים"
        columns={columns}
        rowColors={rowColors}
        headerActions={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#6366F1] hover:bg-[#00cc00] text-black font-semibold"
            >
              <Plus className="w-4 h-4 ml-2" />
              עובד חדש
            </Button>
            <BoardInfoBubbleNew
              boardName="עובדים"
              description="ניהול מידע על עובדי החברה, כולל פרטים אישיים, תפקידים, משכורות וימי חופשה"
              quickActions={[
                {
                  id: "add",
                  label: "הוסף עובד",
                  icon: <Plus className="w-5 h-5 text-white" />,
                  description: "הוסף עובד חדש למערכת",
                  action: () => setIsAddDialogOpen(true)
                },
                {
                  id: "stats",
                  label: "סטטיסטיקות",
                  icon: <BarChart3 className="w-5 h-5 text-white" />,
                  description: "צפה בסטטיסטיקות עובדים",
                  action: () => toast.info("טוען סטטיסטיקות...")
                }
              ]}
              automations={[
                "כאשר עובד מתווסף — המערכת שולחת הודעת ברוכים הבאים אוטומטית",
                "כאשר עובד מגיע ל-90% מימי החופשה — המערכת שולחת התראה למנהל"
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
              אין עובדים להצגה - לחץ על "עובד חדש" להוספה
            </td>
          </tr>
        ) : (
          sortedData.map((employee: any, index: number) => (
            <MondayTableRow key={employee.id}>
              <MondayTableCell>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {employee.fullName}
                </div>
              </MondayTableCell>
              <MondayTableCell>{employee.role || "-"}</MondayTableCell>
              <MondayTableCell>
                {employee.department ? getDepartmentBadge(employee.department) : "-"}
              </MondayTableCell>
              <MondayTableCell>
                {getEmploymentTypeBadge(employee.employmentType)}
              </MondayTableCell>
              <MondayTableCell>{getStatusBadge(employee.status)}</MondayTableCell>
              <MondayTableCell>
                <div className="text-xs space-y-1">
                  {employee.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {employee.email}
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {employee.phone}
                    </div>
                  )}
                </div>
              </MondayTableCell>
              <MondayTableCell>
                {employee.monthlySalary ? `₪${employee.monthlySalary.toLocaleString()}` : 
                 employee.hourlyRate ? `₪${employee.hourlyRate}/שעה` : "-"}
              </MondayTableCell>
              <MondayTableCell>
                {employee.vacationDays ? 
                  `${employee.usedVacationDays || 0}/${employee.vacationDays}` : "-"}
              </MondayTableCell>
              <MondayTableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(employee)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(employee)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>הוסף עובד חדש</DialogTitle>
            <DialogDescription>
              הזן את פרטי העובד החדש
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="שם מלא"
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
              <Label htmlFor="idNumber">תעודת זהות</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">תפקיד</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="מפתח Full Stack"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">מחלקה</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">פיתוח</SelectItem>
                  <SelectItem value="design">עיצוב</SelectItem>
                  <SelectItem value="management">ניהול</SelectItem>
                  <SelectItem value="sales">מכירות</SelectItem>
                  <SelectItem value="support">תמיכה</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employmentType">סוג העסקה</Label>
              <Select value={formData.employmentType} onValueChange={(value) => setFormData({ ...formData, employmentType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">משרה מלאה</SelectItem>
                  <SelectItem value="part_time">משרה חלקית</SelectItem>
                  <SelectItem value="contractor">קבלן</SelectItem>
                  <SelectItem value="freelancer">פרילנסר</SelectItem>
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
                  <SelectItem value="inactive">לא פעיל</SelectItem>
                  <SelectItem value="on_leave">בחופשה</SelectItem>
                  <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">תאריך תחילת עבודה</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlySalary">משכורת חודשית (₪)</Label>
              <Input
                id="monthlySalary"
                type="number"
                value={formData.monthlySalary}
                onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                placeholder="15000"
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
              <Label htmlFor="vacationDays">ימי חופשה שנתיים</Label>
              <Input
                id="vacationDays"
                type="number"
                value={formData.vacationDays}
                onChange={(e) => setFormData({ ...formData, vacationDays: e.target.value })}
                placeholder="22"
              />
            </div>
            <div className="space-y-2 col-span-2">
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
            <Button onClick={handleAdd} disabled={!formData.fullName}>
              הוסף עובד
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ערוך עובד</DialogTitle>
            <DialogDescription>
              עדכן את פרטי העובד
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">שם מלא *</Label>
              <Input
                id="edit-fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="שם מלא"
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="edit-idNumber">תעודת זהות</Label>
              <Input
                id="edit-idNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">תפקיד</Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="מפתח Full Stack"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">מחלקה</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">פיתוח</SelectItem>
                  <SelectItem value="design">עיצוב</SelectItem>
                  <SelectItem value="management">ניהול</SelectItem>
                  <SelectItem value="sales">מכירות</SelectItem>
                  <SelectItem value="support">תמיכה</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-employmentType">סוג העסקה</Label>
              <Select value={formData.employmentType} onValueChange={(value) => setFormData({ ...formData, employmentType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">משרה מלאה</SelectItem>
                  <SelectItem value="part_time">משרה חלקית</SelectItem>
                  <SelectItem value="contractor">קבלן</SelectItem>
                  <SelectItem value="freelancer">פרילנסר</SelectItem>
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
                  <SelectItem value="inactive">לא פעיל</SelectItem>
                  <SelectItem value="on_leave">בחופשה</SelectItem>
                  <SelectItem value="missing_details">פרטים חסרים</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">תאריך תחילת עבודה</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-monthlySalary">משכורת חודשית (₪)</Label>
              <Input
                id="edit-monthlySalary"
                type="number"
                value={formData.monthlySalary}
                onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                placeholder="15000"
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
              <Label htmlFor="edit-vacationDays">ימי חופשה שנתיים</Label>
              <Input
                id="edit-vacationDays"
                type="number"
                value={formData.vacationDays}
                onChange={(e) => setFormData({ ...formData, vacationDays: e.target.value })}
                placeholder="22"
              />
            </div>
            <div className="space-y-2 col-span-2">
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
            <Button onClick={handleEdit} disabled={!formData.fullName}>
              עדכן עובד
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחק עובד</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את העובד "{selectedEmployee?.fullName}"?
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
    </>
  );
}
