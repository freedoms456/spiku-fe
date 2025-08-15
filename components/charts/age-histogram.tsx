"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { employeeData } from "@/lib/employee-data"

const COLORS = ["#82ca9d", "#8884d8", "#ffc658", "#ff7300", "#00C49F", "#FFBB28"]

export default function AgeHistogram() {
  const [selectedAgeRange, setSelectedAgeRange] = useState<{ range: string; min: number; max: number } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Create age ranges
  const ageRanges = [
    { range: "20-25", min: 20, max: 25 },
    { range: "26-30", min: 26, max: 30 },
    { range: "31-35", min: 31, max: 35 },
    { range: "36-40", min: 36, max: 40 },
    { range: "41-45", min: 41, max: 45 },
    { range: "46-50", min: 46, max: 50 },
  ]

  const ageData = ageRanges.map((range) => ({
    ...range,
    count: employeeData.filter((emp) => emp.age >= range.min && emp.age <= range.max).length,
  }))

  const handleBarClick = (data: any) => {
    setSelectedAgeRange(data)
    setIsModalOpen(true)
  }

  const getEmployeesByAgeRange = (min: number, max: number) => {
    return employeeData.filter((emp) => emp.age >= min && emp.age <= max)
  }

  return (
    <>
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
          <CardDescription>Histogram showing employee age ranges (Click bars for details)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" onClick={handleBarClick} style={{ cursor: "pointer" }}>
                {ageData.map((entry, index) => (
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
            <DialogTitle>Age Range {selectedAgeRange?.range} Employees</DialogTitle>
            <DialogDescription>
              Detailed analysis of employees aged {selectedAgeRange?.range} years (
              {selectedAgeRange ? getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).length : 0} total)
            </DialogDescription>
          </DialogHeader>

          {selectedAgeRange && (
            <>
              {/* Summary statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Total Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).length /
                          employeeData.length) *
                        100
                      ).toFixed(1)}
                      % of workforce
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Avg. Children</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(
                        getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).reduce(
                          (sum, emp) => sum + emp.numberOfChildren,
                          0,
                        ) / getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).length
                      ).toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">Per employee</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Marital Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(
                        (getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).filter(
                          (emp) => emp.maritalStatus === "Married",
                        ).length /
                          getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).length) *
                        100
                      ).toFixed(0)}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">Married</p>
                  </CardContent>
                </Card>
              </div>

              {/* Grade distribution */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Grade Distribution</h3>
                <div className="flex items-center gap-2">
                  {["I", "II", "III", "IV"].map((grade) => {
                    const count = getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).filter(
                      (emp) => emp.grade === grade,
                    ).length
                    const percentage =
                      (count / getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).length) * 100
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

              {/* Gender breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Gender Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  {["Male", "Female"].map((gender) => {
                    const count = getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).filter(
                      (emp) => emp.gender === gender,
                    ).length
                    const percentage =
                      (count / getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).length) * 100
                    return (
                      <div key={gender} className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${gender === "Male" ? "bg-blue-500" : "bg-pink-500"}`}
                        ></div>
                        <span>
                          {gender}: {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Employee list */}
              <div>
                <h3 className="text-lg font-medium mb-2">Employee List</h3>
                <div className="grid gap-4">
                  {getEmployeesByAgeRange(selectedAgeRange.min, selectedAgeRange.max).map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">Age {employee.age}</Badge>
                          <Badge variant="secondary">Grade {employee.grade}</Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Born: {employee.placeOfBirth}</p>
                        <p>Status: {employee.maritalStatus}</p>
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
