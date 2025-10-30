import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import MondayLayout from "./components/MondayLayout";
import Home from "./pages/Home";
import BoardCRM from "./pages/BoardCRM";
import BoardClientTasks from "./pages/BoardClientTasks";
import BoardBilling from "./pages/BoardBilling";
import BoardTasksNew from "./pages/BoardTasksNew";
import BoardLeads from "./pages/BoardLeads";
import BoardContacts from "./pages/BoardContacts";
import BoardDesignTasks from "./pages/BoardDesignTasks";
import BoardWebsite from "./pages/BoardWebsite";
import BoardSystemImprovements from "./pages/BoardSystemImprovements";
import BoardGrowSites from "./pages/BoardGrowSites";
import BoardPaymentCollection from "./pages/BoardPaymentCollection";
import BoardDeals from "./pages/BoardDeals";
import BoardEmployees from "./pages/BoardEmployees";
import BoardTimeTracking from "./pages/BoardTimeTracking";
import AccountingDashboard from "./pages/AccountingDashboard";
import DashboardManagerV2 from "./pages/DashboardManagerV2";

function Router() {
  return (
    <MondayLayout>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/board/crm"} component={BoardCRM} />
        <Route path={"/board/tasks"} component={BoardClientTasks} />
        <Route path={"/board/billing"} component={BoardBilling} />
        <Route path={"/board/tasks-new"} component={BoardTasksNew} />
        <Route path={"/board/leads"} component={BoardLeads} />
        <Route path={"/board/contacts"} component={BoardContacts} />
        <Route path={"/board/design-tasks"} component={BoardDesignTasks} />
        <Route path={"/board/website"} component={BoardWebsite} />
        <Route path={"/board/system-improvements"} component={BoardSystemImprovements} />
        <Route path={"/board/grow-sites"} component={BoardGrowSites} />
        <Route path={"/board/payment-collection"} component={BoardPaymentCollection} />
        <Route path={"/board/deals"} component={BoardDeals} />
        <Route path={"/board/employees"} component={BoardEmployees} />
        <Route path={"/board/time-tracking"} component={BoardTimeTracking} />
        <Route path={"/accounting"} component={AccountingDashboard} />
        <Route path={"/dashboard-manager"} component={DashboardManagerV2} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </MondayLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
