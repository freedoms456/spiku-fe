<<<<<<< HEAD
=======
"use client";

>>>>>>> 6c284cdf65c09949b970dcf3da232917ca0dc86b
import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard-layout"
import OverviewCards from "@/components/overview-cards"
import EmployeeDemographics from "@/components/employee-demographics"
import TurnoverAnalysis from "@/components/turnover-analysis"
import PerformanceMetrics from "@/components/performance-metrics"
import CompensationAnalysis from "@/components/compensation-analysis"
<<<<<<< HEAD

export const metadata: Metadata = {
  title: "HR Analytics Dashboard",
  description: "Comprehensive HR analytics dashboard with key metrics and insights",
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
=======
import { useAuth } from "@/hooks/use-auth";



// export const metadata: Metadata = {
//   title: "HR Analytics Dashboard",
//   description: "Comprehensive HR analytics dashboard with key metrics and insights",
// }


export default function DashboardPage() {
  const { user, loading,logout } = useAuth({ redirectTo: "/login" });
  return (
    <DashboardLayout>
        <button
      onClick={logout}
      className="px-4 py-2 bg-red-600 text-white rounded"
    >
      Logout
    </button>
>>>>>>> 6c284cdf65c09949b970dcf3da232917ca0dc86b
      <div className="flex flex-col gap-6">
        <OverviewCards />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmployeeDemographics />
          <TurnoverAnalysis />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PerformanceMetrics />
          <CompensationAnalysis />
        </div>
      </div>
    </DashboardLayout>
  )
}
