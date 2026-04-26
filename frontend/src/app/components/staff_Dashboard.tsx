import { useEffect, useState } from "react";
import { Link } from "react-router";

import {
  BookOpen,
  Users,
  Clock,
  ListChecks,
  ScanLine,
  ScanBarcode,
  PlusCircle,
} from "lucide-react";

import { StaffAPI } from "../../api/staff";
import { HoldsAPI } from "../../api/holds";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [holds, setHolds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [metricData, holdData] = await Promise.all([
          StaffAPI.getMetrics(),
          HoldsAPI.getAll(),
        ]);

        setMetrics(metricData);
        setHolds(holdData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-8">
        <p className="text-neutral-600">Loading dashboard…</p>
      </div>
    );
  }

  const metricCards = [
    {
      label: "Total Books",
      value: metrics.totalBooks,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Total Patrons",
      value: metrics.totalPatrons,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Active Loans",
      value: metrics.activeLoans,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Total Holds",
      value: metrics.totalHolds,
      icon: ListChecks,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const quickActions = [
    {
      label: "Scan Item to Check Out",
      icon: ScanLine,
      to: "/staff/check-out",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Scan Item to Check In",
      icon: ScanBarcode,
      to: "/staff/check-in",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "Add New Book",
      icon: PlusCircle,
      to: "/staff/catalog",
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  const readyForPickup = holds.filter((h) => h.status === "Ready for Pickup");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Daily Overview</h1>
        <p className="text-neutral-600">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-neutral-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
              <div className="text-3xl font-semibold mb-1">{metric.value}</div>
              <div className="text-sm text-neutral-600">{metric.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.to}
                className={`${action.color} text-white rounded-lg p-6 flex flex-col items-center text-center transition-colors`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <span className="font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Ready for Pickup */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Ready for Pickup</h2>

        {readyForPickup.length === 0 ? (
          <p className="text-neutral-500">No items ready for pickup</p>
        ) : (
          <div className="space-y-3">
            {readyForPickup.map((hold) => (
              <div
                key={hold.id}
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div>
                  <p className="font-medium">{hold.title}</p>
                  <p className="text-sm text-neutral-600">
                    Pickup: {hold.pickup_branch}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Ready
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
