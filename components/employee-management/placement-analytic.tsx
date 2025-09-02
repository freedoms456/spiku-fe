"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, TrendingUp, Users, AlertTriangle, BarChart3, Calendar, Building } from "lucide-react"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface PlacementAnalyticsProps {
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

export default function PlacementAnalytics({
  filteredAccounts: propFilteredAccounts = [],
  onFilterChange,
}: PlacementAnalyticsProps) {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [selectedTenure, setSelectedTenure] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)

  // Helper function to calculate days difference
  const daysDifference = (startDate: string) => {
    if (!startDate) return 0
    const today = new Date()
    const [day, month, year] = startDate.split("-").map(Number)
    const start = new Date(year, month - 1, day)
    const diffTime = Math.abs(today.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Helper function to get years from days
  const getYearsFromDays = (days: number) => {
    return Math.floor(days / 365)
  }

  // Get filtered accounts based on selections
  const getFilteredAccounts = useMemo(() => {
    let filtered = propFilteredAccounts?.filter(acc => 
      acc.account_penempatan?.some(p => p.tanggal_keluar === null) &&
      acc.account_jabatan?.length > 0 &&
      acc.account_jabatan[0]?.name &&
      acc.account_jabatan[0]?.name.trim() !== '-'
    ) || []

    if (selectedUnit) {
      filtered = filtered.filter(acc => {
        const activePlacement = acc.account_penempatan?.find(p => p.tanggal_keluar === null)
        return activePlacement?.satuan_kerja === selectedUnit
      })
    }

    if (selectedTenure) {
      filtered = filtered.filter(acc => {
        const activePlacement = acc.account_penempatan?.find(p => p.tanggal_keluar === null)
        if (!activePlacement?.tanggal_masuk) return false
        
        const days = daysDifference(activePlacement.tanggal_masuk)
        const years = getYearsFromDays(days)
        
        switch (selectedTenure) {
          case "0-1": return years <= 1
          case "1-3": return years > 1 && years <= 3
          case "3-5": return years > 3 && years <= 5
          case "5+": return years > 5
          default: return true
        }
      })
    }

    if (selectedYear) {
      filtered = filtered.filter(acc => {
        const activePlacement = acc.account_penempatan?.find(p => p.tanggal_keluar === null)
        if (!activePlacement?.tanggal_masuk) return false
        
        const [, , year] = activePlacement.tanggal_masuk.split("-")
        return year === selectedYear
      })
    }

    return filtered
  }, [propFilteredAccounts, selectedUnit, selectedTenure, selectedYear])

  // Tenure Distribution Chart
  const getTenureDistribution = () => {
    const accountsToUse = propFilteredAccounts?.filter(acc => 
      acc.account_penempatan?.some(p => p.tanggal_keluar === null) &&
      acc.account_jabatan?.length > 0 &&
      acc.account_jabatan[0]?.name &&
      acc.account_jabatan[0]?.name.trim() !== '-'
    ) || []

    if (accountsToUse.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const tenureRanges = {
      "0-1 Years": 0,
      "1-3 Years": 0,
      "3-5 Years": 0,
      "5+ Years": 0,
    }

    accountsToUse.forEach(acc => {
      const activePlacement = acc.account_penempatan?.find(p => p.tanggal_keluar === null)
      if (activePlacement?.tanggal_masuk) {
        const days = daysDifference(activePlacement.tanggal_masuk)
        const years = getYearsFromDays(days)
        
        if (years <= 1) tenureRanges["0-1 Years"]++
        else if (years <= 3) tenureRanges["1-3 Years"]++
        else if (years <= 5) tenureRanges["3-5 Years"]++
        else tenureRanges["5+ Years"]++
      }
    })

    const categories = Object.keys(tenureRanges)
    const data = Object.values(tenureRanges)

    return {
      series: [{
        name: "Employees",
        data,
      }],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0) {
                const ranges = ["0-1", "1-3", "3-5", "5+"]
                const tenure = ranges[config.dataPointIndex]
                const newTenure = selectedTenure === tenure ? null : tenure
                setSelectedTenure(newTenure)
                onFilterChange?.({ unit: selectedUnit, tenure: newTenure, year: selectedYear })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            columnWidth: "70%",
            colors: {
              ranges: [
                { from: 0, to: 0, color: "#10B981" },
                { from: 1, to: 1, color: "#3B82F6" },
                { from: 2, to: 2, color: "#F59E0B" },
                { from: 3, to: 3, color: "#EF4444" }
              ]
            }
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
              fontSize: "12px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Number of Employees",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"],
        title: {
          text: "Employee Tenure Distribution",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} employees`,
          },
        },
      },
    }
  }

  // Work Unit Distribution Chart
  const getUnitDistribution = () => {
    const accountsToUse = propFilteredAccounts?.filter(acc => 
      acc.account_penempatan?.some(p => p.tanggal_keluar === null) &&
      acc.account_jabatan?.length > 0 &&
      acc.account_jabatan[0]?.name &&
      acc.account_jabatan[0]?.name.trim() !== '-'
    ) || []

    if (accountsToUse.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "No data available" },
        },
      }
    }

    const unitCounts = accountsToUse.reduce((acc, account) => {
      const activePlacement = account.account_penempatan?.find(p => p.tanggal_keluar === null)
      const unit = activePlacement?.satuan_kerja || "Unknown"
      acc[unit] = (acc[unit] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const labels = Object.keys(unitCounts)
    const series = Object.values(unitCounts)
    const total = series.reduce((sum, val) => sum + val, 0)

    return {
      series,
      options: {
        chart: {
          type: "donut" as const,
          height: 350,
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && labels[config.dataPointIndex]) {
                const unit = labels[config.dataPointIndex]
                const newUnit = selectedUnit === unit ? null : unit
                setSelectedUnit(newUnit)
                onFilterChange?.({ unit: newUnit, tenure: selectedTenure, year: selectedYear })
              }
            },
          },
        },
        labels,
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"],
        title: {
          text: "Employee Distribution by Work Unit",
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
                  formatter: () => total.toString(),
                },
              },
            },
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} employees (${((val/total)*100).toFixed(1)}%)`,
          },
        },
      },
    }
  }

  // Placement Timeline Chart
  const getPlacementTimeline = () => {
    const accountsToUse = propFilteredAccounts?.filter(acc => 
      acc.account_penempatan?.some(p => p.tanggal_keluar === null) &&
      acc.account_jabatan?.length > 0 &&
      acc.account_jabatan[0]?.name &&
      acc.account_jabatan[0]?.name.trim() !== '-'
    ) || []

    if (accountsToUse.length === 0) {
      return {
        series: [{ name: "New Placements", data: [] }],
        options: {
          chart: { type: "area" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const yearCounts = accountsToUse.reduce((acc, account) => {
      const activePlacement = account.account_penempatan?.find(p => p.tanggal_keluar === null)
      if (activePlacement?.tanggal_masuk) {
        const [, , year] = activePlacement.tanggal_masuk.split("-")
        acc[year] = (acc[year] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const sortedYears = Object.keys(yearCounts).sort()
    const data = sortedYears.map(year => yearCounts[year])

    return {
      series: [{
        name: "New Placements",
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
                onFilterChange?.({ unit: selectedUnit, tenure: selectedTenure, year: newYear })
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
            text: "Number of Placements",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Placement Timeline by Year",
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
            formatter: (val: number) => `${val} new placements`,
          },
        },
      },
    }
  }

  // Longest Serving Employees Chart
  const getLongestServingEmployees = () => {
    const accountsToUse = propFilteredAccounts?.filter(acc => 
      acc.account_penempatan?.some(p => p.tanggal_keluar === null) &&
      acc.account_jabatan?.length > 0 &&
      acc.account_jabatan[0]?.name &&
      acc.account_jabatan[0]?.name.trim() !== '-'
    ) || []

    if (accountsToUse.length === 0) {
      return {
        series: [{ name: "Years of Service", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    // Get top 10 longest serving employees
    const employeeData = accountsToUse
      .map(acc => {
        const activePlacement = acc.account_penempatan?.find(p => p.tanggal_keluar === null)
        const days = activePlacement?.tanggal_masuk ? daysDifference(activePlacement.tanggal_masuk) : 0
        const years = Math.round((days / 365) * 10) / 10 // Round to 1 decimal
        
        return {
          name: acc.account_name || "Unknown",
          years,
          unit: activePlacement?.satuan_kerja || "Unknown"
        }
      })
      .sort((a, b) => b.years - a.years)
      .slice(0, 10)

    const categories = employeeData.map(emp => emp.name)
    const data = employeeData.map(emp => emp.years)

    return {
      series: [{
        name: "Years of Service",
        data,
      }],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: true,
            barHeight: "70%",
            colors: {
              ranges: [
                { from: 0, to: 3, color: "#10B981" },
                { from: 3, to: 5, color: "#3B82F6" },
                { from: 5, to:10, color: "#F59E0B" },
                { from: 10, to: 100, color: "#EF4444" }
              ]
            }
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `${val} years`,
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
        title: {
          text: "Top 10 Longest Serving Employees",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} years of service`,
          },
        },
      },
    }
  }

  // Summary Statistics
  const getSummaryStats = () => {
    const filtered = getFilteredAccounts

    if (filtered.length === 0) {
      return {
        totalEmployees: 0,
        avgTenure: 0,
        longestTenure: 0,
        needsRotation: 0,
        uniqueUnits: 0,
      }
    }

    const tenureData = filtered.map(acc => {
      const activePlacement = acc.account_penempatan?.find(p => p.tanggal_keluar === null)
      const days = activePlacement?.tanggal_masuk ? daysDifference(activePlacement.tanggal_masuk) : 0
      return days / 365 // Convert to years
    })

    const avgTenure = tenureData.reduce((sum, years) => sum + years, 0) / tenureData.length
    const longestTenure = Math.max(...tenureData)
    const needsRotation = tenureData.filter(years => years > 5).length

    const uniqueUnits = new Set(
      filtered.map(acc => {
        const activePlacement = acc.account_penempatan?.find(p => p.tanggal_keluar === null)
        return activePlacement?.satuan_kerja || "Unknown"
      })
    ).size

    return {
      totalEmployees: filtered.length,
      avgTenure: Math.round(avgTenure * 10) / 10,
      longestTenure: Math.round(longestTenure * 10) / 10,
      needsRotation,
      uniqueUnits,
    }
  }

  const stats = getSummaryStats()

  const clearFilters = () => {
    setSelectedUnit(null)
    setSelectedTenure(null)
    setSelectedYear(null)
    onFilterChange?.({ unit: null, tenure: null, year: null })
  }

  return (
    <div className="space-y-6">
      {/* Filter Status and Clear Button */}
      {(selectedUnit || selectedTenure || selectedYear) && (
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
                {selectedTenure && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedTenure} Years
                  </Badge>
                )}
                {selectedYear && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors">
                    <Calendar className="w-3 h-3 mr-1" />
                    {selectedYear}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Employees</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
                <p className="text-xs text-blue-600 mt-1">Active placements</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Average Tenure</p>
                <p className="text-2xl font-bold text-green-600">{stats.avgTenure}</p>
                <p className="text-xs text-green-600 mt-1">Years</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Longest Service</p>
                <p className="text-2xl font-bold text-purple-600">{stats.longestTenure}</p>
                <p className="text-xs text-purple-600 mt-1">Years</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Needs Rotation</p>
                <p className="text-2xl font-bold text-red-600">{stats.needsRotation}</p>
                <p className="text-xs text-red-600 mt-1">&gt;5 years</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Work Units</p>
                <p className="text-2xl font-bold text-orange-600">{stats.uniqueUnits}</p>
                <p className="text-xs text-orange-600 mt-1">Different units</p>
              </div>
              <Building className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenure Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Tenure Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Employee distribution by years of service. Red indicates need for rotation (&gt;5 years).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getTenureDistribution().options}
              series={getTenureDistribution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Work Unit Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5 text-green-600" />
              Work Unit Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Employee distribution across different work units. Click to filter by unit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getUnitDistribution().options}
              series={getUnitDistribution().series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Placement Timeline */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
              Placement Timeline
            </CardTitle>
            <CardDescription className="text-sm">
              New employee placements by year. Shows hiring trends and patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getPlacementTimeline().options}
              series={getPlacementTimeline().series}
              type="area"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Longest Serving Employees */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Longest Serving Employees
            </CardTitle>
            <CardDescription className="text-sm">
              Top 10 employees by years of service. Red bars indicate priority for rotation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getLongestServingEmployees().options}
              series={getLongestServingEmployees().series}
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
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-red-700">Rotation Priority</p>
                  <p className="text-sm text-gray-600">
                    {stats.needsRotation} employees have been in current positions for over 5 years and should be considered for rotation to prevent stagnation and ensure knowledge transfer.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-blue-700">Average Tenure</p>
                  <p className="text-sm text-gray-600">
                    The average tenure of {stats.avgTenure} years indicates {stats.avgTenure > 4 ? 'stable employment but may need fresh perspectives' : 'good turnover for knowledge sharing'}.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-green-700">Unit Distribution</p>
                  <p className="text-sm text-gray-600">
                    {stats.uniqueUnits} different work units suggest good organizational coverage. Monitor for units with disproportionate long-serving employees.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-purple-700">Succession Planning</p>
                  <p className="text-sm text-gray-600">
                    Employees with {stats.longestTenure}+ years of service should mentor newer staff and document institutional knowledge before potential rotation.
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