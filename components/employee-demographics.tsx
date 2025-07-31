"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chart, ChartContainer, ChartLegend, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

const ageData = [
  { name: "18-24", value: 120 },
  { name: "25-34", value: 380 },
  { name: "35-44", value: 420 },
  { name: "45-54", value: 250 },
  { name: "55+", value: 78 },
]

const genderData = [
  { name: "Male", value: 620 },
  { name: "Female", value: 580 },
  { name: "Non-binary", value: 48 },
]

const departmentData = [
  { name: "Engineering", value: 320 },
  { name: "Sales", value: 280 },
  { name: "Marketing", value: 160 },
  { name: "HR", value: 80 },
  { name: "Finance", value: 120 },
  { name: "Operations", value: 180 },
  { name: "Other", value: 108 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658"]

export default function EmployeeDemographics() {
  const [activeTab, setActiveTab] = useState("age")

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Employee Demographics</CardTitle>
        <CardDescription>Breakdown of employee population by different categories</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="age" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="age">Age</TabsTrigger>
            <TabsTrigger value="gender">Gender</TabsTrigger>
            <TabsTrigger value="department">Department</TabsTrigger>
          </TabsList>
          <TabsContent value="age" className="h-[300px]">
            <Chart>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartLegend />
            </Chart>
          </TabsContent>
          <TabsContent value="gender" className="h-[300px]">
            <Chart>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartLegend />
            </Chart>
          </TabsContent>
          <TabsContent value="department" className="h-[300px]">
            <Chart>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartLegend />
            </Chart>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
