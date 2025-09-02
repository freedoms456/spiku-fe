"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, BookOpen, TrendingUp, Calendar, Users, BarChart3, Clock, Star, AlertTriangle, CheckCircle } from "lucide-react"
import dynamic from "next/dynamic"
import { get } from "http"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface TrainingAnalyticsProps {
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

export default function TrainingAnalytics({
  filteredAccounts: propFilteredAccounts = [],
  onFilterChange,
}: TrainingAnalyticsProps) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedTrainingType, setSelectedTrainingType] = useState<string | null>(null)
  const [selectedJPRange, setSelectedJPRange] = useState<string | null>(null)
  const [selectedDiklatName, setSelectedDiklatName] = useState<string | null>(null)

  // Get filtered training data based on selections
  const getFilteredAccounts = useMemo(() => {
    let filtered = propFilteredAccounts
  
    // langsung flatMap account_diklat
    const diklatList = filtered.flatMap((account) =>
      (account.account_diklat || []).map((diklat) => ({
        ...diklat,
        account_name: account.account_name, // ikut sertakan nama account
      }))
    )
  
    return diklatList
  }, [propFilteredAccounts, selectedYear, selectedTrainingType, selectedJPRange])


  const getDiklatDistribution = () => {
    // group by dengan reduce
    const grouped: Record<string, Set<number>> = getFilteredAccounts.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = new Set()
      }
      acc[item.name].add(item.account_id)
      return acc
    }, {} as Record<string, Set<number>>)
  
    // ubah ke array {name, total}, lalu sort & ambil 10
    const counts = Object.entries(grouped)
      .map(([name, set]) => ({
        name,
        total: set.size,
      }))
      .sort((a, b) => b.total - a.total) // urut dari terbesar ke terkecil
      .slice(0, 10) // ambil maksimal 10
  
    return {
      series: [
        {
          name: "Jumlah Peserta",
          data: counts.map((c) => c.total),
        },
      ],
      options: {
        chart: { 
          type: "bar" as const, 
          height: 350,
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && counts[config.dataPointIndex]) {
                const diklatName = counts[config.dataPointIndex].name
                const newName = selectedDiklatName === diklatName ? null : diklatName
                setSelectedDiklatName(newName)
                onFilterChange?.({ year: selectedYear, trainingType: selectedTrainingType, jpRange: selectedJPRange, diklatName: newName })
              }
            },
          },
        },
        xaxis: { categories: counts.map((c) => c.name) },
        noData: { text: "Tidak ada data" },
      },
    }
  }
  
  
  // Training Hours per Employee Chart
  const getTrainingHoursPerEmployee = () => {
    if (!getFilteredAccounts || getFilteredAccounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No training data available" },
        },
      }
    }

    const employeeHours = getFilteredAccounts.reduce((acc, training) => {
      const name = training.account_name || "Unknown"
      const jp = Number(training.jp) || 0
      acc[name] = (acc[name] || 0) + jp
      return acc
    }, {} as Record<string, number>)

    const sortedEmployees = Object.entries(employeeHours)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15) // Top 15 employees

    const categories = sortedEmployees.map(([name]) => name)
    const data = sortedEmployees.map(([, hours]) => hours)

    return {
      series: [{ name: "Training Hours (JP)", data }],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: false,
            columnWidth: "70%",
            dataLabels: { position: "top" }
          },
        },
        dataLabels: {
          enabled: true,
          offsetY: -20,
          style: { fontSize: "12px", colors: ["#304758"] }
        },
        xaxis: {
          categories,
          labels: {
            rotate: -45,
            style: { fontSize: "10px", fontWeight: "500" },
          },
        },
        yaxis: {
          title: { text: "Training Hours (JP)", style: { fontWeight: "600" } },
        },
        colors: ["#3B82F6"],
        title: {
          text: "Top Training Hours by Employee",
          align: "center" as const,
          style: { fontSize: "16px", fontWeight: "bold", color: "#1F2937" },
        },
        tooltip: {
          y: { formatter: (val: number) => `${val} JP` },
          theme: "light",
        },
        grid: { borderColor: "#E5E7EB", strokeDashArray: 3 },
      },
    }
  }

  // Training Types Distribution
  const getTrainingTypesDistribution = () => {
    if (!getFilteredAccounts || getFilteredAccounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "No training data available" },
        },
      }
    }

    const typeCounts = getFilteredAccounts.reduce((acc, training) => {
      const key = `${training.name}&&${training.jenis}`
      if (!acc._seen.has(key)) {
        const type = training.jenis || "Unknown"
        acc.counts[type] = (acc.counts[type] || 0) + 1
        acc._seen.add(key)
      }
      return acc
    }, { counts: {} as Record<string, number>, _seen: new Set<string>() }).counts
    
    const labels = Object.keys(typeCounts)
    const series = Object.values(typeCounts)

    return {
      series,
      options: {
        chart: {
          type: "donut" as const,
          height: 350,
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && labels[config.dataPointIndex]) {
                const type = labels[config.dataPointIndex]
                const newType = selectedTrainingType === type ? null : type
                setSelectedTrainingType(newType)
                onFilterChange?.({ year: selectedYear, trainingType: newType, jpRange: selectedJPRange,diklatName: selectedDiklatName  })
              }
            },
          },
        },
        labels,
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"],
        title: {
          text: "Training Types Distribution",
          align: "center" as const,
          style: { fontSize: "16px", fontWeight: "bold", color: "#1F2937" },
        },
        legend: { position: "bottom" as const, fontSize: "12px", fontWeight: "500" },
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
                  formatter: () => series.reduce((a, b) => a + b, 0).toString(),
                },
              },
            },
          },
        },
        tooltip: { y: { formatter: (val: number) => `${val} trainings` }, theme: "light" },
      },
    }
  }

  // Yearly Training Trend
  const getYearlyTrainingTrend = () => {
    if (!getFilteredAccounts || getFilteredAccounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "line" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No training data available" },
        },
      }
    }

    const yearlyData = getFilteredAccounts.reduce((acc, training) => {
      const year = training.tahun || "Unknown"
      const jp = Number(training.jp) || 0
      if (!acc[year]) acc[year] = { count: 0, totalJP: 0 }
      acc[year].count += 1
      acc[year].totalJP += jp
      return acc
    }, {} as Record<string, { count: number; totalJP: number }>)

    const sortedYears = Object.keys(yearlyData).sort()
    const trainingsData = sortedYears.map(year => yearlyData[year].count)
    const jpData = sortedYears.map(year => yearlyData[year].totalJP)

    return {
        series: [
          { name: "Number of Trainings", data: trainingsData, type: "column" },
          { name: "Total JP Hours", data: jpData, type: "line" }
        ],
        options: {
          chart: {
            type: "line" as const,
            height: 350,
            toolbar: { show: false },
            events: {
              dataPointSelection: (_event: any, _chartContext: any, config: any) => {
                if (config && config.dataPointIndex >= 0 && sortedYears[config.dataPointIndex]) {
                  const year = sortedYears[config.dataPointIndex]
                  const newYear = selectedYear === year ? null : year
                  setSelectedYear(newYear)
                  onFilterChange?.({ year: newYear, trainingType: selectedTrainingType, jpRange: selectedJPRange,diklatName: selectedDiklatName })
                }
              },
            },
          },
          stroke: { width: [0, 4], curve: "smooth" as const },
          plotOptions: {
            bar: { borderRadius: 6, columnWidth: "50%" }
          },
          fill: { opacity: [0.85, 1] },
          labels: sortedYears,
          markers: { size: 0 },
          xaxis: {
            type: "category" as const,
            labels: { style: { fontSize: "12px", fontWeight: "500" } }
          },
          yaxis: [
            {
              title: { text: "Number of Trainings", style: { fontWeight: "600" } },
              seriesName: "Number of Trainings"
            },
            {
              opposite: true,
              title: { text: "Total JP Hours", style: { fontWeight: "600" } },
              seriesName: "Total JP Hours"
            }
          ],
          colors: ["#3B82F6", "#10B981"],
          title: {
            text: "Training Trends Over Years",
            align: "center" as const,
            style: { fontSize: "16px", fontWeight: "bold", color: "#1F2937" },
          },
          legend: { position: "top" as const, horizontalAlign: "center" as const },
          tooltip: { shared: true, intersect: false, theme: "light" },
        },
    }
  }

  // Training Hours Distribution
  const getTrainingHoursDistribution = () => {
    if (!getFilteredAccounts || getFilteredAccounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "histogram" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No training data available" },
        },
      }
    }

    const jpRanges = {
      "1-10 JP": 0,
      "11-20 JP": 0,
      "21-40 JP": 0,
      "41-60 JP": 0,
      "61-100 JP": 0,
      "100+ JP": 0,
    }

    getFilteredAccounts.forEach(training => {
      const jp = Number(training.jp) || 0
      if (jp <= 10) jpRanges["1-10 JP"]++
      else if (jp <= 20) jpRanges["11-20 JP"]++
      else if (jp <= 40) jpRanges["21-40 JP"]++
      else if (jp <= 60) jpRanges["41-60 JP"]++
      else if (jp <= 100) jpRanges["61-100 JP"]++
      else jpRanges["100+ JP"]++
    })

    const categories = Object.keys(jpRanges)
    const data = Object.values(jpRanges)

    return {
      series: [{ name: "Training Count", data }],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const range = categories[config.dataPointIndex]
                const newRange = selectedJPRange === range ? null : range
                setSelectedJPRange(newRange)
                onFilterChange?.({ year: selectedYear, trainingType: selectedTrainingType, jpRange: newRange,diklatName: selectedDiklatName })
              }
            },
          },
        },
        plotOptions: {
          bar: { borderRadius: 6, horizontal: false, columnWidth: "60%" }
        },
        dataLabels: { enabled: true, style: { colors: ["#fff"], fontWeight: "bold" } },
        xaxis: {
          categories,
          labels: { style: { fontSize: "11px", fontWeight: "500" } }
        },
        yaxis: {
          title: { text: "Number of Trainings", style: { fontWeight: "600" } }
        },
        colors: ["#F59E0B"],
        title: {
          text: "Training Hours Distribution",
          align: "center" as const,
          style: { fontSize: "16px", fontWeight: "bold", color: "#1F2937" },
        },
        tooltip: { y: { formatter: (val: number) => `${val} trainings` }, theme: "light" },
        grid: { borderColor: "#E5E7EB", strokeDashArray: 3 },
      },
    }
  }

  // Summary Statistics
  const getSummaryStats = () => {
    if (!getFilteredAccounts || getFilteredAccounts.length === 0) {
      return {
        totalTrainings: 0,
        totalJP: 0,
        averageJP: 0,
        uniqueEmployees: 0,
        trainingTypes: 0,
        mostActiveYear: "N/A",
        topTrainingType: "N/A"
      }
    }

    const totalTrainings = new Set(
      getFilteredAccounts.map(training => `${training.name} && ${training.jenis}`)
    ).size
    const totalJP = getFilteredAccounts.reduce((sum, training) => sum + (Number(training.jp) || 0), 0)
    const averageJP = totalTrainings > 0 ? Math.round(totalJP / totalTrainings) : 0
    const uniqueEmployees = new Set(getFilteredAccounts.map(t => t.employeeId)).size
    const trainingTypes = new Set(getFilteredAccounts.map(t => t.jenis)).size

    // Most active year
    const yearCounts = getFilteredAccounts.reduce((acc, training) => {
      const year = training.tahun || "Unknown"
      acc[year] = (acc[year] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const mostActiveYear = Object.entries(yearCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A"

    // Top training type
    const typeCounts = getFilteredAccounts.reduce((acc, training) => {
      const type = training.jenis || "Unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topTrainingType = Object.entries(typeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A"

    return {
      totalTrainings,
      totalJP,
      averageJP,
      uniqueEmployees,
      trainingTypes,
      mostActiveYear,
      topTrainingType
    }
  }

  const stats = getSummaryStats()
  
  const clearFilters = () => {
    setSelectedJPRange(null)
    setSelectedYear(null)
    setSelectedTrainingType(null)
    setSelectedDiklatName(null)
    onFilterChange?.({ employee: null, location: null, relation: null })
  }


  return (
    <div className="space-y-6">
      {/* Filter Status and Clear Button */}
   

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Trainings</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalTrainings}</p>
                <p className="text-xs text-blue-600 mt-1">{stats.uniqueEmployees} employees</p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total JP Hours</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalJP}</p>
                <p className="text-xs text-green-600 mt-1">Avg: {stats.averageJP} JP</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Training Types</p>
                <p className="text-2xl font-bold text-purple-600">{stats.trainingTypes}</p>
                <p className="text-xs text-purple-600 mt-1">Most: {stats.topTrainingType.length > 15 ? stats.topTrainingType.substring(0, 15) + '...' : stats.topTrainingType}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Most Active Year</p>
                <p className="text-2xl font-bold text-orange-600">{stats.mostActiveYear}</p>
                <p className="text-xs text-orange-600 mt-1">Peak activity</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-orange-600" />
              Distribusi Diklat Yang Diikuti Pegawai
            </CardTitle>
            <CardDescription className="text-sm">
             Klik Untuk Lihat Pegawi yang mengikuti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getDiklatDistribution().options}
              series={getDiklatDistribution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Training Types Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-green-600" />
              Training Types Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Click segments to filter by training type. Shows distribution of different training categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getTrainingTypesDistribution().options}
              series={getTrainingTypesDistribution().series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Yearly Training Trend */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-indigo-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Training Trends Over Years
            </CardTitle>
            <CardDescription className="text-sm">
              Click data points to filter by year. Shows training activity trends and total JP hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getYearlyTrainingTrend().options}
              series={getYearlyTrainingTrend().series}
              type="line"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Training Hours Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-orange-600" />
              Training Hours Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by JP range. Shows how training hours are distributed across different ranges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getTrainingHoursDistribution().options}
              series={getTrainingHoursDistribution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>


        </div>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Top Training Hours by Employee
            </CardTitle>
            <CardDescription className="text-sm">
              Employees with the most training hours (JP). Shows top 15 performers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getTrainingHoursPerEmployee().options}
              series={getTrainingHoursPerEmployee().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Training Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">High Performers</p>
                <p className="text-xs text-green-700">
                  {Math.round((stats.uniqueEmployees / propFilteredAccounts.length) * 100)}% of employees have completed trainings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">Training Diversity</p>
                <p className="text-xs text-blue-700">
                  {stats.trainingTypes} different types of training programs available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
    
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-800">Training Investment</p>
                <p className="text-xs text-orange-700">
                  {stats.averageJP} JP average per training shows commitment to development
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  )
}