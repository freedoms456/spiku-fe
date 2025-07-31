"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { employees, certifications, auditRecords, trainings } from "@/lib/hr-analytics-data"

export default function AdvancedInsights() {
  // Family Dependents vs Job Level
  const familyJobData = employees.map((emp) => ({
    children: emp.children_count,
    jobLevel: emp.golongan === "IV" ? 4 : emp.golongan === "III" ? 3 : emp.golongan === "II" ? 2 : 1,
    name: emp.name,
    position: emp.jabatan,
  }))

  // Education vs Training Performance (Bubble Chart data)
  const educationTrainingData = employees.map((emp) => {
    const empTrainings = trainings.filter((t) => t.employee_id === emp.id)
    const totalTrainingHours = empTrainings.reduce((sum, t) => sum + t.duration_hours, 0)

    return {
      educationLevel: emp.education_level === "S3" ? 3 : emp.education_level === "S2" ? 2 : 1,
      trainingHours: totalTrainingHours,
      trainingCount: empTrainings.length,
      name: emp.name,
    }
  })

  // Employees with Both Certifications & Audit Experience
  const crossQualifiedEmployees = employees
    .filter((emp) => {
      const hasCertification = certifications.some((cert) => cert.employee_id === emp.id)
      const hasAuditExperience = auditRecords.some((audit) => audit.employee_id === emp.id)
      return hasCertification && hasAuditExperience
    })
    .map((emp) => {
      const empCertifications = certifications.filter((cert) => cert.employee_id === emp.id)
      const empAudits = auditRecords.filter((audit) => audit.employee_id === emp.id)

      return {
        ...emp,
        certificationCount: empCertifications.length,
        auditCount: empAudits.length,
        certificationTypes: empCertifications.map((c) => c.skill_type),
        auditRoles: [...new Set(empAudits.map((a) => a.role))],
      }
    })

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Position: {data.position}</p>
          <p className="text-sm">Children: {data.children}</p>
          <p className="text-sm">Job Level: {data.jobLevel}</p>
        </div>
      )
    }
    return null
  }

  const TrainingTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            Education Level: {data.educationLevel === 3 ? "S3" : data.educationLevel === 2 ? "S2" : "S1"}
          </p>
          <p className="text-sm">Training Hours: {data.trainingHours}</p>
          <p className="text-sm">Training Count: {data.trainingCount}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Family Dependents vs Job Level */}
        <Card>
          <CardHeader>
            <CardTitle>Family Dependents vs Job Level</CardTitle>
            <CardDescription>Correlation between number of children and job level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={familyJobData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="children" name="Children" unit=" kids" domain={[0, "dataMax + 1"]} />
                <YAxis
                  type="number"
                  dataKey="jobLevel"
                  name="Job Level"
                  domain={[0, 5]}
                  tickFormatter={(value) => `Level ${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Employees" data={familyJobData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Education vs Training Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Education vs Training Performance</CardTitle>
            <CardDescription>Relationship between education level and training completion</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={educationTrainingData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis
                  type="number"
                  dataKey="educationLevel"
                  name="Education Level"
                  domain={[0, 4]}
                  tickFormatter={(value) => (value === 3 ? "S3" : value === 2 ? "S2" : "S1")}
                />
                <YAxis type="number" dataKey="trainingHours" name="Training Hours" unit=" hrs" />
                <Tooltip content={<TrainingTooltip />} />
                <Scatter name="Training Performance" data={educationTrainingData} fill="#00C49F" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Employees with Both Certifications & Audit Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Employees with Cross-Qualifications</CardTitle>
          <CardDescription>Staff with both professional certifications and audit experience</CardDescription>
        </CardHeader>
        <CardContent>
          {crossQualifiedEmployees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Certifications</TableHead>
                  <TableHead>Audit Roles</TableHead>
                  <TableHead>Golongan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crossQualifiedEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.jabatan}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={emp.unit}>
                      {emp.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {emp.certificationTypes.slice(0, 2).map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {emp.certificationTypes.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{emp.certificationTypes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {emp.auditRoles.map((role, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{emp.golongan}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No employees found with both certifications and audit experience.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cross-Qualified Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crossQualifiedEmployees.length}</div>
            <p className="text-xs text-muted-foreground">
              {((crossQualifiedEmployees.length / employees.length) * 100).toFixed(0)}% of workforce
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Family Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(employees.reduce((sum, emp) => sum + emp.children_count, 0) / employees.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Children per employee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Training Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((trainings.length / employees.length) * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Training per employee</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
