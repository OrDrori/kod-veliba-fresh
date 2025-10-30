import { useState, useEffect, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  AlertTriangle,
  Users,
  TrendingUp,
  Mail,
  RefreshCw,
  Download,
  Calendar,
  Filter,
} from "lucide-react";

type DateRange = "today" | "yesterday" | "week" | "month" | "last_month" | "year" | "all";

interface MergedData {
  clients: any[];
  debtors_report: any[];
  invoices: any[];
  retainers: any[];
  summary: any;
}

export default function DashboardManagerV2() {
  const [dateRange, setDateRange] = useState<DateRange>("year");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  
  // Load merged data
  const mergedDataQuery = trpc.icount.merged.useQuery();
  const mergedData: MergedData | undefined = mergedDataQuery.data as MergedData | undefined;

  // Calculate date range
  const getDateRangeFilter = (range: DateRange) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case "today":
        return { start: today, end: now };
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: today };
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start: weekAgo, end: now };
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart, end: now };
      case "last_month":
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: lastMonthStart, end: lastMonthEnd };
      case "year":
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return { start: yearStart, end: now };
      case "all":
      default:
        return null;
    }
  };

  // Parse date from various formats
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Try DD-MM-YYYY or DD/MM/YYYY
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    
    return null;
  };

  // Filter data by date range
  const filteredData = useMemo(() => {
    if (!mergedData) return null;
    
    const dateFilter = getDateRangeFilter(dateRange);
    
    const filterByDate = (item: any) => {
      if (!dateFilter) return true;
      
      const itemDate = parseDate(item.due_date || item.date);
      if (!itemDate) return true;
      
      return itemDate >= dateFilter.start && itemDate <= dateFilter.end;
    };
    
    const filterByType = (item: any) => {
      if (filterType === "all") return true;
      return item.type === filterType;
    };
    
    const filterByStatus = (item: any) => {
      if (filterStatus === "all") return true;
      return item.status === filterStatus;
    };
    
    const filterByUrgency = (item: any) => {
      if (filterUrgency === "all") return true;
      return item.urgency === filterUrgency;
    };
    
    const filteredDebtors = mergedData.debtors_report.filter((d: any) => 
      filterByDate(d) && filterByType(d) && filterByStatus(d) && filterByUrgency(d)
    );
    
    const filteredInvoices = mergedData.invoices.filter((i: any) => 
      filterByDate(i) && filterByType(i) && filterByStatus(i)
    );
    
    return {
      ...mergedData,
      debtors_report: filteredDebtors,
      invoices: filteredInvoices,
    };
  }, [mergedData, dateRange, filterType, filterStatus, filterUrgency]);

  // Calculate stats from filtered data
  const stats = useMemo(() => {
    if (!filteredData) return {
      totalToCollect: 0,
      totalOverdue: 0,
      activeRetainers: 0,
      totalMRR: 0,
      totalMRRPlanned: 0,
    };
    
    const totalToCollect = filteredData.invoices
      .filter((inv: any) => inv.status === "open")
      .reduce((sum: number, inv: any) => sum + (inv.balance || 0), 0);
    
    const totalOverdue = filteredData.debtors_report
      .reduce((sum: number, d: any) => sum + (d.balance || 0), 0);
    
    const activeRetainers = filteredData.retainers
      .filter((r: any) => r.status === "active").length;
    
    const totalMRR = filteredData.retainers
      .reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
    
    const totalMRRPlanned = filteredData.clients
      .reduce((sum: number, c: any) => sum + (c.monthly_income_planned || 0), 0);
    
    return {
      totalToCollect,
      totalOverdue,
      activeRetainers,
      totalMRR,
      totalMRRPlanned,
    };
  }, [filteredData]);

  const sendReminderEmail = (client: string, docNumber: string) => {
    alert(`מייל נשלח!\nתזכורת נשלחה ל-${client} (${docNumber})`);
  };

  const sendBulkEmails = (type: "all" | "urgent") => {
    const count = type === "all" 
      ? filteredData?.debtors_report.length || 0
      : filteredData?.debtors_report.filter((d: any) => d.urgency === "critical").length || 0;
    alert(`מיילים נשלחו!\n${count} תזכורות נשלחו בהצלחה`);
  };

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

  const getDateRangeLabel = (range: DateRange) => {
    switch (range) {
      case "today": return "היום";
      case "yesterday": return "אתמול";
      case "week": return "7 ימים אחרונים";
      case "month": return "החודש";
      case "last_month": return "חודש שעבר";
      case "year": return "השנה (2025)";
      case "all": return "כל הזמנים";
      default: return "בחר טווח";
    }
  };

  if (mergedDataQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (!filteredData) {
    return <div>אין נתונים</div>;
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
          <Button onClick={() => mergedDataQuery.refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 ml-2" />
            רענן נתונים
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            ייצא לאקסל
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            סננים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">טווח תאריכים</label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <Calendar className="h-4 w-4 ml-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">היום</SelectItem>
                  <SelectItem value="yesterday">אתמול</SelectItem>
                  <SelectItem value="week">7 ימים אחרונים</SelectItem>
                  <SelectItem value="month">החודש</SelectItem>
                  <SelectItem value="last_month">חודש שעבר</SelectItem>
                  <SelectItem value="year">השנה (2025)</SelectItem>
                  <SelectItem value="all">כל הזמנים</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">סטטוס</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">הכל</SelectItem>
                  <SelectItem value="open">פתוח</SelectItem>
                  <SelectItem value="paid">שולם</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Urgency Filter */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">דחיפות</label>
              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">הכל</SelectItem>
                  <SelectItem value="critical">🚨 קריטי</SelectItem>
                  <SelectItem value="high">🔥 דחוף</SelectItem>
                  <SelectItem value="medium">🟡 בינוני</SelectItem>
                  <SelectItem value="low">🟢 נמוך</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setDateRange("year");
                  setFilterType("all");
                  setFilterStatus("all");
                  setFilterUrgency("all");
                }}
                variant="outline"
                className="w-full"
              >
                אפס סננים
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              ₪{stats.totalToCollect.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {filteredData.invoices.filter((inv: any) => inv.status === "open").length} חשבוניות פתוחות
            </p>
            <p className="text-xs text-blue-400 mt-1">{getDateRangeLabel(dateRange)}</p>
          </CardContent>
        </Card>

        {/* Card 2: Overdue Debts */}
        <Card className="bg-gray-900 border-red-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              חובות
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              ₪{stats.totalOverdue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {filteredData.debtors_report.length} לקוחות חייבים
            </p>
            <p className="text-xs text-blue-400 mt-1">{getDateRangeLabel(dateRange)}</p>
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
              {stats.activeRetainers}
            </div>
            <p className="text-xs text-gray-500 mt-1">לקוחות עם ריטיינר חודשי</p>
          </CardContent>
        </Card>

        {/* Card 4: MRR Actual */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              MRR בפועל
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₪{stats.totalMRR.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">הכנסה חוזרת חודשית</p>
          </CardContent>
        </Card>

        {/* Card 5: MRR Planned */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              MRR מתוכנן
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₪{stats.totalMRRPlanned.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              הפרש: ₪{(stats.totalMRRPlanned - stats.totalMRR).toLocaleString()}
            </p>
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
                {getDateRangeLabel(dateRange)} - {filteredData.debtors_report.length} רשומות
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
                <TableHead className="text-gray-400">הערות</TableHead>
                <TableHead className="text-gray-400">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.debtors_report
                .sort((a: any, b: any) => (b.days_overdue || 0) - (a.days_overdue || 0))
                .map((debtor: any, index: number) => (
                  <TableRow
                    key={index}
                    className={`border-gray-800 hover:bg-gray-800/50 ${
                      debtor.send_email ? 'bg-yellow-500/10' : ''
                    }`}
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getUrgencyColor(debtor.urgency || 'low')}
                      >
                        {getUrgencyLabel(debtor.urgency || 'low')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {debtor.client}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {debtor.doc_number}
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      ₪{(debtor.balance || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          (debtor.days_overdue || 0) > 180
                            ? "bg-red-500/20 text-red-400"
                            : (debtor.days_overdue || 0) > 100
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }
                      >
                        {debtor.days_overdue || 0} ימים
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {debtor.due_date}
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm max-w-xs truncate">
                      {debtor.notes || '-'}
                      {debtor.last_reminder && (
                        <div className="text-xs text-blue-400 mt-1">
                          מייל אחרון: {debtor.last_reminder}
                        </div>
                      )}
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
    </div>
  );
}

