"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { employees, certifications, trainings } from "@/lib/hr-analytics-data"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function EducationCompetency() {
  // Educational Level Distribution
  const educationData = employees.reduce(
    (acc, emp) => {
      const existing = acc.find((item) => item.level === emp.education_level)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ level: emp.education_level, count: 1 })
      }
      return acc
    },
    [] as { level: string; count: number }[],
  )

  // Field of Study Distribution
  const studyFieldData = employees.reduce(
    (acc, emp) => {
      const existing = acc.find((item) => item.name === emp.program_study)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: emp.program_study, value: 1 })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  // Certifications by Skill Area
  const skillAreaData = certifications.reduce(
    (acc, cert) => {
      const existing = acc.find((item) => item.skill === cert.skill_type)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ skill: cert.skill_type, count: 1 })
      }
      return acc
    },
    [] as { skill: string; count: number }[],
  )

  // Training Frequency Over Time (simplified - by completion year)
  const trainingTimeData = trainings
    .reduce(
      (acc, training) => {
        const year = new Date(training.completion_date).getFullYear()
        const existing = acc.find((item) => item.year === year)
        if (existing) {
          existing.count += 1
        } else {
          acc.push({ year, count: 1 })
        }
        return acc
      },
      [] as { year: number; count: number }[],
    )
    .sort((a, b) => a.year - b.year)

  // Skill-to-Job Relevance Matrix (simplified)
  const skillJobRelevance = certifications.map((cert) => {
    const employee = employees.find((emp) => emp.id === cert.employee_id)
    return {
      skill: cert.skill_type,
      job: employee?.jabatan || "Unknown",
      relevant: cert.skill_type.toLowerCase().includes(employee?.program_study.toLowerCase() || "") ? "High" : "Medium",
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Educational Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Educational Level Distribution</CardTitle>
            <CardDescription>Distribution of employees by highest education level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={educationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Field of Study Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Field of Study Distribution</CardTitle>
            <CardDescription>Distribution by academic program/major</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studyFieldData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {studyFieldData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certifications by Skill Area */}
        <Card>
          <CardHeader>
            <CardTitle>Certifications by Skill Area</CardTitle>
            <CardDescription>Number of certifications per skill category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillAreaData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="skill" angle={-45} textAnchor="end" height={100} fontSize={10} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Training Frequency Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Training Frequency Over Time</CardTitle>
            <CardDescription>Number of training sessions completed by year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trainingTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Skill-to-Job Relevance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Skill-to-Job Relevance Matrix</CardTitle>
          <CardDescription>Alignment between employee skills and current positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillJobRelevance.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{item.skill}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.relevant === "High" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.relevant}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.job}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
