import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Users, CheckCircle2, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface DataCube {
  id: string;
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
  color: string;
}

interface DataCubesProps {
  boardType?: "all" | "crm" | "leads" | "tasks" | "billing";
}

export function DataCubes({ boardType = "all" }: DataCubesProps) {
  const [cubes, setCubes] = useState<DataCube[]>([]);

  // Fetch iCount merged data
  const { data: mergedData } = trpc.icount.merged.useQuery();

  useEffect(() => {
    if (!mergedData) return;

    const calculatedCubes: DataCube[] = [];

    // Calculate stats from merged data
    const stats = calculateStats(mergedData);

    // 1. כסף לגבות
    calculatedCubes.push({
      id: "money-to-collect",
      title: "כסף לגבות",
      value: `₪${stats.totalDebt.toLocaleString()}`,
      trend: stats.totalDebt > 0 ? "down" : "neutral",
      trendValue: `${stats.openInvoices} חשבוניות פתוחות`,
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600",
    });

    // 2. חובות דחופים
    calculatedCubes.push({
      id: "urgent-debts",
      title: "חובות דחופים",
      value: `₪${stats.urgentDebt.toLocaleString()}`,
      trend: "down",
      trendValue: `${stats.urgentClients} לקוחות מעל 30 יום`,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "from-red-500 to-pink-600",
    });

    // 3. ריטיינרים פעילים
    calculatedCubes.push({
      id: "active-retainers",
      title: "ריטיינרים פעילים",
      value: stats.activeRetainers,
      trend: "up",
      trendValue: `₪${stats.mrrActual.toLocaleString()}/חודש`,
      icon: <Users className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-600",
    });

    // 4. MRR מתוכנן
    calculatedCubes.push({
      id: "mrr-planned",
      title: "MRR מתוכנן",
      value: `₪${stats.mrrPlanned.toLocaleString()}`,
      trend: stats.mrrPlanned > stats.mrrActual ? "up" : "down",
      trendValue: `הפרש: ₪${Math.abs(stats.mrrPlanned - stats.mrrActual).toLocaleString()}`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-purple-500 to-indigo-600",
    });

    setCubes(calculatedCubes);
  }, [mergedData]);

  const calculateStats = (data: any) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    let totalDebt = 0;
    let urgentDebt = 0;
    let openInvoices = 0;
    let urgentClients = 0;
    let activeRetainers = 0;
    let mrrActual = 0;
    let mrrPlanned = 0;

    // Process clients
    data.clients?.forEach((client: any) => {
      // Count debts
      client.debts?.forEach((debt: any) => {
        const debtDate = new Date(debt.date);
        if (debtDate.getFullYear() === currentYear) {
          totalDebt += debt.amount || 0;
          openInvoices++;
          
          if (debt.days_overdue > 30) {
            urgentDebt += debt.amount || 0;
            urgentClients++;
          }
        }
      });

      // Count retainers
      if (client.retainer) {
        activeRetainers++;
        mrrActual += client.retainer.amount || 0;
      }

      // Sum MRR planned
      if (client.monthly_income_planned) {
        mrrPlanned += client.monthly_income_planned;
      }
    });

    return {
      totalDebt: Math.round(totalDebt),
      urgentDebt: Math.round(urgentDebt),
      openInvoices,
      urgentClients,
      activeRetainers,
      mrrActual: Math.round(mrrActual),
      mrrPlanned: Math.round(mrrPlanned),
    };
  };

  const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cubes.map((cube) => (
        <div
          key={cube.id}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
          style={{
            backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
          }}
        >
          <div className={`bg-gradient-to-br ${cube.color} absolute inset-0 opacity-90`} />
          
          <div className="relative z-10">
            {/* Icon */}
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                {cube.icon}
              </div>
              {getTrendIcon(cube.trend)}
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium opacity-90 mb-1">{cube.title}</h3>

            {/* Value */}
            <div className="text-3xl font-bold mb-2">{cube.value}</div>

            {/* Trend */}
            {cube.trendValue && (
              <p className="text-xs opacity-75">{cube.trendValue}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

