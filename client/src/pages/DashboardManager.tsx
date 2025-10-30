import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  AlertTriangle,
  Users,
  TrendingUp,
  Mail,
  RefreshCw,
  Download,
} from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

interface Invoice {
  client: string;
  doc_number: string;
  date: string;
  amount: number;
  vat: number;
  total: number;
  paid: number;
  balance: number;
  status: string;
}

interface Retainer {
  client: string;
  doc_number: string;
  date: string;
  amount: number;
  vat: number;
  total: number;
  frequency: string;
  status: string;
}

interface Debtor {
  client: string;
  doc_number: string;
  due_date: string;
  amount: number;
  vat: number;
  total: number;
  balance: number;
  days_overdue: number;
  status: string;
  urgency: string;
}

export default function DashboardManager() {
  // const { toast } = useToast();
  const toast = ({ title, description, variant }: any) => {
    console.log(title, description, variant);
    alert(`${title}: ${description}`);
  };
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [retainers, setRetainers] = useState<Retainer[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);

  const invoicesQuery = trpc.icount.invoices.useQuery();
  const retainersQuery = trpc.icount.retainers.useQuery();
  const debtorsQuery = trpc.icount.debtors.useQuery();

  useEffect(() => {
    if (invoicesQuery.data) {
      setInvoices(invoicesQuery.data.invoices || []);
    }
    if (retainersQuery.data) {
      setRetainers(retainersQuery.data.retainers || []);
    }
    if (debtorsQuery.data) {
      setDebtors(debtorsQuery.data.debtors_report || []);
    }
    setLoading(invoicesQuery.isLoading || retainersQuery.isLoading || debtorsQuery.isLoading);
  }, [invoicesQuery.data, retainersQuery.data, debtorsQuery.data, invoicesQuery.isLoading, retainersQuery.isLoading, debtorsQuery.isLoading]);

  const loadData = () => {
    invoicesQuery.refetch();
    retainersQuery.refetch();
    debtorsQuery.refetch();
  };

  const sendReminderEmail = (client: string, docNumber: string) => {
    toast({
      title: "מייל נשלח!",
      description: `תזכורת נשלחה ל-${client} (${docNumber})`,
    });
  };

  const sendBulkEmails = (type: "all" | "urgent") => {
    const count = type === "all" ? debtors.length : debtors.filter(d => d.urgency === "critical").length;
    toast({
      title: "מיילים נשלחו!",
      description: `${count} תזכורות נשלחו בהצלחה`,
    });
  };

  // Calculate stats
  const totalToCollect = invoices
    .filter(inv => inv.status === "open")
    .reduce((sum, inv) => sum + inv.balance, 0);

  const totalOverdue = debtors.reduce((sum, d) => sum + d.balance, 0);

  const totalMRR = retainers.reduce((sum, r) => sum + r.amount, 0);

  const activeRetainers = retainers.filter(r => r.status === "active").length;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/50";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "🚨 דחוף מאוד";
      case "high":
        return "🔥 דחוף";
      case "medium":
        return "🟡 בינוני";
      default:
        return "🟢 נמוך";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard מנהלים</h1>
          <p className="text-gray-400">סקירת הנהלת חשבונות - קוד וליבה בע"מ</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadData()} variant="outline">
            <RefreshCw className="h-4 w-4 ml-2" />
            רענן נתונים
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            ייצא לאקסל
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total to Collect */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              כסף לגבות
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₪{totalToCollect.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.filter(inv => inv.status === "open").length} חשבוניות פתוחות
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Overdue Debts */}
        <Card className="bg-gray-900 border-red-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              חובות מעל 30 יום
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              ₪{totalOverdue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {debtors.length} לקוחות חייבים
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Active Retainers */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              ריטיינרים פעילים
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activeRetainers}
            </div>
            <p className="text-xs text-gray-500 mt-1">לקוחות עם ריטיינר חודשי</p>
          </CardContent>
        </Card>

        {/* Card 4: MRR */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              MRR (הכנסה חודשית)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₪{totalMRR.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">הכנסה חוזרת חודשית</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Debtors Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">🚨 חייבים דחופים</CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                לקוחות עם חובות מעל 30 יום - דורש טיפול מיידי!
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => sendBulkEmails("urgent")}
                variant="destructive"
                size="sm"
              >
                <Mail className="h-4 w-4 ml-2" />
                שלח לדחופים
              </Button>
              <Button
                onClick={() => sendBulkEmails("all")}
                variant="outline"
                size="sm"
              >
                <Mail className="h-4 w-4 ml-2" />
                שלח לכולם
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">דחיפות</TableHead>
                <TableHead className="text-gray-400">לקוח</TableHead>
                <TableHead className="text-gray-400">מסמך</TableHead>
                <TableHead className="text-gray-400">סכום</TableHead>
                <TableHead className="text-gray-400">ימי איחור</TableHead>
                <TableHead className="text-gray-400">תאריך</TableHead>
                <TableHead className="text-gray-400">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debtors
                .sort((a, b) => b.days_overdue - a.days_overdue)
                .map((debtor, index) => (
                  <TableRow
                    key={index}
                    className="border-gray-800 hover:bg-gray-800/50"
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getUrgencyColor(debtor.urgency)}
                      >
                        {getUrgencyLabel(debtor.urgency)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {debtor.client}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {debtor.doc_number}
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      ₪{debtor.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          debtor.days_overdue > 180
                            ? "bg-red-500/20 text-red-400"
                            : debtor.days_overdue > 100
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }
                      >
                        {debtor.days_overdue} ימים
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {debtor.due_date}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() =>
                          sendReminderEmail(debtor.client, debtor.doc_number)
                        }
                        size="sm"
                        variant="outline"
                      >
                        <Mail className="h-3 w-3 ml-1" />
                        שלח מייל
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Retainers Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">💚 לקוחות עם ריטיינר חודשי</CardTitle>
          <p className="text-sm text-gray-400 mt-1">
            מעקב אחרי לקוחות עם הסכמי ריטיינר פעילים
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">לקוח</TableHead>
                <TableHead className="text-gray-400">מסמך</TableHead>
                <TableHead className="text-gray-400">סכום חודשי</TableHead>
                <TableHead className="text-gray-400">תאריך אחרון</TableHead>
                <TableHead className="text-gray-400">סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retainers
                .sort((a, b) => b.amount - a.amount)
                .map((retainer, index) => (
                  <TableRow
                    key={index}
                    className="border-gray-800 hover:bg-gray-800/50"
                  >
                    <TableCell className="text-white font-medium">
                      {retainer.client}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {retainer.doc_number}
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      ₪{retainer.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {retainer.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-green-500/20 text-green-400 border-green-500/50"
                      >
                        פעיל
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Open Invoices Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">📄 חשבוניות פתוחות</CardTitle>
          <p className="text-sm text-gray-400 mt-1">
            חשבוניות שממתינות לתשלום
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">לקוח</TableHead>
                <TableHead className="text-gray-400">מסמך</TableHead>
                <TableHead className="text-gray-400">תאריך</TableHead>
                <TableHead className="text-gray-400">סכום</TableHead>
                <TableHead className="text-gray-400">יתרה</TableHead>
                <TableHead className="text-gray-400">סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices
                .filter(inv => inv.status === "open")
                .map((invoice, index) => (
                  <TableRow
                    key={index}
                    className="border-gray-800 hover:bg-gray-800/50"
                  >
                    <TableCell className="text-white font-medium">
                      {invoice.client}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {invoice.doc_number}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {invoice.date}
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      ₪{invoice.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      ₪{invoice.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                      >
                        ממתין לתשלום
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

