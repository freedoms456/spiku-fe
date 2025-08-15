"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Chart, ChartContainer, ChartLegend, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"

const salaryByDepartment = [
  { department: "Engineering", salary: 95000, industry: 92000 },
  { department: "Sales", salary: 85000, industry: 82000 },
  { department: "Marketing", salary: 78000, industry: 75000 },
  { department: "HR", salary: 72000, industry: 70000 },
  { department: "Finance", salary: 88000, industry: 85000 },
  { department: "Operations", salary: 76000, industry: 74000 },
]

const topEarners = [
  { id: 1, name: "John Smith", department: "Engineering", salary: "$145,000", change: "+5.2%" },
  { id: 2, name: "Sarah Johnson", department: "Sales", salary: "$138,000", change: "+4.8%" },
  { id: 3, name: "Michael Brown", department: "Finance", salary: "$132,000", change: "+3.5%" },
  { id: 4, name: "Emily Davis", department: "Engineering", salary: "$128,000", change: "+6.2%" },
  { id: 5, name: "Robert Wilson", department: "Marketing", salary: "$125,000", change: "+4.1%" },
]

export default function CompensationAnalysis() {
  const [view, setView] = useState("chart")

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Compensation Analysis</CardTitle>
          <CardDescription>Salary data by department compared to industry averages</CardDescription>
        </div>
        <Select defaultValue="chart" onValueChange={setView}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chart">Chart</SelectItem>
            <SelectItem value="table">Table</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {view === "chart" ? (
          <Chart>
            <ChartContainer>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salaryByDepartment} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Legend />
                  <Bar dataKey="salary" name="Company Avg" fill="#8884d8" />
                  <Bar dataKey="industry" name="Industry Avg" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <ChartLegend />
          </Chart>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>YoY Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topEarners.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.salary}</TableCell>
                    <TableCell className="text-green-600">{employee.change}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
