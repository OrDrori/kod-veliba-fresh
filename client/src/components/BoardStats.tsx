import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface Stat {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface BoardStatsProps {
  stats: Stat[];
}

export function BoardStats({ stats }: BoardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border-none shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <p
                      className={`text-xs mt-1 ${
                        stat.trend.isPositive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.trend.isPositive ? "↑" : "↓"} {stat.trend.value}%
                    </p>
                  )}
                </div>
                <div
                  className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
