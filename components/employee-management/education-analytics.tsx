"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, Award, TrendingUp, Users, Star, Target, BarChart3, AlertTriangle } from "lucide-react"
import { accounts, educations } from "@/lib/employee-management-data"
import dynamic from "next/dynamic"

interface EducationAnalyticsProps {
  filteredEducations?: any[]
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function EducationAnalytics({
  filteredEducations: propFilteredEducations,
  filteredAccounts: propFilteredAccounts,
  onFilterChange,
}: EducationAnalyticsProps = {}) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null)
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null)

  // Get filtered educations based on selections
  const getFilteredEducations = () => {
    if (propFilteredEducations) {
      return propFilteredEducations
    }

    let filtered = educations

    if (selectedLevel) {
      filtered = filtered.filter((edu) => edu.education_tingkat === selectedLevel)
    }

    if (selectedMajor) {
      filtered = filtered.filter((edu) => edu.education_jurusan === selectedMajor)
    }

    if (selectedInstitution) {
      filtered = filtered.filter((edu) => edu.education_institusi === selectedInstitution)
    }

    return filtered
  }

  // Education Level Distribution Chart
  const getEducationLevelDistribution = () => {
    const filteredEducations = getFilteredEducations()
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "No data available" },
        },
      }
    }

    const levelCounts = filteredEducations.reduce(
      (acc, education) => {
        const level = education.education_tingkat || "Unknown"
        acc[level] = (acc[level] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const labels = Object.keys(levelCounts)
    const series = Object.values(levelCounts)

    return {
      series,
      options: {
        chart: {
          type: "donut" as const,
          height: 350,
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && labels[config.dataPointIndex]) {
                const level = labels[config.dataPointIndex]
                const newLevel = selectedLevel === level ? null : level
                setSelectedLevel(newLevel)
                onFilterChange?.({ level: newLevel, major: selectedMajor, institution: selectedInstitution })
              }
            },
          },
        },
        labels,
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
        title: {
          text: "Education Level Distribution",
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
                  formatter: () => filteredEducations.length.toString(),
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
            formatter: (val: number) => `${val} employees`,
          },
          theme: "light",
        },
      },
    }
  }

  // Most Common Majors Chart
  const getMostCommonMajors = () => {
    const filteredEducations = getFilteredEducations()
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        series: [{ name: "Employees", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const majorCounts = filteredEducations.reduce(
      (acc, education) => {
        const major = education.education_jurusan || "Unknown"
        acc[major] = (acc[major] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedMajors = Object.entries(majorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)

    const categories = sortedMajors.map(([major, _]) => major)
    const data = sortedMajors.map(([_, count]) => count)

    return {
      series: [
        {
          name: "Employees",
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
                const major = categories[config.dataPointIndex]
                const newMajor = selectedMajor === major ? null : major
                setSelectedMajor(newMajor)
                onFilterChange?.({ level: selectedLevel, major: newMajor, institution: selectedInstitution })
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
            text: "Majors",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#10B981"],
        title: {
          text: "Most Common Majors",
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
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }

  // Graduation Year Distribution Chart
  const getGraduationYearDistribution = () => {
    const filteredEducations = getFilteredEducations()
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        series: [{ name: "Graduates", data: [] }],
        options: {
          chart: { type: "line" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const yearCounts = filteredEducations.reduce(
      (acc, education) => {
        const year = education.education_tahun_lulus || "Unknown"
        acc[year] = (acc[year] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedYears = Object.entries(yearCounts).sort((a, b) => a[0].localeCompare(b[0]))
    const categories = sortedYears.map(([year, _]) => year)
    const data = sortedYears.map(([_, count]) => count)

    return {
      series: [
        {
          name: "Graduates",
          data,
        },
      ],
      options: {
        chart: {
          type: "line" as const,
          height: 350,
          toolbar: { show: false },
        },
        stroke: {
          curve: "smooth" as const,
          width: 4,
        },
        markers: {
          size: 8,
          hover: {
            size: 12,
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
            text: "Number of Graduates",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Graduation Year Distribution",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} graduates`,
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

  // GPA Distribution by Education Level Chart
  const getGPADistributionByLevel = () => {
    const filteredEducations = getFilteredEducations()
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "boxPlot" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const levels = [...new Set(filteredEducations.map((edu) => edu.education_tingkat).filter(Boolean))]

    const series = levels.map((level) => {
      const levelEducations = filteredEducations.filter((edu) => edu.education_tingkat === level)
      const gpas = levelEducations.map((edu) => Number.parseFloat(edu.education_ipk)).filter((gpa) => !isNaN(gpa))

      return {
        name: level,
        data: gpas,
      }
    })

    return {
      series,
      options: {
        chart: {
          type: "boxPlot" as const,
          height: 350,
          toolbar: { show: false },
        },
        plotOptions: {
          boxPlot: {
            colors: {
              upper: "#3B82F6",
              lower: "#10B981",
            },
          },
        },
        xaxis: {
          categories: levels,
          labels: {
            style: {
              fontSize: "12px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "GPA",
            style: {
              fontWeight: "600",
            },
          },
          min: 2.5,
          max: 4.0,
        },
        title: {
          text: "GPA Distribution by Education Level",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }

  // Top Institutions Chart
  const getTopInstitutions = () => {
    const filteredEducations = getFilteredEducations()
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        series: [{ name: "Alumni", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const institutionCounts = filteredEducations.reduce(
      (acc, education) => {
        const institution = education.education_institusi || "Unknown"
        acc[institution] = (acc[institution] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedInstitutions = Object.entries(institutionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)

    const categories = sortedInstitutions.map(([institution, _]) =>
      institution.length > 15 ? institution.substring(0, 15) + "..." : institution,
    )
    const data = sortedInstitutions.map(([_, count]) => count)

    return {
      series: [
        {
          name: "Alumni",
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
              if (config && config.dataPointIndex >= 0 && sortedInstitutions[config.dataPointIndex]) {
                const institution = sortedInstitutions[config.dataPointIndex][0]
                const newInstitution = selectedInstitution === institution ? null : institution
                setSelectedInstitution(newInstitution)
                onFilterChange?.({ level: selectedLevel, major: selectedMajor, institution: newInstitution })
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
            text: "Number of Alumni",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#F59E0B"],
        title: {
          text: "Top Institutions",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} alumni`,
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

  // Multiple Degrees Chart
  const getMultipleDegreesChart = () => {
    const accountsToUse = propFilteredAccounts || accounts
    if (!accountsToUse || accountsToUse.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "pie" as const, height: 350 },
          labels: [],
          noData: { text: "No data available" },
        },
      }
    }

    const employeeEducationCount = accountsToUse.map((account) => ({
      name: account.account_name || "Unknown",
      count: educations.filter((edu) => edu.account_id === account.id).length,
    }))

    const singleDegree = employeeEducationCount.filter((emp) => emp.count === 1).length
    const multipleDegrees = employeeEducationCount.filter((emp) => emp.count > 1).length

    return {
      series: [singleDegree, multipleDegrees],
      options: {
        chart: {
          type: "pie" as const,
          height: 350,
        },
        labels: ["Single Degree", "Multiple Degrees"],
        colors: ["#3B82F6", "#EF4444"],
        title: {
          text: "Employees with Multiple Degrees",
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
            formatter: (val: number) => `${val} employees`,
          },
          theme: "light",
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

  // Average GPA by Institution Chart
  const getAverageGPAByInstitution = () => {
    const filteredEducations = getFilteredEducations()
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        series: [{ name: "Average GPA", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const institutionGPAs = filteredEducations.reduce(
      (acc, education) => {
        const institution = education.education_institusi || "Unknown"
        const gpa = Number.parseFloat(education.education_ipk)
        if (!isNaN(gpa)) {
          if (!acc[institution]) {
            acc[institution] = []
          }
          acc[institution].push(gpa)
        }
        return acc
      },
      {} as Record<string, number[]>,
    )

    const institutionAverages = Object.entries(institutionGPAs)
      .map(([institution, gpas]) => ({
        institution,
        avgGPA: gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length,
        count: gpas.length,
      }))
      .sort((a, b) => b.avgGPA - a.avgGPA)
      .slice(0, 10)

    const categories = institutionAverages.map((item) =>
      item.institution.length > 20 ? item.institution.substring(0, 20) + "..." : item.institution,
    )
    const data = institutionAverages.map((item) => Number.parseFloat(item.avgGPA.toFixed(2)))

    return {
      series: [
        {
          name: "Average GPA",
          data,
        },
      ],
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
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => val.toFixed(2),
          style: {
            colors: ["#fff"],
            fontSize: "12px",
            fontWeight: "bold",
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
            text: "Institutions",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#EC4899"],
        title: {
          text: "Average GPA by Institution (Top 10)",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val.toFixed(2)} GPA`,
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

  // Education Level vs GPA Relationship Chart
  const getEducationLevelVsGPA = () => {
    const filteredEducations = getFilteredEducations()
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "scatter" as const, height: 350 },
          noData: { text: "No data available" },
        },
      }
    }

    const levelGPAData = filteredEducations
      .filter((education) => education.education_tingkat && education.education_ipk)
      .map((education) => ({
        x: education.education_tingkat,
        y: Number.parseFloat(education.education_ipk),
        name: accounts.find((acc) => acc.id === education.account_id)?.account_name || "Unknown",
        major: education.education_jurusan || "Unknown",
      }))
      .filter((item) => !isNaN(item.y))

    // Group by education level for better visualization
    const levels = ["D3", "S1", "S2", "S3"]
    const series = levels.map((level) => ({
      name: level,
      data: levelGPAData.filter((item) => item.x === level),
    }))

    return {
      series,
      options: {
        chart: {
          type: "scatter" as const,
          height: 350,
          toolbar: { show: false },
        },
        xaxis: {
          categories: levels,
          title: {
            text: "Education Level",
            style: {
              fontWeight: "600",
            },
          },
          labels: {
            style: {
              fontSize: "12px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "GPA",
            style: {
              fontWeight: "600",
            },
          },
          min: 2.5,
          max: 4.0,
          labels: {
            style: {
              fontSize: "11px",
            },
          },
        },
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
        title: {
          text: "Education Level vs GPA Relationship",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          custom: ({ series, seriesIndex, dataPointIndex, w }) => {
            if (seriesIndex >= 0 && dataPointIndex >= 0) {
              const levelData = levelGPAData.filter((item) => item.x === levels[seriesIndex])
              const data = levelData[dataPointIndex]
              if (data) {
                return `<div class="p-3 bg-white border rounded-lg shadow-lg">
                  <strong class="text-gray-800 text-sm">${data.name}</strong><br/>
                  <span class="text-blue-600 text-xs">Level: ${data.x}</span><br/>
                  <span class="text-green-600 text-xs">GPA: ${data.y}</span><br/>
                  <span class="text-purple-600 text-xs">Major: ${data.major}</span>
                </div>`
              }
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

  // High GPA Graduates by Major Chart
  const getHighGPAGraduatesByMajor = () => {
    const filteredEducations = getFilteredEducations()
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        series: [{ name: "High GPA Graduates", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const highGPAEducations = filteredEducations.filter((edu) => {
      const gpa = Number.parseFloat(edu.education_ipk)
      return !isNaN(gpa) && gpa > 3.5
    })

    const majorCounts = highGPAEducations.reduce(
      (acc, education) => {
        const major = education.education_jurusan || "Unknown"
        acc[major] = (acc[major] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedMajors = Object.entries(majorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)

    const categories = sortedMajors.map(([major, _]) => major)
    const data = sortedMajors.map(([_, count]) => count)

    return {
      series: [
        {
          name: "High GPA Graduates",
          data,
        },
      ],
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
            text: "Number of High GPA Graduates",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#06B6D4"],
        title: {
          text: "High GPA (>3.5) Graduates by Major",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} graduates`,
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
    const filteredEducations = getFilteredEducations()
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        totalEducations: 0,
        uniqueInstitutions: 0,
        avgGPA: "0.00",
        highGPACount: 0,
        multipleDegreesCount: 0,
      }
    }

    const totalEducations = filteredEducations.length
    const uniqueInstitutions = new Set(filteredEducations.map((edu) => edu.education_institusi).filter(Boolean)).size

    const validGPAs = filteredEducations.map((edu) => Number.parseFloat(edu.education_ipk)).filter((gpa) => !isNaN(gpa))

    const avgGPA =
      validGPAs.length > 0 ? (validGPAs.reduce((sum, gpa) => sum + gpa, 0) / validGPAs.length).toFixed(2) : "0.00"

    const highGPACount = validGPAs.filter((gpa) => gpa > 3.5).length

    const accountsToUse = propFilteredAccounts || accounts
    const multipleDegreesCount = accountsToUse.filter(
      (acc) => educations.filter((edu) => edu.account_id === acc.id).length > 1,
    ).length

    return {
      totalEducations,
      uniqueInstitutions,
      avgGPA,
      highGPACount,
      multipleDegreesCount,
    }
  }

  const stats = getSummaryStats()

  const clearFilters = () => {
    setSelectedLevel(null)
    setSelectedMajor(null)
    setSelectedInstitution(null)
    onFilterChange?.({ level: null, major: null, institution: null })
  }

  return (
    <div className="space-y-6">
      {/* Filter Status and Clear Button */}
      {(selectedLevel || selectedMajor || selectedInstitution) && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-blue-800">Active Filters:</span>
                {selectedLevel && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {selectedLevel}
                  </Badge>
                )}
                {selectedMajor && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    {selectedMajor}
                  </Badge>
                )}
                {selectedInstitution && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    {selectedInstitution.length > 20
                      ? selectedInstitution.substring(0, 20) + "..."
                      : selectedInstitution}
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
                <p className="text-sm font-medium text-blue-700">Total Records</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEducations}</p>
                <p className="text-xs text-blue-600 mt-1">Education records</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Institutions</p>
                <p className="text-2xl font-bold text-green-600">{stats.uniqueInstitutions}</p>
                <p className="text-xs text-green-600 mt-1">Different schools</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Average GPA</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgGPA}</p>
                <p className="text-xs text-purple-600 mt-1">Overall average</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">High GPA &gt;3.5</p>
                <p className="text-2xl font-bold text-orange-600">{stats.highGPACount}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {stats.totalEducations > 0 ? ((stats.highGPACount / stats.totalEducations) * 100).toFixed(1) : 0}% of
                  total
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-700">Multiple Degrees</p>
                <p className="text-2xl font-bold text-pink-600">{stats.multipleDegreesCount}</p>
                <p className="text-xs text-pink-600 mt-1">Employees</p>
              </div>
              <Users className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* First Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Education Level Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Education Level Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Click segments to filter by education level. Shows distribution of degrees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getEducationLevelDistribution().options}
              series={getEducationLevelDistribution().series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Most Common Majors */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-green-600" />
              Most Common Majors
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by major. Shows top 8 most studied fields.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getMostCommonMajors().options}
              series={getMostCommonMajors().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Graduation Year Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Graduation Year Trends
            </CardTitle>
            <CardDescription className="text-sm">Timeline showing graduation patterns over the years.</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getGraduationYearDistribution().options}
              series={getGraduationYearDistribution().series}
              type="line"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Second Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPA Distribution by Level 
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-indigo-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              GPA Distribution by Level
            </CardTitle>
            <CardDescription className="text-sm">
              Box plot showing GPA ranges across different education levels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getGPADistributionByLevel().options}
              series={getGPADistributionByLevel().series}
              type="boxPlot"
              height={350}
            />
          </CardContent>
        </Card>
        */}

        {/* Top Institutions */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-orange-600" />
              Top Institutions
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by institution. Shows top 6 universities/colleges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getTopInstitutions().options}
              series={getTopInstitutions().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Multiple Degrees */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-red-600" />
              Multiple Degrees Analysis
            </CardTitle>
            <CardDescription className="text-sm">
              Distribution of employees with single vs multiple degrees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getMultipleDegreesChart().options}
              series={getMultipleDegreesChart().series}
              type="pie"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Third Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average GPA by Institution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-pink-50 border-pink-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-pink-600" />
              Average GPA by Institution
            </CardTitle>
            <CardDescription className="text-sm">
              Top 10 institutions ranked by average GPA of their alumni.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getAverageGPAByInstitution().options}
              series={getAverageGPAByInstitution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Education Level vs GPA */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-cyan-50 border-cyan-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              Education Level vs GPA
            </CardTitle>
            <CardDescription className="text-sm">
              Scatter plot showing relationship between education level and academic performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getEducationLevelVsGPA().options}
              series={getEducationLevelVsGPA().series}
              type="scatter"
              height={350}
            />
          </CardContent>
        </Card>

        {/* High GPA Graduates by Major */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-teal-50 border-teal-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-teal-600" />
              High GPA Graduates by Major
            </CardTitle>
            <CardDescription className="text-sm">
              Number of high-performing graduates (GPA &gt;3.5) by field of study.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getHighGPAGraduatesByMajor().options}
              series={getHighGPAGraduatesByMajor().series}
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
            Educational Insights & Recommendations
          </CardTitle>
          <CardDescription>Data-driven insights from education analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <h4 className="font-semibold text-gray-900">Academic Excellence</h4>
              </div>
              <p className="text-sm text-gray-700">
                {stats.totalEducations > 0 ? ((stats.highGPACount / stats.totalEducations) * 100).toFixed(1) : 0}% of
                employees have high GPA &gt;3.5
              </p>
              <p className="text-xs text-gray-500 mt-1">Strong academic foundation in the workforce</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-green-500" />
                <h4 className="font-semibold text-gray-900">Educational Diversity</h4>
              </div>
              <p className="text-sm text-gray-700">Alumni from {stats.uniqueInstitutions} different institutions</p>
              <p className="text-xs text-gray-500 mt-1">Diverse educational backgrounds</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <h4 className="font-semibold text-gray-900">Continuous Learning</h4>
              </div>
              <p className="text-sm text-gray-700">{stats.multipleDegreesCount} employees have multiple degrees</p>
              <p className="text-xs text-gray-500 mt-1">Commitment to lifelong learning</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
