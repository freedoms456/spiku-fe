"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { employeeData } from "@/lib/employee-data"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function EducationLevelChart() {
  const [selectedEducation, setSelectedEducation] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const educationData = employeeData.reduce(
    (acc, employee) => {
      const existing = acc.find((item) => item.name === employee.educationLevel)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: employee.educationLevel, value: 1 })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  const handlePieClick = (data: any) => {
    setSelectedEducation(data.name)
    setIsModalOpen(true)
  }

  const getEmployeesByEducation = (education: string) => {
    return employeeData.filter((emp) => emp.educationLevel === education)
  }

  return (
    <>
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Education Level Distribution</CardTitle>
          <CardDescription>Donut chart showing highest education levels (Click segments for details)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={educationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
              >
                {educationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    onClick={() => handlePieClick(entry)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEducation} Level Employees</DialogTitle>
            <DialogDescription>
              Detailed analysis of employees with {selectedEducation} education (
              {getEmployeesByEducation(selectedEducation || "").length} total)
            </DialogDescription>
          </DialogHeader>

          {selectedEducation && (
            <>
              {/* Summary statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Total Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getEmployeesByEducation(selectedEducation).length}</div>
                    <p className="text-xs text-muted-foreground">
                      {((getEmployeesByEducation(selectedEducation).length / employeeData.length) * 100).toFixed(1)}% of
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
                        getEmployeesByEducation(selectedEducation).reduce((sum, emp) => sum + emp.age, 0) /
                          getEmployeesByEducation(selectedEducation).length,
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Years</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Avg. Grade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {
                        Object.entries(
                          getEmployeesByEducation(selectedEducation).reduce(
                            (acc, emp) => {
                              acc[emp.grade] = (acc[emp.grade] || 0) + 1
                              return acc
                            },
                            {} as Record<string, number>,
                          ),
                        ).sort((a, b) => b[1] - a[1])[0][0]
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">Most common grade</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top majors */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Top Majors</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(
                    getEmployeesByEducation(selectedEducation).reduce(
                      (acc, emp) => {
                        acc[emp.major] = (acc[emp.major] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([major, count]) => (
                      <Badge key={major} variant="outline" className="py-1.5 px-3 text-sm">
                        {major}: {count} (
                        {((count / getEmployeesByEducation(selectedEducation).length) * 100).toFixed(0)}%)
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Top institutions */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Top Educational Institutions</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(
                    getEmployeesByEducation(selectedEducation).reduce(
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
                          {((count / getEmployeesByEducation(selectedEducation).length) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Employee list */}
              <div>
                <h3 className="text-lg font-medium mb-2">Employee List</h3>
                <div className="grid gap-4">
                  {getEmployeesByEducation(selectedEducation).map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">{employee.major}</Badge>
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
