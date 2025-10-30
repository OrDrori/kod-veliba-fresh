import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function BoardBilling() {
  const { data: charges, isLoading } = trpc.billing.list.useQuery();
  const { data: clients } = trpc.crm.list.useQuery();
  const { data: tasks } = trpc.clientTasks.list.useQuery();

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
      pending: { label: "ממתין", color: "bg-yellow-100 text-yellow-800" },
      invoiced: { label: "חשבונית נשלחה", color: "bg-blue-100 text-blue-800" },
      paid: { label: "שולם", color: "bg-green-100 text-green-800" },
      overdue: { label: "באיחור", color: "bg-red-100 text-red-800" },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  const getChargeTypeBadge = (chargeType: string) => {
    const typeMap = {
      retainer: { label: "ריטיינר", color: "bg-purple-100 text-purple-800" },
      hourly: { label: "שעתי", color: "bg-blue-100 text-blue-800" },
      bank: { label: "בנק שעות", color: "bg-cyan-100 text-cyan-800" },
      project: { label: "פרויקט", color: "bg-orange-100 text-orange-800" },
    };
    const type = typeMap[chargeType as keyof typeof typeMap] || { label: chargeType, color: "bg-gray-100 text-gray-800" };
    return <Badge className={type.color}>{type.label}</Badge>;
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">טוען...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">גבייה וחיובים</h1>
          <p className="text-muted-foreground">ניהול חיובים, חשבוניות ותשלומים</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            חיוב חדש
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

      {/* Billing Table */}
      <Card>
        <CardHeader>
          <CardTitle>כל החיובים</CardTitle>
          <CardDescription>רשימת כל החיובים והחשבוניות</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">לקוח</TableHead>
                <TableHead className="text-right">משימה</TableHead>
                <TableHead className="text-right">סוג חיוב</TableHead>
                <TableHead className="text-right">תיאור</TableHead>
                <TableHead className="text-right">סכום</TableHead>
                <TableHead className="text-right">שעות</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">מס' חשבונית</TableHead>
                <TableHead className="text-right">תאריך חשבונית</TableHead>
                <TableHead className="text-right">תאריך תשלום</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charges && charges.length > 0 ? (
                charges.map((charge: any) => {
                  const status = getStatusBadge(charge.status);
                  
                  return (
                    <TableRow key={charge.id}>
                      <TableCell>
                        <Link href={`/board/crm?client=${charge.clientId}`}>
                          <span className="text-blue-600 hover:underline cursor-pointer font-medium">
                            {getClientName(charge.clientId)}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {charge.taskId ? (
                          <Link href={`/board/tasks?task=${charge.taskId}`}>
                            <span className="text-blue-600 hover:underline cursor-pointer">
                              {getTaskName(charge.taskId)}
                            </span>
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{getChargeTypeBadge(charge.chargeType)}</TableCell>
                      <TableCell className="max-w-xs truncate">{charge.description}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(charge.amount)}</TableCell>
                      <TableCell>{charge.hours || "-"}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{charge.invoiceNumber || "-"}</TableCell>
                      <TableCell>
                        {charge.invoiceDate ? new Date(charge.invoiceDate).toLocaleDateString("he-IL") : "-"}
                      </TableCell>
                      <TableCell>
                        {charge.paidDate ? new Date(charge.paidDate).toLocaleDateString("he-IL") : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {charge.status === "pending" && (
                            <Button variant="ghost" size="sm" className="text-green-600">
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    אין חיובים להצגה
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-4">
        <Link href="/board/tasks">
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור לבורד משימות
          </Button>
        </Link>
        <Link href="/board/crm">
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור לבורד CRM
          </Button>
        </Link>
      </div>
    </div>
  );
}

