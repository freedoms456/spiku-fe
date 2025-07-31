"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { employeeData } from "@/lib/employee-data"

const COLORS = ["#ffc658", "#8884d8", "#82ca9d", "#ff7300", "#00C49F"]

export default function TopMajorsChart() {
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const majorCounts = employeeData.reduce(
    (acc, employee) => {
      const existing = acc.find((item) => item.major === employee.major)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ major: employee.major, count: 1 })
      }
      return acc
    },
    [] as { major: string; count: number }[],
  )

  // Sort by count and take top 5
  const top5Majors = majorCounts.sort((a, b) => b.count - a.count).slice(0, 5)

  const handleBarClick = (data: any) => {
    setSelectedMajor(data.major)
    setIsModalOpen(true)
  }

  const getEmployeesByMajor = (major: string) => {
    return employeeData.filter((emp) => emp.major === major)
  }

  return (
    <>
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Top 5 Most Common Majors</CardTitle>
          <CardDescription>Most frequent educational majors among employees (Click bars for details)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top5Majors} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="major" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="count" onClick={handleBarClick} style={{ cursor: "pointer" }}>
                {top5Majors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMajor} Major Employees</DialogTitle>
            <DialogDescription>
              Detailed analysis of employees with {selectedMajor} major (
              {getEmployeesByMajor(selectedMajor || "").length} total)
            </DialogDescription>
          </DialogHeader>

          {selectedMajor && (
            <>
              {/* Summary statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Total Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getEmployeesByMajor(selectedMajor).length}</div>
                    <p className="text-xs text-muted-foreground">
                      {((getEmployeesByMajor(selectedMajor).length / employeeData.length) * 100).toFixed(1)}% of
                      workforce
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Average Age</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(
                        getEmployeesByMajor(selectedMajor).reduce((sum, emp) => sum + emp.age, 0) /
                          getEmployeesByMajor(selectedMajor).length,
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Years</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Gender Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(
                        (getEmployeesByMajor(selectedMajor).filter((emp) => emp.gender === "Male").length /
                          getEmployeesByMajor(selectedMajor).length) *
                        100
                      ).toFixed(0)}
                      % /{" "}
                      {(
                        (getEmployeesByMajor(selectedMajor).filter((emp) => emp.gender === "Female").length /
                          getEmployeesByMajor(selectedMajor).length) *
                        100
                      ).toFixed(0)}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">Male / Female</p>
                  </CardContent>
                </Card>
              </div>

              {/* Education level breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Education Level Breakdown</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(
                    getEmployeesByMajor(selectedMajor).reduce(
                      (acc, emp) => {
                        acc[emp.educationLevel] = (acc[emp.educationLevel] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).map(([level, count]) => (
                    <Badge key={level} variant="outline" className="py-1.5 px-3 text-sm">
                      {level}: {count} ({((count / getEmployeesByMajor(selectedMajor).length) * 100).toFixed(0)}%)
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Top institutions */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Top Educational Institutions</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(
                    getEmployeesByMajor(selectedMajor).reduce(
                      (acc, emp) => {
                        acc[emp.educationalInstitution] = (acc[emp.educationalInstitution] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([institution, count], index) => (
                      <div key={institution} className="flex items-center gap-2">
                        <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">
                          {institution} - {count} employees (
                          {((count / getEmployeesByMajor(selectedMajor).length) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Position distribution */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Common Positions</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(
                    getEmployeesByMajor(selectedMajor).reduce(
                      (acc, emp) => {
                        acc[emp.position] = (acc[emp.position] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([position, count], index) => (
                      <div key={position} className="flex items-center gap-2">
                        <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">
                          {position} - {count} employees (
                          {((count / getEmployeesByMajor(selectedMajor).length) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Employee list */}
              <div>
                <h3 className="text-lg font-medium mb-2">Employee List</h3>
                <div className="grid gap-4">
                  {getEmployeesByMajor(selectedMajor).map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">{employee.educationLevel}</Badge>
                          <Badge variant="secondary">Grade {employee.grade}</Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Institution: {employee.educationalInstitution}</p>
                        <p>Age: {employee.age}</p>
                        <p>Rank: {employee.rank}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
