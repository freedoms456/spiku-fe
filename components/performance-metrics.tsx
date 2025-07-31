"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chart, ChartContainer, ChartLegend, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts"

const performanceDistribution = [
  { rating: "Exceptional", count: 120 },
  { rating: "Exceeds", count: 280 },
  { rating: "Meets", count: 580 },
  { rating: "Needs Improvement", count: 180 },
  { rating: "Unsatisfactory", count: 88 },
]

const departmentPerformance = [
  {
    department: "Engineering",
    "Goal Achievement": 85,
    Quality: 90,
    Teamwork: 75,
    Innovation: 95,
    Leadership: 80,
  },
  {
    department: "Sales",
    "Goal Achievement": 95,
    Quality: 80,
    Teamwork: 85,
    Innovation: 70,
    Leadership: 90,
  },
  {
    department: "Marketing",
    "Goal Achievement": 80,
    Quality: 85,
    Teamwork: 90,
    Innovation: 85,
    Leadership: 75,
  },
  {
    department: "HR",
    "Goal Achievement": 75,
    Quality: 90,
    Teamwork: 95,
    Innovation: 70,
    Leadership: 85,
  },
  {
    department: "Finance",
    "Goal Achievement": 90,
    Quality: 95,
    Teamwork: 70,
    Innovation: 65,
    Leadership: 80,
  },
]

const competencyData = [
  { subject: "Goal Achievement", A: 85, fullMark: 100 },
  { subject: "Quality", A: 88, fullMark: 100 },
  { subject: "Teamwork", A: 82, fullMark: 100 },
  { subject: "Innovation", A: 79, fullMark: 100 },
  { subject: "Leadership", A: 84, fullMark: 100 },
  { subject: "Communication", A: 86, fullMark: 100 },
]

export default function PerformanceMetrics() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Analysis of employee performance ratings and competencies</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="distribution">Rating Distribution</TabsTrigger>
            <TabsTrigger value="competencies">Competencies</TabsTrigger>
          </TabsList>
          <TabsContent value="distribution" className="h-[300px]">
            <Chart>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartLegend />
            </Chart>
          </TabsContent>
          <TabsContent value="competencies" className="h-[300px]">
            <Chart>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Company Average" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
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
