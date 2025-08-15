"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { employeeData } from "@/lib/employee-data"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

export default function GenderDistribution() {
  const [selectedGender, setSelectedGender] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const genderData = employeeData.reduce(
    (acc, employee) => {
      const existing = acc.find((item) => item.name === employee.gender)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: employee.gender, value: 1 })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  const handlePieClick = (data: any) => {
    setSelectedGender(data.name)
    setIsModalOpen(true)
  }

  const getEmployeesByGender = (gender: string) => {
    return employeeData.filter((emp) => emp.gender === gender)
  }

  return (
    <>
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Gender Distribution</CardTitle>
          <CardDescription>Employee distribution by gender (Click segments for details)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
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
            <DialogTitle>{selectedGender} Employees</DialogTitle>
            <DialogDescription>
              Detailed analysis of {selectedGender?.toLowerCase()} employees (
              {getEmployeesByGender(selectedGender || "").length} total)
            </DialogDescription>
          </DialogHeader>

          {selectedGender && (
            <>
              {/* Summary statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Total Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getEmployeesByGender(selectedGender).length}</div>
                    <p className="text-xs text-muted-foreground">
                      {((getEmployeesByGender(selectedGender).length / employeeData.length) * 100).toFixed(1)}% of
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
                        getEmployeesByGender(selectedGender).reduce((sum, emp) => sum + emp.age, 0) /
                          getEmployeesByGender(selectedGender).length,
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Years</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Education</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {
                        Object.entries(
                          getEmployeesByGender(selectedGender).reduce(
                            (acc, emp) => {
                              acc[emp.educationLevel] = (acc[emp.educationLevel] || 0) + 1
                              return acc
                            },
                            {} as Record<string, number>,
                          ),
                        ).sort((a, b) => b[1] - a[1])[0][0]
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">Most common degree</p>
                  </CardContent>
                </Card>
              </div>

              {/* Distribution by grade */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Grade Distribution</h3>
                <div className="flex items-center gap-2">
                  {["I", "II", "III", "IV"].map((grade) => {
                    const count = getEmployeesByGender(selectedGender).filter((emp) => emp.grade === grade).length
                    const percentage = (count / getEmployeesByGender(selectedGender).length) * 100
                    return (
                      <div key={grade} className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Grade {grade}</span>
                          <span>{count}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Employee list */}
              <div>
                <h3 className="text-lg font-medium mb-2">Employee List</h3>
                <div className="grid gap-4">
                  {getEmployeesByGender(selectedGender).map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">Grade {employee.grade}</Badge>
                          <Badge variant="secondary">{employee.educationLevel}</Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Age: {employee.age}</p>
                        <p>{employee.maritalStatus}</p>
                        <p>Children: {employee.numberOfChildren}</p>
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
