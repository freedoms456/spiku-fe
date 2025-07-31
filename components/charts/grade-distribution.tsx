"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { employeeData } from "@/lib/employee-data"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"]

export default function GradeDistribution() {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const gradeData = employeeData.reduce(
    (acc, employee) => {
      const existing = acc.find((item) => item.grade === employee.grade)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ grade: employee.grade, count: 1 })
      }
      return acc
    },
    [] as { grade: string; count: number }[],
  )

  // Sort by grade
  gradeData.sort((a, b) => a.grade.localeCompare(b.grade))

  const handleBarClick = (data: any) => {
    setSelectedGrade(data.grade)
    setIsModalOpen(true)
  }

  const getEmployeesByGrade = (grade: string) => {
    return employeeData.filter((emp) => emp.grade === grade)
  }

  return (
    <>
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Employees by Grade (Golongan)</CardTitle>
          <CardDescription>Number of employees in each grade level (Click bars for details)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" onClick={handleBarClick} style={{ cursor: "pointer" }}>
                {gradeData.map((entry, index) => (
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
            <DialogTitle>Grade {selectedGrade} Employees</DialogTitle>
            <DialogDescription>
              Detailed analysis of employees in Grade {selectedGrade} ({getEmployeesByGrade(selectedGrade || "").length}{" "}
              total)
            </DialogDescription>
          </DialogHeader>

          {selectedGrade && (
            <>
              {/* Summary statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Total Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getEmployeesByGrade(selectedGrade).length}</div>
                    <p className="text-xs text-muted-foreground">
                      {((getEmployeesByGrade(selectedGrade).length / employeeData.length) * 100).toFixed(1)}% of
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
                        getEmployeesByGrade(selectedGrade).reduce((sum, emp) => sum + emp.age, 0) /
                          getEmployeesByGrade(selectedGrade).length,
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Years</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Avg. Children</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(
                        getEmployeesByGrade(selectedGrade).reduce((sum, emp) => sum + emp.numberOfChildren, 0) /
                        getEmployeesByGrade(selectedGrade).length
                      ).toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">Per employee</p>
                  </CardContent>
                </Card>
              </div>

              {/* Gender distribution */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Gender Distribution</h3>
                <div className="flex items-center gap-4">
                  {["Male", "Female"].map((gender) => {
                    const count = getEmployeesByGrade(selectedGrade).filter((emp) => emp.gender === gender).length
                    const percentage = (count / getEmployeesByGrade(selectedGrade).length) * 100
                    return (
                      <div key={gender} className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{gender}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${gender === "Male" ? "bg-blue-500" : "bg-pink-500"}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Education level breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Education Level Breakdown</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(
                    getEmployeesByGrade(selectedGrade).reduce(
                      (acc, emp) => {
                        acc[emp.educationLevel] = (acc[emp.educationLevel] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).map(([level, count]) => (
                    <Badge key={level} variant="outline" className="py-1.5 px-3 text-sm">
                      {level}: {count} ({((count / getEmployeesByGrade(selectedGrade).length) * 100).toFixed(0)}%)
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Employee list */}
              <div>
                <h3 className="text-lg font-medium mb-2">Employee List</h3>
                <div className="grid gap-4">
                  {getEmployeesByGrade(selectedGrade).map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {employee.position} - {employee.rank}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline">{employee.jobType}</Badge>
                          <Badge variant="secondary">{employee.educationLevel}</Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Age: {employee.age}</p>
                        <p>Major: {employee.major}</p>
                        <p>Institution: {employee.educationalInstitution}</p>
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
