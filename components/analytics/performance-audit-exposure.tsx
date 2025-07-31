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
import { employees, assistanceRecords, auditRecords } from "@/lib/hr-analytics-data"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function PerformanceAuditExposure() {
  // Top Employees Assigned to Assistance
  const assistanceData = assistanceRecords
    .reduce(
      (acc, record) => {
        const employee = employees.find((emp) => emp.id === record.employee_id)
        if (employee) {
          const existing = acc.find((item) => item.name === employee.name)
          if (existing) {
            existing.count += 1
          } else {
            acc.push({ name: employee.name, count: 1 })
          }
        }
        return acc
      },
      [] as { name: string; count: number }[],
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Support Timeline by Satker (simplified)
  const satkerData = assistanceRecords.reduce(
    (acc, record) => {
      const existing = acc.find((item) => item.satker === record.satker)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ satker: record.satker, count: 1 })
      }
      return acc
    },
    [] as { satker: string; count: number }[],
  )

  // Employee Roles in Audit Teams
  const auditRoleData = auditRecords.reduce(
    (acc, record) => {
      const existing = acc.find((item) => item.role === record.role)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ role: record.role, count: 1 })
      }
      return acc
    },
    [] as { role: string; count: number }[],
  )

  // Most Audited Account Types
  const accountTypeData = auditRecords.reduce(
    (acc, record) => {
      const existing = acc.find((item) => item.name === record.account_type)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: record.account_type, value: 1 })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  // Audits Conducted Per Year
  const auditYearData = auditRecords
    .reduce(
      (acc, record) => {
        const existing = acc.find((item) => item.year === record.year)
        if (existing) {
          existing.count += 1
        } else {
          acc.push({ year: record.year, count: 1 })
        }
        return acc
      },
      [] as { year: number; count: number }[],
    )
    .sort((a, b) => a.year - b.year)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employees Assigned to Assistance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Employees Assigned to Assistance</CardTitle>
            <CardDescription>Employees with most support task assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assistanceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={10} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Roles in Audit Teams */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Roles in Audit Teams</CardTitle>
            <CardDescription>Distribution of audit team roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={auditRoleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Audited Account Types */}
        <Card>
          <CardHeader>
            <CardTitle>Most Audited Account Types</CardTitle>
            <CardDescription>Distribution of audit focus areas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={accountTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {accountTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Audits Conducted Per Year */}
        <Card>
          <CardHeader>
            <CardTitle>Audits Conducted Per Year</CardTitle>
            <CardDescription>Annual audit activity trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={auditYearData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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

      {/* Support Timeline by Satker */}
      <Card>
        <CardHeader>
          <CardTitle>Support Timeline by Satker</CardTitle>
          <CardDescription>Assistance assignments by organizational unit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {satkerData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium">{item.satker}</h4>
                  <p className="text-sm text-muted-foreground">Support assignments</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-xs text-muted-foreground">tasks</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
