import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  AlertCircle, 
  Clock, 
  Users,
  Mail,
  TrendingUp,
  Calendar,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface OpenInvoice {
  id: number;
  clientName: string;
  amount: number;
  dueDate: string;
  daysPastDue: number;
  status: 'urgent' | 'warning' | 'ok';
  lastReminderSent?: string;
}

interface RetainerClient {
  id: number;
  clientName: string;
  hoursIncluded: number;
  hoursUsed: number;
  hoursRemaining: number;
  monthlyAmount: number;
  status: 'ok' | 'warning' | 'exceeded';
}

export default function AccountingDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');

  // Fetch open invoices
  const { data: openInvoices = [] } = useQuery<OpenInvoice[]>({
    queryKey: ['/api/accounting/open-invoices'],
  });

  // Fetch retainer clients
  const { data: retainerClients = [] } = useQuery<RetainerClient[]>({
    queryKey: ['/api/accounting/retainer-clients'],
  });

  // Calculate stats
  const totalOutstanding = openInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const urgentInvoices = openInvoices.filter(inv => inv.daysPastDue > 30);
  const activeRetainers = retainerClients.length;
  const hoursToInvoice = retainerClients.reduce((sum, client) => 
    sum + Math.max(0, client.hoursUsed - client.hoursIncluded), 0
  );

  // Send reminder mutation
  const queryClient = useQueryClient();
  const sendReminderMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await fetch(`/api/accounting/send-reminder/${invoiceId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to send reminder');
      return response.json();
    },
    onSuccess: () => {
      toast.success('מייל תזכורת נשלח בהצלחה!');
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/open-invoices'] });
    },
    onError: () => {
      toast.error('שגיאה בשליחת המייל');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'ok': return 'bg-green-500';
      case 'exceeded': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'urgent': return 'דחוף!';
      case 'warning': return 'תזכורת';
      case 'ok': return 'תקין';
      case 'exceeded': return 'חרג!';
      default: return '-';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">💚 הנהלת חשבונות - גיל</h1>
          <p className="text-gray-400 mt-1">Dashboard מנהלים - מבט מלא על המצב הכספי</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">כסף לגבות</p>
              <p className="text-3xl font-bold mt-2">₪{totalOutstanding.toLocaleString()}</p>
              <p className="text-blue-100 text-xs mt-1">{openInvoices.length} מסמכים פתוחים</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-100" />
          </div>
        </Card>

        {/* Urgent Invoices */}
        <Card className="bg-gradient-to-br from-red-500 to-red-600 p-6 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">חובות מעל 30 יום</p>
              <p className="text-3xl font-bold mt-2">{urgentInvoices.length}</p>
              <p className="text-red-100 text-xs mt-1">דחוף לטיפול!</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-100" />
          </div>
        </Card>

        {/* Active Retainers */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">ריטיינרים פעילים</p>
              <p className="text-3xl font-bold mt-2">{activeRetainers}</p>
              <p className="text-purple-100 text-xs mt-1">לקוחות עם חבילה</p>
            </div>
            <Users className="w-12 h-12 text-purple-100" />
          </div>
        </Card>

        {/* Hours to Invoice */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">שעות לחיוב</p>
              <p className="text-3xl font-bold mt-2">{hoursToInvoice.toFixed(1)}</p>
              <p className="text-orange-100 text-xs mt-1">מעבר לריטיינר</p>
            </div>
            <Clock className="w-12 h-12 text-orange-100" />
          </div>
        </Card>
      </div>

      {/* Open Invoices Table */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-cc-neon-green" />
            מסמכים פתוחים לתשלום
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">סטטוס</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">לקוח</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">סכום</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">תאריך יעד</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">ימים באיחור</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">תזכורת אחרונה</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {openInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(invoice.status)}`}>
                      {invoice.status === 'urgent' && <AlertCircle className="w-3 h-3" />}
                      {getStatusText(invoice.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">{invoice.clientName}</td>
                  <td className="py-3 px-4 text-white font-bold">₪{invoice.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-400">{new Date(invoice.dueDate).toLocaleDateString('he-IL')}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${invoice.daysPastDue > 30 ? 'text-red-400' : invoice.daysPastDue > 15 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {invoice.daysPastDue} ימים
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {invoice.lastReminderSent ? new Date(invoice.lastReminderSent).toLocaleDateString('he-IL') : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-cc-neon-green text-gray-900 hover:bg-cc-neon-green/80 border-none"
                      onClick={() => sendReminderMutation.mutate(invoice.id)}
                      disabled={sendReminderMutation.isPending}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      שלח מייל
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Retainer Clients Table */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-cc-neon-green" />
            מעקב ריטיינרים ושעות
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">סטטוס</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">לקוח</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">שעות בחבילה</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">שעות מנוצלות</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">שעות נותרות</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">סכום חודשי</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">התקדמות</th>
              </tr>
            </thead>
            <tbody>
              {retainerClients.map((client) => (
                <tr key={client.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(client.status)}`}>
                      {client.status === 'exceeded' && <AlertCircle className="w-3 h-3" />}
                      {client.status === 'ok' && <CheckCircle className="w-3 h-3" />}
                      {getStatusText(client.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">{client.clientName}</td>
                  <td className="py-3 px-4 text-gray-400">{client.hoursIncluded} שעות</td>
                  <td className="py-3 px-4 text-white font-semibold">{client.hoursUsed.toFixed(1)} שעות</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${client.hoursRemaining < 0 ? 'text-red-400' : client.hoursRemaining < 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {client.hoursRemaining.toFixed(1)} שעות
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-bold">₪{client.monthlyAmount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${client.hoursUsed > client.hoursIncluded ? 'bg-red-500' : 'bg-cc-neon-green'}`}
                        style={{ width: `${Math.min(100, (client.hoursUsed / client.hoursIncluded) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {((client.hoursUsed / client.hoursIncluded) * 100).toFixed(0)}%
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

