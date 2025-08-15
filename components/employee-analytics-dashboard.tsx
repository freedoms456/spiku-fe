"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Filter } from "lucide-react"
import GenderDistribution from "@/components/charts/gender-distribution"
import GradeDistribution from "@/components/charts/grade-distribution"
import AgeHistogram from "@/components/charts/age-histogram"
import EducationLevelChart from "@/components/charts/education-level-chart"
import TopMajorsChart from "@/components/charts/top-majors-chart"
import AgeChildrenScatter from "@/components/charts/age-children-scatter"
import InstitutionWordCloud from "@/components/charts/institution-wordcloud"
import EmployeeDataTable from "@/components/employee-data-table"
import { employeeData } from "@/lib/employee-data"

export default function EmployeeAnalyticsDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("all")
  const [selectedEducation, setSelectedEducation] = useState("all")

  const totalEmployees = employeeData.length
  const avgAge = Math.round(employeeData.reduce((sum, emp) => sum + emp.age, 0) / totalEmployees)
  const maleCount = employeeData.filter((emp) => emp.gender === "Male").length
  const femaleCount = employeeData.filter((emp) => emp.gender === "Female").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">SPIKU</h1>
              <p className="text-muted-foreground">Sistem Pelaporan Informasi Kepegawaian Universitas</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <Badge variant="secondary" className="mt-1">
                Active
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgAge} years</div>
              <p className="text-xs text-muted-foreground">Company average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gender Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((maleCount / totalEmployees) * 100)}% / {Math.round((femaleCount / totalEmployees) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Male / Female</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Education Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">Different levels</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="data-table">Employee Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GenderDistribution />
              <GradeDistribution />
              <AgeHistogram />
              <EducationLevelChart />
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopMajorsChart />
              <AgeChildrenScatter />
              <div className="lg:col-span-2">
                <InstitutionWordCloud />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data-table" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="I">Grade I</SelectItem>
                  <SelectItem value="II">Grade II</SelectItem>
                  <SelectItem value="III">Grade III</SelectItem>
                  <SelectItem value="IV">Grade IV</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedEducation} onValueChange={setSelectedEducation}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Education" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Education</SelectItem>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Bachelor">Bachelor</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <EmployeeDataTable
              searchTerm={searchTerm}
              selectedGrade={selectedGrade}
              selectedEducation={selectedEducation}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
