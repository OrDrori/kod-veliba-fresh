import { useState } from "react";
import { trpc } from "@/lib/trpc";
import MondayTable, { MondayTableRow, MondayTableCell } from "@/components/MondayTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, User, Mail, Phone, Briefcase, Building } from "lucide-react";
import { toast } from "sonner";
import { BoardInfoBubbleNew } from "@/components/BoardInfoBubbleNew";
import SortFilterDialog from "@/components/SortFilterDialog";
import { useSortFilter } from "@/hooks/useSortFilter";

export default function BoardContacts() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    notes: "",
  });

  const { data: contacts = [] } = trpc.contacts.list.useQuery();
  const utils = trpc.useUtils();
  const { sortedData, sortConfig, filters, applySort, applyFilters, clearSort, clearFilters } = useSortFilter(contacts, "contacts");

  const addMutation = trpc.contacts.create.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("איש קשר נוסף בהצלחה");
    },
    onError: () => toast.error("שגיאה בהוספת איש קשר"),
  });

  const updateMutation = trpc.contacts.update.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      setIsEditDialogOpen(false);
      setSelectedContact(null);
      resetForm();
      toast.success("איש קשר עודכן בהצלחה");
    },
    onError: () => toast.error("שגיאה בעדכון איש קשר"),
  });

  const deleteMutation = trpc.contacts.delete.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedContact(null);
      toast.success("איש קשר נמחק בהצלחה");
    },
    onError: () => toast.error("שגיאה במחיקת איש קשר"),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    if (!formData.name) {
      toast.error("נא למלא את שם איש הקשר");
      return;
    }

    addMutation.mutate({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      company: formData.company || null,
      position: formData.position || null,
      notes: formData.notes || null,
    });
  };

  const handleUpdate = () => {
    if (!selectedContact) return;

    updateMutation.mutate({
      id: selectedContact.id,
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      company: formData.company || null,
      position: formData.position || null,
      notes: formData.notes || null,
    });
  };

  const handleDelete = () => {
    if (selectedContact) {
      deleteMutation.mutate(selectedContact.id);
    }
  };

  const openEditDialog = (contact: any) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      position: contact.position || "",
      notes: contact.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (contact: any) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };

  const columns = [
    { id: "name", label: "שם מלא", icon: <User className="w-4 h-4" />, width: "20%" },
    { id: "position", label: "תפקיד", icon: <Briefcase className="w-4 h-4" />, width: "15%" },
    { id: "company", label: "חברה", icon: <Building className="w-4 h-4" />, width: "20%" },
    { id: "email", label: "אימייל", icon: <Mail className="w-4 h-4" />, width: "20%" },
    { id: "phone", label: "טלפון", icon: <Phone className="w-4 h-4" />, width: "15%" },
  ];

  return (
    <>
      <MondayTable
        title="אנשי קשר"
        description="רשימת אנשי קשר"
        columns={columns}
        onAddItem={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}
        headerActions={
          <div className="flex items-center gap-2">
            <BoardInfoBubbleNew
              boardName="בורד אנשי קשר"
              description="מרכז מידע לכל אנשי הקשר שלך - לקוחות, שותפים, ספקים, ואנשי מקצוע אחרים. שמור פרטי התקשרות והמידע המקצועי של כל איש קשר."
              features={[
                "הוסף איש קשר חדש דרך 'פריט חדש'",
                "מלא שם מלא, תפקיד, חברה",
                "הוסף פרטי התקשרות: אימייל וטלפון",
                "הוסף הערות חשובות על איש הקשר",
                "עדכן את הפרטים בכל עת דרך כפתור העריכה"
              ]}
              quickActions={[
                {
                  id: "email",
                  label: "שליחת אימייל",
                  icon: <Mail className="w-5 h-5 text-white" />,
                  description: "שלח אימייל לאיש קשר",
                  action: () => toast.info("פתיחת אימייל...")
                },
                {
                  id: "call",
                  label: "שיחת טלפון",
                  icon: <Phone className="w-5 h-5 text-white" />,
                  description: "התקשר טלפונית",
                  action: () => toast.info("פתיחת חייגן...")
                },
                {
                  id: "company",
                  label: "צפייה בחברה",
                  icon: <Building className="w-5 h-5 text-white" />,
                  description: "עבור לבורד CRM",
                  action: () => toast.info("מעבר ל-CRM...")
                },
                {
                  id: "stats",
                  label: "סטטיסטיקות",
                  icon: <Briefcase className="w-5 h-5 text-white" />,
                  description: "צפה בסטטיסטיקות",
                  action: () => toast.info("טוען סטטיסטיקות...")
                }
              ]}
              automations={[
                "כאשר מוסיפים איש קשר חדש — המערכת מקשרת אוטומטית לחברה ב-CRM אם קיימת"
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
              אין אנשי קשר להצגה - לחץ על "פריט חדש" להוספה
            </td>
          </tr>
        ) : (
          sortedData.map((contact: any) => (
            <MondayTableRow key={contact.id}>
              <MondayTableCell>{contact.name}</MondayTableCell>
              <MondayTableCell>{contact.position || "-"}</MondayTableCell>
              <MondayTableCell>{contact.company || "-"}</MondayTableCell>
              <MondayTableCell>{contact.email || "-"}</MondayTableCell>
              <MondayTableCell>{contact.phone || "-"}</MondayTableCell>
              <MondayTableCell className="w-24">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(contact)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(contact)}
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
            <DialogTitle>הוספת איש קשר חדש</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם מלא *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="שם מלא"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">תפקיד</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="מנכ'ל, מנהל פיתוח, וכו'"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">חברה</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="שם החברה"
                />
              </div>
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
            <Button onClick={handleAdd} className="bg-gradient-to-r from-[#6366F1] to-[#39ff14] text-[#1a1d2e] font-bold hover:scale-105 transition-transform neon-glow">הוסף איש קשר</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת איש קשר</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">שם מלא *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="שם מלא"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-position">תפקיד</Label>
                <Input
                  id="edit-position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="מנכ'ל, מנהל פיתוח, וכו'"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">חברה</Label>
                <Input
                  id="edit-company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="שם החברה"
                />
              </div>
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
            <DialogTitle>מחיקת איש קשר</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            האם אתה בטוח שברצונך למחוק את איש הקשר "{selectedContact?.name}"? פעולה זו אינה ניתנת לביטול.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-gradient-to-r from-red-600 to-red-700 hover:scale-105 transition-transform">
              מחק איש קשר
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

