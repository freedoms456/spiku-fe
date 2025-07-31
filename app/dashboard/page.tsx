import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard-layout"
import OverviewCards from "@/components/overview-cards"
import EmployeeDemographics from "@/components/employee-demographics"
import TurnoverAnalysis from "@/components/turnover-analysis"
import PerformanceMetrics from "@/components/performance-metrics"
import CompensationAnalysis from "@/components/compensation-analysis"

export const metadata: Metadata = {
  title: "HR Analytics Dashboard",
  description: "Comprehensive HR analytics dashboard with key metrics and insights",
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
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
