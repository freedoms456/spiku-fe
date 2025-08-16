"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { employeeData } from "@/lib/employee-data"

export default function AgeChildrenScatter() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const scatterData = employeeData.map((employee) => ({
    age: employee.age,
    children: employee.numberOfChildren,
    name: employee.name,
    employee: employee,
  }))sdsdds

  const handleScatterClick = (data: any) => {
    if (data && data.payload) {
      setSelectedEmployee(data.payload.employee)
      setIsModalOpen(true)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Age: {data.age} years</p>
          <p className="text-sm">Children: {data.children}</p>
          <p className="text-xs text-muted-foreground">Click for details</p>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Age vs Number of Children</CardTitle>
          <CardDescription>
            Scatter plot showing correlation between age and number of children (Click points for details)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={scatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="age" name="Age" unit=" years" />
              <YAxis type="number" dataKey="children" name="Children" unit=" kids" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                name="Employees"
                data={scatterData}
                fill="#8884d8"
                onClick={handleScatterClick}
                style={{ cursor: "pointer" }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>Comprehensive profile and analysis for selected employee</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Basic info */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{selectedEmployee.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Position</p>
                        <p className="font-medium">{selectedEmployee.position}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rank</p>
                        <p className="font-medium">{selectedEmployee.rank}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Grade</p>
                        <p className="font-medium">{selectedEmployee.grade}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Job Type</p>
                        <p className="font-medium">{selectedEmployee.jobType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal info */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-base mb-2">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Age</p>
                        <p className="font-medium">{selectedEmployee.age} years</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gender</p>
                        <p className="font-medium">{selectedEmployee.gender}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Marital Status</p>
                        <p className="font-medium">{selectedEmployee.maritalStatus}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Children</p>
                        <p className="font-medium">{selectedEmployee.numberOfChildren}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Religion</p>
                        <p className="font-medium">{selectedEmployee.religion}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Place of Birth</p>
                        <p className="font-medium">{selectedEmployee.placeOfBirth}</p>
                      </div>
                      {selectedEmployee.spouseName && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Spouse</p>
                          <p className="font-medium">{selectedEmployee.spouseName}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-base mb-2">Contact & ID</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Phone Number</p>
                        <p className="font-medium">{selectedEmployee.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Employee ID (NIP)</p>
                        <p className="font-medium">{selectedEmployee.nip}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">National ID (NIK)</p>
                        <p className="font-medium">{selectedEmployee.nik}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Education info */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-base mb-2">Educational Background</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Education Level</p>
                        <p className="font-medium">{selectedEmployee.educationLevel}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Major</p>
                        <p className="font-medium">{selectedEmployee.major}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Institution</p>
                        <p className="font-medium">{selectedEmployee.educationalInstitution}</p>
                      </div>
                    </div>
                  </div>

                  {/* Comparison to averages */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-base mb-2">Comparison to Averages</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Age vs. Company Average</span>
                          <span className="font-medium">
                            {selectedEmployee.age} vs.{" "}
                            {Math.round(employeeData.reduce((sum, emp) => sum + emp.age, 0) / employeeData.length)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (selectedEmployee.age / (Math.round(employeeData.reduce((sum, emp) => sum + emp.age, 0) / employeeData.length) * 1.5)) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Children vs. Average</span>
                          <span className="font-medium">
                            {selectedEmployee.numberOfChildren} vs.{" "}
                            {(
                              employeeData.reduce((sum, emp) => sum + emp.numberOfChildren, 0) / employeeData.length
                            ).toFixed(1)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (selectedEmployee.numberOfChildren / ((employeeData.reduce((sum, emp) => sum + emp.numberOfChildren, 0) / employeeData.length) * 2)) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Similar employees */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-base mb-2">Similar Employees</h3>
                    <div className="space-y-2 text-sm">
                      {employeeData
                        .filter(
                          (emp) =>
                            emp.id !== selectedEmployee.id &&
                            (emp.grade === selectedEmployee.grade ||
                              emp.educationLevel === selectedEmployee.educationLevel ||
                              emp.major === selectedEmployee.major),
                        )
                        .slice(0, 3)
                        .map((emp) => (
                          <div key={emp.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                            <div>
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.position}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {emp.grade === selectedEmployee.grade
                                ? "Same Grade"
                                : emp.major === selectedEmployee.major
                                  ? "Same Major"
                                  : "Same Education"}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
