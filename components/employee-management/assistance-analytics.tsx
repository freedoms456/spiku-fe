"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Clock, TrendingUp, Users, AlertTriangle, BarChart3, Calendar, Building, CheckCircle, Activity } from "lucide-react"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface AssistanceAnalyticsProps {
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

export default function AssistanceAnalytics({
  filteredAccounts: propFilteredAccounts = [],
  onFilterChange,
}: AssistanceAnalyticsProps) {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  // Helper function to calculate days difference
  const daysDifference = (startDate: string, endDate?: string) => {
    if (!startDate) return 0
    const end = endDate ? new Date(endDate.split("-").reverse().join("-")) : new Date()
    const [day, month, year] = startDate.split("-").map(Number)
    const start = new Date(year, month - 1, day)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Helper to determine if assistance is active
  const isActiveAssistance = (assistance: any) => {
    return !assistance.tanggal_keluar || assistance.tanggal_keluar === "-"
  }

  // Get all assistance records
  const getAllAssistanceRecords = useMemo(() => {
    const allRecords: any[] = []
    
    propFilteredAccounts?.forEach(account => {
      if (Array.isArray(account.account_perbantuan) && account.account_perbantuan.length > 0) {
        account.account_perbantuan.forEach(perbantuan => {
          allRecords.push({
            ...perbantuan,
            employee_name: account.account_name,
            employee_id: account.id,
            isActive: isActiveAssistance(perbantuan)
          })
        })
      }
    })

    return allRecords
  }, [propFilteredAccounts])

  // Get filtered assistance records
  const getFilteredAssistanceRecords = useMemo(() => {
    let filtered = getAllAssistanceRecords

    if (selectedUnit) {
      filtered = filtered.filter(record => record.unit_perbantuan === selectedUnit)
    }

    if (selectedStatus) {
      if (selectedStatus === "active") {
        filtered = filtered.filter(record => record.isActive)
      } else if (selectedStatus === "completed") {
        filtered = filtered.filter(record => !record.isActive)
      }
    }

    if (selectedYear) {
      filtered = filtered.filter(record => {
        if (!record.tanggal_masuk) return false
        const [, , year] = record.tanggal_masuk.split("-")
        return year === selectedYear
      })
    }

    if (selectedEmployee) {
      filtered = filtered.filter(record => record.employee_name === selectedEmployee)
    }

    return filtered
  }, [getAllAssistanceRecords, selectedUnit, selectedStatus, selectedYear, selectedEmployee])

  // Assistance by Unit Chart
  const getAssistanceByUnit = () => {
    const records = getAllAssistanceRecords
    if (records.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No assistance data available" },
        },
      }
    }

    const unitCounts = records.reduce((acc, record) => {
      const unit = record.unit_perbantuan || "Unknown"
      acc[unit] = acc[unit] || { active: 0, completed: 0 }
      
      if (record.isActive) {
        acc[unit].active++
      } else {
        acc[unit].completed++
      }
      return acc
    }, {} as Record<string, { active: number, completed: number }>)

    const categories = Object.keys(unitCounts)
    const activeData = categories.map(unit => unitCounts[unit].active)
    const completedData = categories.map(unit => unitCounts[unit].completed)

    return {
      series: [
        {
          name: "Active Assistance",
          data: activeData,
        },
        {
          name: "Completed Assistance",
          data: completedData,
        },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          stacked: true,
          toolbar: { show: false },
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const unit = categories[config.dataPointIndex]
                const newUnit = selectedUnit === unit ? null : unit
                setSelectedUnit(newUnit)
                onFilterChange?.({ unit: newUnit, status: selectedStatus, year: selectedYear, employee: selectedEmployee })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: false,
            columnWidth: "70%",
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories,
          labels: {
            rotate: -45,
            style: {
              fontSize: "11px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Number of Assistance Records",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#10B981", "#3B82F6"],
        title: {
          text: "Assistance Distribution by Unit",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        legend: {
          position: "top" as const,
          horizontalAlign: "center" as const,
          fontSize: "12px",
          fontWeight: "500",
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: (val: number) => `${val} assignments`,
          },
        },
      },
    }
  }

  // Assistance Status Distribution
  const getStatusDistribution = () => {
    const records = getAllAssistanceRecords
    if (records.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "No data available" },
        },
      }
    }

    const activeCount = records.filter(record => record.isActive).length
    const completedCount = records.filter(record => !record.isActive).length

    const series = [activeCount, completedCount]
    const labels = ["Active", "Completed"]

    return {
      series,
      options: {
        chart: {
          type: "donut" as const,
          height: 350,
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0) {
                const status = config.dataPointIndex === 0 ? "active" : "completed"
                const newStatus = selectedStatus === status ? null : status
                setSelectedStatus(newStatus)
                onFilterChange?.({ unit: selectedUnit, status: newStatus, year: selectedYear, employee: selectedEmployee })
              }
            },
          },
        },
        labels,
        colors: ["#10B981", "#3B82F6"],
        title: {
          text: "Assistance Status Distribution",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        legend: {
          position: "bottom" as const,
          fontSize: "12px",
          fontWeight: "500",
        },
        plotOptions: {
          pie: {
            donut: {
              size: "65%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "Total",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  formatter: () => records.length.toString(),
                },
              },
            },
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} assignments (${((val/records.length)*100).toFixed(1)}%)`,
          },
        },
      },
    }
  }

  // Assistance Timeline
  const getAssistanceTimeline = () => {
    const records = getAllAssistanceRecords
    if (records.length === 0) {
      return {
        series: [{ name: "New Assignments", data: [] }],
        options: {
          chart: { type: "area" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const yearCounts = records.reduce((acc, record) => {
      if (record.tanggal_masuk) {
        const [, , year] = record.tanggal_masuk.split("-")
        acc[year] = (acc[year] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const sortedYears = Object.keys(yearCounts).sort()
    const data = sortedYears.map(year => yearCounts[year])

    return {
      series: [{
        name: "New Assignments",
        data,
      }],
      options: {
        chart: {
          type: "area" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && sortedYears[config.dataPointIndex]) {
                const year = sortedYears[config.dataPointIndex]
                const newYear = selectedYear === year ? null : year
                setSelectedYear(newYear)
                onFilterChange?.({ unit: selectedUnit, status: selectedStatus, year: newYear, employee: selectedEmployee })
              }
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth" as const,
          width: 3,
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.3,
          },
        },
        xaxis: {
          categories: sortedYears,
          labels: {
            style: {
              fontSize: "12px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Number of New Assignments",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Assistance Assignment Timeline",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          x: {
            format: "yyyy",
          },
          y: {
            formatter: (val: number) => `${val} new assignments`,
          },
        },
      },
    }
  }

  // Most Active Employees
  const getMostActiveEmployees = () => {
    const records = getAllAssistanceRecords
    if (records.length === 0) {
      return {
        series: [{ name: "Total Assignments", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const employeeCounts = records.reduce((acc, record) => {
      const name = record.employee_name || "Unknown"
      acc[name] = acc[name] || { total: 0, active: 0 }
      acc[name].total++
      if (record.isActive) {
        acc[name].active++
      }
      return acc
    }, {} as Record<string, { total: number, active: number }>)

    // Get top 10 most active employees
    const sortedEmployees = Object.entries(employeeCounts)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 10)

    const categories = sortedEmployees.map(([name]) => name)
    const totalData = sortedEmployees.map(([, data]) => data.total)
    const activeData = sortedEmployees.map(([, data]) => data.active)

    return {
      series: [
        {
          name: "Total Assignments",
          data: totalData,
        },
        {
          name: "Active Assignments",
          data: activeData,
        },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const employee = categories[config.dataPointIndex]
                const newEmployee = selectedEmployee === employee ? null : employee
                setSelectedEmployee(newEmployee)
                onFilterChange?.({ unit: selectedUnit, status: selectedStatus, year: selectedYear, employee: newEmployee })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: true,
            barHeight: "70%",
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ["#fff"],
            fontWeight: "bold",
          },
        },
        xaxis: {
          categories,
          labels: {
            style: {
              fontSize: "10px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: "11px",
            },
          },
        },
        colors: ["#3B82F6", "#10B981"],
        title: {
          text: "Top 10 Most Active Employees",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        legend: {
          position: "top" as const,
          horizontalAlign: "center" as const,
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: (val: number) => `${val} assignments`,
          },
        },
      },
    }
  }

  // Average Assignment Duration Chart
  const getAverageDuration = () => {
    const records = getAllAssistanceRecords.filter(record => !record.isActive && record.tanggal_keluar && record.tanggal_keluar !== "-")
    
    if (records.length === 0) {
      return {
        series: [{ name: "Average Duration (Days)", data: [] }],
        options: {
          chart: { type: "column" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No completed assignments data" },
        },
      }
    }

    const unitDurations = records.reduce((acc, record) => {
      const unit = record.unit_perbantuan || "Unknown"
      const days = daysDifference(record.tanggal_masuk, record.tanggal_keluar)
      
      if (!acc[unit]) {
        acc[unit] = { total: 0, count: 0 }
      }
      acc[unit].total += days
      acc[unit].count++
      return acc
    }, {} as Record<string, { total: number, count: number }>)

    const categories = Object.keys(unitDurations)
    const avgData = categories.map(unit => Math.round(unitDurations[unit].total / unitDurations[unit].count))

    return {
      series: [{
        name: "Average Duration (Days)",
        data: avgData,
      }],
      options: {
        chart: {
          type: "column" as const,
          height: 350,
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            columnWidth: "75%",
            colors: {
              ranges: [
                { from: 0, to: 30, color: "#10B981" },
                { from: 30, to: 90, color: "#3B82F6" },
                { from: 90, to: 180, color: "#F59E0B" },
                { from: 180, to: 1000, color: "#EF4444" }
              ]
            }
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `${val}d`,
          style: {
            colors: ["#fff"],
            fontWeight: "bold",
          },
        },
        xaxis: {
          categories,
          labels: {
            rotate: -45,
            style: {
              fontSize: "11px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Days",
            style: { fontWeight: "600" },
          },
        },
        title: {
          text: "Average Assignment Duration by Unit",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} days average`,
          },
        },
      },
    }
  }

  // Summary Statistics
  const getSummaryStats = () => {
    const allRecords = getAllAssistanceRecords
    const filtered = getFilteredAssistanceRecords

    if (allRecords.length === 0) {
      return {
        totalAssignments: 0,
        activeAssignments: 0,
        completedAssignments: 0,
        uniqueUnits: 0,
        uniqueEmployees: 0,
        avgDuration: 0,
      }
    }

    const activeCount = allRecords.filter(record => record.isActive).length
    const completedCount = allRecords.length - activeCount
    
    const uniqueUnits = new Set(allRecords.map(record => record.unit_perbantuan)).size
    const uniqueEmployees = new Set(allRecords.map(record => record.employee_name)).size

    // Calculate average duration for completed assignments
    const completedRecords = allRecords.filter(record => !record.isActive && record.tanggal_keluar && record.tanggal_keluar !== "-")
    const avgDuration = completedRecords.length > 0 
      ? Math.round(completedRecords.reduce((sum, record) => 
          sum + daysDifference(record.tanggal_masuk, record.tanggal_keluar), 0) / completedRecords.length)
      : 0

    return {
      totalAssignments: filtered.length,
      activeAssignments: activeCount,
      completedAssignments: completedCount,
      uniqueUnits,
      uniqueEmployees,
      avgDuration,
    }
  }

  const stats = getSummaryStats()

  const clearFilters = () => {
    setSelectedUnit(null)
    setSelectedStatus(null)
    setSelectedYear(null)
    setSelectedEmployee(null)
    onFilterChange?.({ unit: null, status: null, year: null, employee: null })
  }

  return (
    <div className="space-y-6">
      {/* Filter Status and Clear Button */}
      {(selectedUnit || selectedStatus || selectedYear || selectedEmployee) && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-blue-800">Active Filters:</span>
                {selectedUnit && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                    <Building className="w-3 h-3 mr-1" />
                    {selectedUnit}
                  </Badge>
                )}
                {selectedStatus && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
                    <Activity className="w-3 h-3 mr-1" />
                    {selectedStatus}
                  </Badge>
                )}
                {selectedYear && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors">
                    <Calendar className="w-3 h-3 mr-1" />
                    {selectedYear}
                  </Badge>
                )}
                {selectedEmployee && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors">
                    <Users className="w-3 h-3 mr-1" />
                    {selectedEmployee}
                  </Badge>
                )}
              </div>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="hover:bg-blue-100 transition-colors bg-transparent"
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Assignments</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalAssignments}</p>
                <p className="text-xs text-blue-600 mt-1">All time</p>
              </div>
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeAssignments}</p>
                <p className="text-xs text-green-600 mt-1">Ongoing</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completedAssignments}</p>
                <p className="text-xs text-purple-600 mt-1">Finished</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Units Involved</p>
                <p className="text-2xl font-bold text-orange-600">{stats.uniqueUnits}</p>
                <p className="text-xs text-orange-600 mt-1">Different units</p>
              </div>
              <Building className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-700">Employees</p>
                <p className="text-2xl font-bold text-pink-600">{stats.uniqueEmployees}</p>
                <p className="text-xs text-pink-600 mt-1">Participated</p>
              </div>
              <Users className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700">Avg Duration</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.avgDuration}</p>
                <p className="text-xs text-indigo-600 mt-1">Days</p>
              </div>
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assistance by Unit */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Assistance by Unit
            </CardTitle>
            <CardDescription className="text-sm">
              Distribution of assistance assignments across work units. Green=Active, Blue=Completed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getAssistanceByUnit().options}
              series={getAssistanceByUnit().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-green-600" />
              Assignment Status
            </CardTitle>
            <CardDescription className="text-sm">
              Overall status distribution of assistance assignments. Click to filter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getStatusDistribution().options}
              series={getStatusDistribution().series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Assistance Timeline */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
              Assignment Timeline
            </CardTitle>
            <CardDescription className="text-sm">
              New assistance assignments over time. Shows demand patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getAssistanceTimeline().options}
              series={getAssistanceTimeline().series}
              type="area"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Most Active Employees */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Most Active Employees
            </CardTitle>
            <CardDescription className="text-sm">
              Top 10 employees by assistance assignments. Blue=Total, Green=Active.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getMostActiveEmployees().options}
              series={getMostActiveEmployees().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Average Duration */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-indigo-50 border-indigo-200 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-indigo-600" />
              Average Assignment Duration
            </CardTitle>
            <CardDescription className="text-sm">
              Average duration of completed assignments by unit. Green=Short (&lt;30d), Blue=Medium (30-90d), Yellow=Long (90-180d), Red=Very Long (&gt;180d).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getAverageDuration().options}
              series={getAverageDuration().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Insights Card */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-green-700">Active Assignments</p>
                  <p className="text-sm text-gray-600">
                    {stats.activeAssignments} assignments are currently active. Monitor workload distribution to ensure no single unit is overwhelmed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-blue-700">Completion Rate</p>
                  <p className="text-sm text-gray-600">
                    {stats.completedAssignments > 0 ? 
                      `${((stats.completedAssignments / (stats.activeAssignments + stats.completedAssignments)) * 100).toFixed(1)}% completion rate indicates ${
                        (stats.completedAssignments / (stats.activeAssignments + stats.completedAssignments)) > 0.7 ? 'efficient' : 'slow'
                      } assignment processing.` 
                      : 'No completed assignments yet to analyze completion patterns.'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-purple-700">Employee Participation</p>
                  <p className="text-sm text-gray-600">
                    {stats.uniqueEmployees} employees have participated in assistance programs, showing {
                      stats.uniqueEmployees > 10 ? 'broad organizational engagement' : 'limited participation that may need expansion'
                    }.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-orange-700">Duration Analysis</p>
                  <p className="text-sm text-gray-600">
                    Average assignment duration of {stats.avgDuration} days suggests {
                      stats.avgDuration < 60 ? 'short-term, focused assistance' : 
                      stats.avgDuration < 120 ? 'medium-term support requirements' : 
                      'long-term assignments that may need review'
                    }.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-red-700">Resource Optimization</p>
                  <p className="text-sm text-gray-600">
                    Monitor units with longest average durations for potential process improvements. Consider standardizing successful short-duration practices across units.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-indigo-700">Strategic Planning</p>
                  <p className="text-sm text-gray-600">
                    Track assignment patterns to predict future support needs and allocate resources proactively. Most active employees should mentor others to build capacity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}