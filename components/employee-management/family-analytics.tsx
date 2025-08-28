"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Heart, MapPin, BarChart3, TrendingUp, Activity, Baby, User, AlertTriangle } from "lucide-react"
import { accounts, families } from "@/lib/employee-management-data"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface FamilyAnalyticsProps {
  filteredFamilies?: any[]
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

export default function FamilyAnalytics({
  filteredFamilies: propFilteredFamilies,
  filteredAccounts: propFilteredAccounts,
  onFilterChange,
}: FamilyAnalyticsProps = {}) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedRelation, setSelectedRelation] = useState<string | null>(null)

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Get filtered families based on selections
  const getFilteredFamilies = () => {
    if (propFilteredFamilies) {
      return propFilteredFamilies
    }

    let filtered = families

    if (selectedEmployee) {
      const account =
        propFilteredAccounts?.find((acc) => acc.account_name === selectedEmployee) ||
        accounts.find((acc) => acc.account_name === selectedEmployee)
      if (account) {
        filtered = filtered.filter((f) => f.account_id === account.id)
      }
    }

    if (selectedLocation) {
      filtered = filtered.filter((f) => f.domisili_sekarang === selectedLocation)
    }

    if (selectedRelation) {
      filtered = filtered.filter((f) => f.family_hubungan === selectedRelation)
    }

    return filtered
  }

  // Family Members per Employee Chart
  const getFamilyMembersPerEmployee = () => {
    const accountsToUse = propFilteredAccounts || accounts
    if (!accountsToUse || accountsToUse.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const employeeFamilyCount = accountsToUse.map((account) => ({
      name: account.account_name || "Unknown",
      count: families.filter((family) => family.account_id === account.id).length,
      sickCount: families.filter((family) => family.account_id === account.id && family.kondisi_kesehatan === "Sakit")
        .length,
    }))

    const categories = employeeFamilyCount.map((item) => item.name)
    const totalData = employeeFamilyCount.map((item) => item.count)
    const sickData = employeeFamilyCount.map((item) => item.sickCount)

    return {
      series: [
        {
          name: "Total Family Members",
          data: totalData,
        },
        {
          name: "Sick Family Members",
          data: sickData,
        },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const employeeName = categories[config.dataPointIndex]
                const newEmployee = selectedEmployee === employeeName ? null : employeeName
                setSelectedEmployee(newEmployee)
                onFilterChange?.({ employee: newEmployee, location: selectedLocation, relation: selectedRelation })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: false,
            columnWidth: "65%",
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
              fontSize: "10px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Number of Family Members",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#3B82F6", "#EF4444"],
        title: {
          text: "Family Members per Employee",
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
          theme: "light",
          style: {
            fontSize: "12px",
          },
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }

  // Relationship Distribution Chart
  const getRelationshipDistribution = () => {
    const filteredFamilies = getFilteredFamilies()
    if (!filteredFamilies || filteredFamilies.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "No data available" },
        },
      }
    }

    const relationshipCounts = filteredFamilies.reduce(
      (acc, family) => {
        const relation = family.family_hubungan || "Unknown"
        acc[relation] = (acc[relation] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const labels = Object.keys(relationshipCounts)
    const series = Object.values(relationshipCounts)

    return {
      series,
      options: {
        chart: {
          type: "donut" as const,
          height: 350,
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && labels[config.dataPointIndex]) {
                const relation = labels[config.dataPointIndex]
                const newRelation = selectedRelation === relation ? null : relation
                setSelectedRelation(newRelation)
                onFilterChange?.({ employee: selectedEmployee, location: selectedLocation, relation: newRelation })
              }
            },
          },
        },
        labels,
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
        title: {
          text: "Family Relationship Distribution",
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
                  formatter: () => filteredFamilies.length.toString(),
                },
                value: {
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#1F2937",
                },
              },
            },
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} members`,
          },
          theme: "light",
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 300,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      },
    }
  }

  // Location Distribution Chart
  const getLocationDistribution = () => {
    const filteredFamilies = getFilteredFamilies()
    if (!filteredFamilies || filteredFamilies.length === 0) {
      return {
        series: [{ name: "Family Members", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const locationCounts = filteredFamilies.reduce(
      (acc, family) => {
        const location = family.domisili_sekarang || "Unknown"
        acc[location] = (acc[location] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const categories = Object.keys(locationCounts)
    const data = Object.values(locationCounts)

    return {
      series: [
        {
          name: "Family Members",
          data,
        },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const location = categories[config.dataPointIndex]
                const newLocation = selectedLocation === location ? null : location
                setSelectedLocation(newLocation)
                onFilterChange?.({ employee: selectedEmployee, location: newLocation, relation: selectedRelation })
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
            fontSize: "12px",
            fontWeight: "bold",
          },
        },
        xaxis: {
          categories,
          labels: {
            style: {
              fontSize: "11px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Locations",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#10B981"],
        title: {
          text: "Family Members by Location",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} members`,
          },
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }

  // Age Distribution Chart
  const getFamilyAgeDistribution = () => {
    const filteredFamilies = getFilteredFamilies()
    if (!filteredFamilies || filteredFamilies.length === 0) {
      return {
        series: [{ name: "Family Members", data: [] }],
        options: {
          chart: { type: "column" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const ages = filteredFamilies
      .filter((family) => family.family_tanggal_lahir)
      .map((family) => calculateAge(family.family_tanggal_lahir))

    const ageRanges = {
      "0-10": 0,
      "11-20": 0,
      "21-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51+": 0,
    }

    ages.forEach((age) => {
      if (age <= 10) ageRanges["0-10"]++
      else if (age <= 20) ageRanges["11-20"]++
      else if (age <= 30) ageRanges["21-30"]++
      else if (age <= 40) ageRanges["31-40"]++
      else if (age <= 50) ageRanges["41-50"]++
      else ageRanges["51+"]++
    })

    return {
      series: [
        {
          name: "Family Members",
          data: Object.values(ageRanges),
        },
      ],
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
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ["#fff"],
            fontWeight: "bold",
            fontSize: "12px",
          },
        },
        xaxis: {
          categories: Object.keys(ageRanges),
          labels: {
            style: {
              fontSize: "12px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Number of Family Members",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Family Members Age Distribution",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} members`,
          },
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }

  // Health Status Chart
  const getHealthStatusChart = () => {
    const filteredFamilies = getFilteredFamilies()
    if (!filteredFamilies || filteredFamilies.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "pie" as const, height: 350 },
          labels: [],
          noData: { text: "No data available" },
        },
      }
    }

    const healthCounts = filteredFamilies.reduce(
      (acc, family) => {
        const health = family.kondisi_kesehatan || "Unknown"
        acc[health] = (acc[health] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const labels = Object.keys(healthCounts)
    const series = Object.values(healthCounts)

    return {
      series,
      options: {
        chart: {
          type: "pie" as const,
          height: 350,
        },
        labels,
        colors: ["#10B981", "#EF4444", "#F59E0B"],
        title: {
          text: "Family Health Status Distribution",
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
        tooltip: {
          y: {
            formatter: (val: number) => `${val} members`,
          },
          theme: "light",
        },
        plotOptions: {
          pie: {
            dataLabels: {
              offset: -5,
            },
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "12px",
            fontWeight: "bold",
            colors: ["#fff"],
          },
        },
      },
    }
  }

  // Family vs Sick Correlation
  const getFamilyVsSickCorrelation = () => {
    const accountsToUse = propFilteredAccounts || accounts
    if (!accountsToUse || accountsToUse.length === 0) {
      return {
        series: [{ name: "Employees", data: [] }],
        options: {
          chart: { type: "scatter" as const, height: 350 },
          noData: { text: "No data available" },
        },
      }
    }

    const correlationData = accountsToUse
      .map((account) => {
        const totalFamily = families.filter((family) => family.account_id === account.id).length
        const sickFamily = families.filter(
          (family) => family.account_id === account.id && family.kondisi_kesehatan === "Sakit",
        ).length

        return {
          x: totalFamily,
          y: sickFamily,
          name: account.account_name || "Unknown",
        }
      })
      .filter((item) => item.x > 0)

    return {
      series: [
        {
          name: "Employees",
          data: correlationData,
        },
      ],
      options: {
        chart: {
          type: "scatter" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && correlationData[config.dataPointIndex]) {
                const employeeName = correlationData[config.dataPointIndex].name
                const newEmployee = selectedEmployee === employeeName ? null : employeeName
                setSelectedEmployee(newEmployee)
                onFilterChange?.({ employee: newEmployee, location: selectedLocation, relation: selectedRelation })
              }
            },
          },
        },
        xaxis: {
          title: {
            text: "Total Family Members",
            style: {
              fontWeight: "600",
            },
          },
          min: 0,
          labels: {
            style: {
              fontSize: "11px",
            },
          },
        },
        yaxis: {
          title: {
            text: "Sick Family Members",
            style: {
              fontWeight: "600",
            },
          },
          min: 0,
          labels: {
            style: {
              fontSize: "11px",
            },
          },
        },
        colors: ["#EC4899"],
        title: {
          text: "Family vs Health Correlation",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          custom: ({ series, seriesIndex, dataPointIndex, w }) => {
            if (dataPointIndex >= 0 && correlationData[dataPointIndex]) {
              const data = correlationData[dataPointIndex]
              return `<div class="p-3 bg-white border rounded-lg shadow-lg">
                <strong class="text-gray-800 text-sm">${data.name}</strong><br/>
                <span class="text-blue-600 text-xs">Total Family: ${data.x}</span><br/>
                <span class="text-red-600 text-xs">Sick Family: ${data.y}</span>
              </div>`
            }
            return ""
          },
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
        markers: {
          size: 6,
          strokeWidth: 2,
          strokeColors: "#fff",
          hover: {
            size: 8,
          },
        },
      },
    }
  }

  // Employees with Sick Family Members Chart
  const getEmployeesWithSickFamily = () => {
    const accountsToUse = propFilteredAccounts || accounts
    if (!accountsToUse || accountsToUse.length === 0) {
      return {
        series: [{ name: "Sick Family Members", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const employeesWithSick = accountsToUse
      .map((account) => {
        const sickFamilyCount = families.filter(
          (family) => family.account_id === account.id && family.kondisi_kesehatan === "Sakit",
        ).length
        return {
          name: account.account_name || "Unknown",
          count: sickFamilyCount,
        }
      })
      .filter((item) => item.count > 0)

    const categories = employeesWithSick.map((item) => item.name)
    const data = employeesWithSick.map((item) => item.count)

    return {
      series: [
        {
          name: "Sick Family Members",
          data,
        },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const employeeName = categories[config.dataPointIndex]
                const newEmployee = selectedEmployee === employeeName ? null : employeeName
                setSelectedEmployee(newEmployee)
                onFilterChange?.({ employee: newEmployee, location: selectedLocation, relation: selectedRelation })
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
          enabled: true,
          style: {
            colors: ["#fff"],
            fontWeight: "bold",
            fontSize: "12px",
          },
        },
        xaxis: {
          categories,
          labels: {
            rotate: -45,
            style: {
              fontSize: "10px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Number of Sick Family Members",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#F97316"],
        title: {
          text: "Employees with Sick Family Members",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} sick family members`,
          },
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }

  // Top Employees with Most Sick Family Members Chart
  const getTopEmployeesWithSickFamily = () => {
    const accountsToUse = propFilteredAccounts || accounts
    if (!accountsToUse || accountsToUse.length === 0) {
      return {
        series: [{ name: "Sick Family Members", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const employeesWithSick = accountsToUse
      .map((account) => {
        const sickFamilyCount = families.filter(
          (family) => family.account_id === account.id && family.kondisi_kesehatan === "Sakit",
        ).length
        return {
          name: account.account_name || "Unknown",
          count: sickFamilyCount,
        }
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const categories = employeesWithSick.map((item) => item.name)
    const data = employeesWithSick.map((item) => item.count)

    return {
      series: [
        {
          name: "Sick Family Members",
          data,
        },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const employeeName = categories[config.dataPointIndex]
                const newEmployee = selectedEmployee === employeeName ? null : employeeName
                setSelectedEmployee(newEmployee)
                onFilterChange?.({ employee: newEmployee, location: selectedLocation, relation: selectedRelation })
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
            fontSize: "12px",
          },
        },
        xaxis: {
          categories,
          labels: {
            style: {
              fontSize: "11px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Employees",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#F59E0B"],
        title: {
          text: "Top 5 Employees with Most Sick Family Members",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} sick family members`,
          },
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }

  // Summary Statistics
  const getSummaryStats = () => {
    const filteredFamilies = getFilteredFamilies()
    if (!filteredFamilies || filteredFamilies.length === 0) {
      return {
        totalFamilies: 0,
        sickFamilies: 0,
        uniqueLocations: 0,
        avgAge: 0,
        healthyFamilies: 0,
      }
    }

    const totalFamilies = filteredFamilies.length
    const sickFamilies = filteredFamilies.filter((f) => f.kondisi_kesehatan === "Sakit").length
    const uniqueLocations = new Set(filteredFamilies.map((f) => f.domisili_sekarang).filter(Boolean)).size

    const validAges = filteredFamilies
      .filter((f) => f.family_tanggal_lahir)
      .map((f) => calculateAge(f.family_tanggal_lahir))

    const avgAge =
      validAges.length > 0 ? Math.round(validAges.reduce((sum, age) => sum + age, 0) / validAges.length) : 0

    return {
      totalFamilies,
      sickFamilies,
      uniqueLocations,
      avgAge,
      healthyFamilies: totalFamilies - sickFamilies,
    }
  }

  const stats = getSummaryStats()

  const clearFilters = () => {
    setSelectedEmployee(null)
    setSelectedLocation(null)
    setSelectedRelation(null)
    onFilterChange?.({ employee: null, location: null, relation: null })
  }

  return (
    <div className="space-y-6">
      {/* Filter Status and Clear Button */}
      {(selectedEmployee || selectedLocation || selectedRelation) && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-blue-800">Active Filters:</span>
                {selectedEmployee && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                    <User className="w-3 h-3 mr-1" />
                    {selectedEmployee}
                  </Badge>
                )}
                {selectedLocation && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {selectedLocation}
                  </Badge>
                )}
                {selectedRelation && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {selectedRelation}
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
                <p className="text-sm font-medium text-blue-700">Total Families</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalFamilies}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {families.length > 0 ? ((stats.totalFamilies / families.length) * 100).toFixed(1) : 0}% of all
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Healthy Families</p>
                <p className="text-2xl font-bold text-green-600">{stats.healthyFamilies}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalFamilies > 0 ? ((stats.healthyFamilies / stats.totalFamilies) * 100).toFixed(1) : 0}%
                  healthy
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Sick Families</p>
                <p className="text-2xl font-bold text-red-600">{stats.sickFamilies}</p>
                <p className="text-xs text-red-600 mt-1">
                  {stats.totalFamilies > 0 ? ((stats.sickFamilies / stats.totalFamilies) * 100).toFixed(1) : 0}% need
                  care
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Locations</p>
                <p className="text-2xl font-bold text-purple-600">{stats.uniqueLocations}</p>
                <p className="text-xs text-purple-600 mt-1">Different areas</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Average Age</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgAge}</p>
                <p className="text-xs text-orange-600 mt-1">Years old</p>
              </div>
              <Baby className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* First Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Family Members per Employee */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Family Members per Employee
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by employee. Shows total and sick family members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getFamilyMembersPerEmployee().options}
              series={getFamilyMembersPerEmployee().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Relationship Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-green-600" />
              Relationship Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Click segments to filter by relationship type. Interactive donut chart.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getRelationshipDistribution().options}
              series={getRelationshipDistribution().series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
              Geographic Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by location. Shows family member distribution across areas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getLocationDistribution().options}
              series={getLocationDistribution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Second Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Status */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-red-600" />
              Health Status Overview
            </CardTitle>
            <CardDescription className="text-sm">Health condition distribution of family members.</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getHealthStatusChart().options}
              series={getHealthStatusChart().series}
              type="pie"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-indigo-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Age Distribution
            </CardTitle>
            <CardDescription className="text-sm">Age groups of family members across all employees.</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getFamilyAgeDistribution().options}
              series={getFamilyAgeDistribution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Correlation Analysis */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-pink-50 border-pink-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-pink-600" />
              Family vs Health Correlation
            </CardTitle>
            <CardDescription className="text-sm">
              Click points to filter by employee. Correlation between family size and health issues.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getFamilyVsSickCorrelation().options}
              series={getFamilyVsSickCorrelation().series}
              type="scatter"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Additional Health Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employees with Sick Family Members */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Employees with Sick Family Members
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by employee. Shows employees who have family members with health issues.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getEmployeesWithSickFamily().options}
              series={getEmployeesWithSickFamily().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Top Employees with Most Sick Family Members */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-amber-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Top Employees with Most Sick Family Members
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by employee. Ranking of employees by number of sick family members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getTopEmployeesWithSickFamily().options}
              series={getTopEmployeesWithSickFamily().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Insights Panel */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Key Insights & Recommendations
          </CardTitle>
          <CardDescription>Data-driven insights from family analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-red-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-500" />
                <h4 className="font-semibold text-gray-900">Health Risk Assessment</h4>
              </div>
              <p className="text-sm text-gray-700">
                {stats.totalFamilies > 0 ? Math.round((stats.sickFamilies / stats.totalFamilies) * 100) : 0}% of family
                members have health issues
              </p>
              <p className="text-xs text-gray-500 mt-1">Consider enhanced health benefits</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <h4 className="font-semibold text-gray-900">Geographic Spread</h4>
              </div>
              <p className="text-sm text-gray-700">Families across {stats.uniqueLocations} locations</p>
              <p className="text-xs text-gray-500 mt-1">Plan location-based support programs</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Baby className="w-4 h-4 text-purple-500" />
                <h4 className="font-semibold text-gray-900">Age Demographics</h4>
              </div>
              <p className="text-sm text-gray-700">Average family age: {stats.avgAge} years</p>
              <p className="text-xs text-gray-500 mt-1">Tailor age-appropriate benefits</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
