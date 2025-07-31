"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, Award, Baby, BookOpen } from "lucide-react"
import { employees, certifications, trainings } from "@/lib/hr-analytics-data"
import ApexConversionFunnel from "@/components/charts/apex-conversion-funnel"

export default function SummaryPanel() {
  // Calculate metrics
  const totalEmployees = employees.length

  // Average tenure calculation
  const currentDate = new Date()
  const averageTenure =
    employees.reduce((sum, emp) => {
      const startDate = new Date(emp.start_date)
      const tenure = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      return sum + tenure
    }, 0) / employees.length

  // Certified employees
  const certifiedEmployees = new Set(certifications.map((cert) => cert.employee_id)).size

  // Average age of children
  const totalChildren = employees.reduce((sum, emp) => sum + emp.children_count, 0)
  const employeesWithChildren = employees.filter((emp) => emp.children_count > 0).length
  const averageChildrenAge = employeesWithChildren > 0 ? totalChildren / employeesWithChildren : 0

  // Total training sessions
  const totalTrainingSessions = trainings.length

  return (
    <div className="space-y-6">
      {/* Existing metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active workforce</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Tenure</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageTenure.toFixed(1)} years</div>
            <p className="text-xs text-muted-foreground">Service duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certified Employees</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certifiedEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {((certifiedEmployees / totalEmployees) * 100).toFixed(0)}% of workforce
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Children per Employee</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageChildrenAge.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Family dependents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrainingSessions}</div>
            <p className="text-xs text-muted-foreground">Completed this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Add the Conversion Funnel Chart */}
      <div className="mt-6">
        <ApexConversionFunnel />
      </div>
    </div>
  )
}
