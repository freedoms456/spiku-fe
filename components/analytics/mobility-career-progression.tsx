"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { employees, jobHistory } from "@/lib/hr-analytics-data"

export default function MobilityCareerProgression() {
  // Average Tenure per Role
  const tenureData = employees
    .map((emp) => {
      const startDate = new Date(emp.start_date)
      const currentDate = new Date()
      const tenure = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      return {
        jabatan: emp.jabatan,
        tenure: tenure,
      }
    })
    .reduce(
      (acc, item) => {
        const existing = acc.find((x) => x.jabatan === item.jabatan)
        if (existing) {
          existing.totalTenure += item.tenure
          existing.count += 1
          existing.avgTenure = existing.totalTenure / existing.count
        } else {
          acc.push({
            jabatan: item.jabatan,
            totalTenure: item.tenure,
            count: 1,
            avgTenure: item.tenure,
          })
        }
        return acc
      },
      [] as { jabatan: string; totalTenure: number; count: number; avgTenure: number }[],
    )

  // Employee Transfer Timeline (simplified)
  const transferData = jobHistory.map((job) => {
    const employee = employees.find((emp) => emp.id === job.employee_id)
    const startDate = new Date(job.start_date)
    const endDate = job.end_date ? new Date(job.end_date) : new Date()
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)

    return {
      employeeName: employee?.name || "Unknown",
      position: job.position,
      unit: job.unit,
      startYear: startDate.getFullYear(),
      duration: duration,
      current: !job.end_date,
    }
  })

  // Promotion Readiness (employees with >5 years in same role)
  const promotionReadiness = employees
    .filter((emp) => {
      const startDate = new Date(emp.start_date)
      const currentDate = new Date()
      const tenure = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      return tenure > 5
    })
    .map((emp) => {
      const startDate = new Date(emp.start_date)
      const currentDate = new Date()
      const tenure = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      return {
        ...emp,
        tenure: tenure,
      }
    })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Tenure per Role */}
        <Card>
          <CardHeader>
            <CardTitle>Average Tenure per Role</CardTitle>
            <CardDescription>Average years of service by position</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tenureData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jabatan" angle={-45} textAnchor="end" height={100} fontSize={10} />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} years`, "Average Tenure"]} />
                <Bar dataKey="avgTenure" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Transfer Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Transfer Timeline</CardTitle>
            <CardDescription>Career progression and position changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {transferData.map((transfer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{transfer.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {transfer.position} - {transfer.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">Started: {transfer.startYear}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={transfer.current ? "default" : "secondary"}>
                      {transfer.current ? "Current" : "Previous"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{transfer.duration.toFixed(1)} years</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotion Readiness Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {"Promotion Readiness List"}
          </CardTitle>
          <CardDescription>Employees with tenure &gt; 5 years in the same role</CardDescription>
        </CardHeader>
        <CardContent>
          {promotionReadiness.length > 0 ? (
            <div className="space-y-3">
              {promotionReadiness.map((emp) => (
                <Alert key={emp.id}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{emp.name}</strong> - {emp.jabatan}
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {emp.unit} • {emp.tenure.toFixed(1)} years in current role
                        </span>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        Golongan {emp.golongan}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No employees currently eligible for promotion review.</p>
          )}
        </CardContent>
      </Card>

      {/* Job Promotion Flow Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Job Promotion Flow Summary</CardTitle>
          <CardDescription>Career progression patterns within the organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Previous Position</TableHead>
                <TableHead>Current Position</TableHead>
                <TableHead>Promotion Year</TableHead>
                <TableHead>Rank Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobHistory
                .filter((job) => !job.end_date) // Current positions
                .map((currentJob) => {
                  const employee = employees.find((emp) => emp.id === currentJob.employee_id)
                  const previousJob = jobHistory.find(
                    (job) => job.employee_id === currentJob.employee_id && job.id !== currentJob.id && job.end_date,
                  )

                  if (!previousJob || !employee) return null

                  return (
                    <TableRow key={currentJob.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{previousJob.position}</TableCell>
                      <TableCell>{currentJob.position}</TableCell>
                      <TableCell>{new Date(currentJob.start_date).getFullYear()}</TableCell>
                      <TableCell>
                        <Badge variant={previousJob.rank < currentJob.rank ? "default" : "secondary"}>
                          {previousJob.rank} → {currentJob.rank}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
                .filter(Boolean)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
