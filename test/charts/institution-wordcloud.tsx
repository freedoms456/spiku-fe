"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { employeeData } from "@/lib/employee-data"

export default function InstitutionWordCloud() {
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const institutionCounts = employeeData.reduce(
    (acc, employee) => {
      const existing = acc.find((item) => item.institution === employee.educationalInstitution)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ institution: employee.educationalInstitution, count: 1 })
      }
      return acc
    },
    [] as { institution: string; count: number }[],
  )

  // Sort by count for better visualization
  institutionCounts.sort((a, b) => b.count - a.count)

  const getFontSize = (count: number, maxCount: number) => {
    const minSize = 12
    const maxSize = 32
    return minSize + (count / maxCount) * (maxSize - minSize)
  }

  const maxCount = Math.max(...institutionCounts.map((item) => item.count))

  const handleInstitutionClick = (institution: string) => {
    setSelectedInstitution(institution)
    setIsModalOpen(true)
  }

  const getEmployeesByInstitution = (institution: string) => {
    return employeeData.filter((emp) => emp.educationalInstitution === institution)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Educational Institutions</CardTitle>
          <CardDescription>
            Word cloud representation of educational institutions (larger text = more employees, click for details)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center items-center min-h-[300px] p-4">
            {institutionCounts.map((item, index) => (
              <span
                key={index}
                className="font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer hover:underline"
                style={{
                  fontSize: `${getFontSize(item.count, maxCount)}px`,
                  opacity: 0.7 + (item.count / maxCount) * 0.3,
                }}
                title={`${item.institution}: ${item.count} employees`}
                onClick={() => handleInstitutionClick(item.institution)}
              >
                {item.institution}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedInstitution} Alumni</DialogTitle>
            <DialogDescription>
              Detailed analysis of employees who graduated from {selectedInstitution} (
              {getEmployeesByInstitution(selectedInstitution || "").length} total)
            </DialogDescription>
          </DialogHeader>

          {selectedInstitution && (
            <>
              {/* Summary statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getEmployeesByInstitution(selectedInstitution).length}</div>
                    <p className="text-xs text-muted-foreground">
                      {((getEmployeesByInstitution(selectedInstitution).length / employeeData.length) * 100).toFixed(1)}
                      % of workforce
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
                        getEmployeesByInstitution(selectedInstitution).reduce((sum, emp) => sum + emp.age, 0) /
                          getEmployeesByInstitution(selectedInstitution).length,
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
                        (getEmployeesByInstitution(selectedInstitution).filter((emp) => emp.gender === "Male").length /
                          getEmployeesByInstitution(selectedInstitution).length) *
                        100
                      ).toFixed(0)}
                      % /{" "}
                      {(
                        (getEmployeesByInstitution(selectedInstitution).filter((emp) => emp.gender === "Female")
                          .length /
                          getEmployeesByInstitution(selectedInstitution).length) *
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
                    getEmployeesByInstitution(selectedInstitution).reduce(
                      (acc, emp) => {
                        acc[emp.educationLevel] = (acc[emp.educationLevel] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).map(([level, count]) => (
                    <Badge key={level} variant="outline" className="py-1.5 px-3 text-sm">
                      {level}: {count} (
                      {((count / getEmployeesByInstitution(selectedInstitution).length) * 100).toFixed(0)}%)
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Top majors */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Top Majors</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(
                    getEmployeesByInstitution(selectedInstitution).reduce(
                      (acc, emp) => {
                        acc[emp.major] = (acc[emp.major] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([major, count], index) => (
                      <div key={major} className="flex items-center gap-2">
                        <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">
                          {major} - {count} employees (
                          {((count / getEmployeesByInstitution(selectedInstitution).length) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Grade distribution */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Grade Distribution</h3>
                <div className="flex items-center gap-2">
                  {["I", "II", "III", "IV"].map((grade) => {
                    const count = getEmployeesByInstitution(selectedInstitution).filter(
                      (emp) => emp.grade === grade,
                    ).length
                    const percentage = (count / getEmployeesByInstitution(selectedInstitution).length) * 100
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
                  {getEmployeesByInstitution(selectedInstitution).map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">{employee.major}</Badge>
                          <Badge variant="secondary">{employee.educationLevel}</Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Grade: {employee.grade}</p>
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
