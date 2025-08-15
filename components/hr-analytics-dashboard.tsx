"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, Award, TrendingUp, Clock, Target, BarChart } from "lucide-react"
import SummaryPanel from "@/components/analytics/summary-panel"
import EmployeeComposition from "@/components/analytics/employee-composition"
import EducationCompetency from "@/components/analytics/education-competency"
import MobilityCareerProgression from "@/components/analytics/mobility-career-progression"
import PerformanceAuditExposure from "@/components/analytics/performance-audit-exposure"
import AdvancedInsights from "@/components/analytics/advanced-insights"
import ApexConversionFunnel from "@/components/charts/apex-conversion-funnel"

export default function HRAnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">HR Analytics Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive Human Resources Analytics & Insights</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <Clock className="h-3 w-3 mr-1" />
                Real-time Data
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Target className="h-3 w-3 mr-1" />
                Updated Today
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Summary Panel - Always visible at top */}
        <div className="mb-8">
          <SummaryPanel />
        </div>

        {/* Main Analytics Sections */}
        <Tabs defaultValue="composition" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="composition" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Composition
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="mobility" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Mobility
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <ApexConversionFunnel />
            </div>
          </TabsContent>

          <TabsContent value="composition" className="space-y-6">
            <EmployeeComposition />
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <EducationCompetency />
          </TabsContent>

          <TabsContent value="mobility" className="space-y-6">
            <MobilityCareerProgression />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceAuditExposure />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <AdvancedInsights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
