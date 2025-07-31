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
  Legend,
} from "recharts"
import { employees } from "@/lib/hr-analytics-data"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

export default function EmployeeComposition() {
  // Employee Distribution by Division
  const divisionData = employees.reduce(
    (acc, emp) => {
      const existing = acc.find((item) => item.division === emp.unit)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ division: emp.unit, count: 1 })
      }
      return acc
    },
    [] as { division: string; count: number }[],
  )

  // Job Titles by Rank Group (Stacked Bar Chart)
  const jobTitleRankData = employees.reduce((acc, emp) => {
    const existing = acc.find((item) => item.jabatan === emp.jabatan)
    if (existing) {
      existing[`golongan_${emp.golongan}`] = (existing[`golongan_${emp.golongan}`] || 0) + 1
    } else {
      acc.push({
        jabatan: emp.jabatan,
        [`golongan_${emp.golongan}`]: 1,
        golongan_I: emp.golongan === "I" ? 1 : 0,
        golongan_II: emp.golongan === "II" ? 1 : 0,
        golongan_III: emp.golongan === "III" ? 1 : 0,
        golongan_IV: emp.golongan === "IV" ? 1 : 0,
      })
    }
    return acc
  }, [] as any[])

  // Gender Distribution
  const genderData = employees.reduce(
    (acc, emp) => {
      const existing = acc.find((item) => item.name === emp.jenis_kelamin)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: emp.jenis_kelamin, value: 1 })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  // Rank vs Division Mapping (simplified heatmap data)
  const rankDivisionData = employees.reduce(
    (acc, emp) => {
      const key = `${emp.unit}-${emp.golongan}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Distribution by Division */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Distribution by Division</CardTitle>
            <CardDescription>Number of employees per organizational unit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={divisionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="division" angle={-45} textAnchor="end" height={100} fontSize={10} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Employee composition by gender</CardDescription>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Titles by Rank Group */}
        <Card>
          <CardHeader>
            <CardTitle>Job Titles by Rank Group</CardTitle>
            <CardDescription>Distribution of positions across different ranks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobTitleRankData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jabatan" angle={-45} textAnchor="end" height={100} fontSize={10} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="golongan_I" stackId="a" fill="#FF8042" name="Golongan I" />
                <Bar dataKey="golongan_II" stackId="a" fill="#FFBB28" name="Golongan II" />
                <Bar dataKey="golongan_III" stackId="a" fill="#00C49F" name="Golongan III" />
                <Bar dataKey="golongan_IV" stackId="a" fill="#0088FE" name="Golongan IV" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rank vs Division Mapping */}
        <Card>
          <CardHeader>
            <CardTitle>Rank vs Division Summary</CardTitle>
            <CardDescription>Distribution overview across units and ranks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(rankDivisionData)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([key, count]) => {
                  const [unit, rank] = key.split("-")
                  return (
                    <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{unit}</p>
                        <p className="text-xs text-muted-foreground">Golongan {rank}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{count}</p>
                        <p className="text-xs text-muted-foreground">employees</p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
