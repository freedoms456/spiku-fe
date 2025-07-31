"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Chart, ChartContainer, ChartLegend, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"

const turnoverData = [
  { month: "Jan", rate: 2.8, industry: 3.2 },
  { month: "Feb", rate: 3.1, industry: 3.3 },
  { month: "Mar", rate: 2.9, industry: 3.4 },
  { month: "Apr", rate: 3.2, industry: 3.3 },
  { month: "May", rate: 3.5, industry: 3.2 },
  { month: "Jun", rate: 3.8, industry: 3.3 },
  { month: "Jul", rate: 3.6, industry: 3.4 },
  { month: "Aug", rate: 3.2, industry: 3.5 },
  { month: "Sep", rate: 3.0, industry: 3.4 },
  { month: "Oct", rate: 2.7, industry: 3.3 },
  { month: "Nov", rate: 2.5, industry: 3.2 },
  { month: "Dec", rate: 2.3, industry: 3.1 },
]

export default function TurnoverAnalysis() {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Turnover Analysis</CardTitle>
          <CardDescription>Monthly turnover rate compared to industry average</CardDescription>
        </div>
        <Select defaultValue="year">
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarter">Quarter</SelectItem>
            <SelectItem value="year">Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Chart>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={turnoverData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#8884d8" name="Company Rate" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="industry" stroke="#82ca9d" name="Industry Avg" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          <ChartLegend />
        </Chart>
      </CardContent>
    </Card>
  )
}
