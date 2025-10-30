import { Router } from 'express';
import { getDb } from '../db';
import { crmClients, clientTasks } from '../../drizzle/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

const router = Router();

// Get open invoices (mock data for now - will integrate with iCount later)
router.get('/open-invoices', async (req, res) => {
  try {
    const db = await getDb();
    
    // Mock data based on Karen's file
    const openInvoices = [
      {
        id: 1,
        clientName: 'AB Dental Devices Ltd.',
        amount: 2124,
        dueDate: '2025-10-13',
        daysPastDue: 17,
        status: 'warning' as const,
        lastReminderSent: null
      },
      {
        id: 2,
        clientName: 'One1 Global',
        amount: 10384,
        dueDate: '2025-09-01',
        daysPastDue: 59,
        status: 'urgent' as const,
        lastReminderSent: '2025-10-20'
      },
      {
        id: 3,
        clientName: 'גבדור בע"מ',
        amount: 6875,
        dueDate: '2025-09-03',
        daysPastDue: 57,
        status: 'urgent' as const,
        lastReminderSent: '2025-10-20'
      },
      {
        id: 4,
        clientName: 'גרואו פיימנטס בע"מ',
        amount: 31624,
        dueDate: '2025-09-01',
        daysPastDue: 59,
        status: 'urgent' as const,
        lastReminderSent: '2025-10-15'
      },
      {
        id: 5,
        clientName: 'דיגיטל וייב שיווק דיגיטלי',
        amount: 1475,
        dueDate: '2025-08-03',
        daysPastDue: 88,
        status: 'urgent' as const,
        lastReminderSent: '2025-10-21'
      },
      {
        id: 6,
        clientName: 'כרמל דיירקט',
        amount: 4425,
        dueDate: '2025-08-19',
        daysPastDue: 72,
        status: 'urgent' as const,
        lastReminderSent: null
      },
      {
        id: 7,
        clientName: 'סים פור פליי בע״מ',
        amount: 23600,
        dueDate: '2025-06-26',
        daysPastDue: 126,
        status: 'urgent' as const,
        lastReminderSent: '2025-10-29'
      },
      {
        id: 8,
        clientName: 'טריגו',
        amount: 4720,
        dueDate: '2025-04-06',
        daysPastDue: 207,
        status: 'urgent' as const,
        lastReminderSent: '2025-10-21'
      }
    ];

    res.json(openInvoices);
  } catch (error) {
    console.error('Error fetching open invoices:', error);
    res.status(500).json({ error: 'Failed to fetch open invoices' });
  }
});

// Get retainer clients with hours tracking
router.get('/retainer-clients', async (req, res) => {
  try {
    const db = await getDb();
    
    // Get clients with retainer or bank hours
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const clients = await db
      .select()
      .from(crmClients)
      .where(
        sql`${crmClients.businessType} IN ('retainer', 'bank_hours')`
      );

    // Calculate hours for each client
    const retainerClients = await Promise.all(
      clients.map(async (client) => {
        // Get tasks for this client (mock for now)
        const hoursIncluded = client.bankHours || 0;
        const hoursUsed = client.usedHours || 0;
        const hoursRemaining = hoursIncluded - hoursUsed;
        
        let status: 'ok' | 'warning' | 'exceeded' = 'ok';
        if (hoursRemaining < 0) {
          status = 'exceeded';
        } else if (hoursRemaining < 2) {
          status = 'warning';
        }

        return {
          id: client.id,
          clientName: client.clientName,
          hoursIncluded,
          hoursUsed,
          hoursRemaining,
          monthlyAmount: client.monthlyRetainer || 0,
          status
        };
      })
    );

    // Add mock data for known clients
    const mockRetainers = [
      {
        id: 1001,
        clientName: 'ONE1 Global',
        hoursIncluded: 5,
        hoursUsed: 4.5,
        hoursRemaining: 0.5,
        monthlyAmount: 0,
        status: 'warning' as const
      },
      {
        id: 1002,
        clientName: 'Silise',
        hoursIncluded: 2,
        hoursUsed: 1.8,
        hoursRemaining: 0.2,
        monthlyAmount: 0,
        status: 'warning' as const
      },
      {
        id: 1003,
        clientName: 'רחמינוב יהלומים',
        hoursIncluded: 10,
        hoursUsed: 8.5,
        hoursRemaining: 1.5,
        monthlyAmount: 8000,
        status: 'ok' as const
      },
      {
        id: 1004,
        clientName: 'מועדון הגריי',
        hoursIncluded: 10,
        hoursUsed: 12.5,
        hoursRemaining: -2.5,
        monthlyAmount: 42120,
        status: 'exceeded' as const
      },
      {
        id: 1005,
        clientName: 'מור קורן',
        hoursIncluded: 10,
        hoursUsed: 7.2,
        hoursRemaining: 2.8,
        monthlyAmount: 0,
        status: 'ok' as const
      }
    ];

    const allRetainers = [...retainerClients.filter(c => c.hoursIncluded > 0), ...mockRetainers];
    
    res.json(allRetainers);
  } catch (error) {
    console.error('Error fetching retainer clients:', error);
    res.status(500).json({ error: 'Failed to fetch retainer clients' });
  }
});

// Send reminder email
router.post('/send-reminder/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    // TODO: Integrate with email service
    // For now, just return success
    
    console.log(`Sending reminder for invoice ${invoiceId}`);
    
    res.json({ 
      success: true, 
      message: 'Reminder sent successfully',
      sentAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

export default router;

