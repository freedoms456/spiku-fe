"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, Shield, TrendingUp, Users, AlertTriangle, BarChart3, Calendar, Building, Target, Award, UserCheck } from "lucide-react"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface AuditAnalyticsProps {
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

export default function AuditAnalytics({
  filteredAccounts: propFilteredAccounts = [],
  onFilterChange,
}: AuditAnalyticsProps) {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  // Get all audit records
  const getAllAuditRecords = useMemo(() => {
    const allRecords: any[] = []
    
    propFilteredAccounts?.forEach(account => {
      if (Array.isArray(account.pemeriksaan) && account.pemeriksaan.length > 0) {
        account.pemeriksaan.forEach(audit => {
          allRecords.push({
            ...audit,
            employee_name: account.account_name,
            employee_id: account.id,
          })
        })
      }
    })

    return allRecords
  }, [propFilteredAccounts])

  // Get filtered audit records
  const getFilteredAuditRecords = useMemo(() => {
    let filtered = getAllAuditRecords

    if (selectedEntity) {
      filtered = filtered.filter(record => record.entitas === selectedEntity)
    }

    if (selectedType) {
      filtered = filtered.filter(record => record.jenis_pemeriksaan === selectedType)
    }

    if (selectedRole) {
      filtered = filtered.filter(record => record.pekerjaan === selectedRole)
    }

    if (selectedYear) {
      filtered = filtered.filter(record => {
        if (!record.tanggal_pemeriksaan) return false
        const [, , year] = record.tanggal_pemeriksaan.split("-")
        return year === selectedYear
      })
    }

    if (selectedEmployee) {
      filtered = filtered.filter(record => record.employee_name === selectedEmployee)
    }

    return filtered
  }, [getAllAuditRecords, selectedEntity, selectedType, selectedRole, selectedYear, selectedEmployee])

  // Audit by Entity Chart
  const getAuditsByEntity = () => {
    const records = getAllAuditRecords
    if (records.length === 0) {
      return {
        series: [{ name: "Audit Count", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No audit data available" },
        },
      }
    }
  
    // Kelompokkan dulu berdasarkan audit.name dan tahun yang sama
    const uniqueAudits = records.reduce((acc, record) => {
      const auditName = record.audit?.entitas || "Unknown Audit"
      const year = new Date(record.tanggal_pemeriksaan).getFullYear()
      const key = `${auditName}_${year}`
      
      if (!acc[key]) {
        acc[key] = {
          auditName,
          year,
          entity: record.entitas || "Unknown",
          // Ambil data pertama untuk referensi
          firstRecord: record
        }
      }
      
      return acc
    }, {} as Record<string, { auditName: string; year: number; entity: string; firstRecord: any }>)
  
    // Sekarang hitung per entitas berdasarkan unique audit
    const entityCounts = Object.values(uniqueAudits).reduce((acc, audit) => {
      const entity = audit.entity
      acc[entity] = (acc[entity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
 
    const categories = Object.keys(entityCounts).sort((a, b) => entityCounts[b] - entityCounts[a])
    const data = categories.map(entity => entityCounts[entity])
  
    console.log(categories)
    return {
      series: [{
        name: "Audit Count",
        data,
      }],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const entity = categories[config.dataPointIndex]
                const newEntity = selectedEntity === entity ? null : entity
                setSelectedEntity(newEntity)
                onFilterChange?.({ entity: newEntity, type: selectedType, role: selectedRole, year: selectedYear, employee: selectedEmployee })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: true,
            barHeight: "70%",
            colors: {
              ranges: [
                { from: 0, to: 2, color: "#10B981" },
                { from: 3, to: 5, color: "#3B82F6" },
                { from: 6, to: 10, color: "#F59E0B" },
                { from: 11, to: 100, color: "#EF4444" }
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
          text: "Audits by Entity",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} audits`,
          },
        },
      },
    }
  }

  // Audit Types Distribution
  const getAuditTypesDistribution = () => {
    const records = getAllAuditRecords
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

    const typeCounts = records.reduce((acc, record) => {
      const type = record.jenis_pemeriksaan || "Unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const labels = Object.keys(typeCounts)
    const series = Object.values(typeCounts)
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
                const type = labels[config.dataPointIndex]
                const newType = selectedType === type ? null : type
                setSelectedType(newType)
                onFilterChange?.({ entity: selectedEntity, type: newType, role: selectedRole, year: selectedYear, employee: selectedEmployee })
              }
            },
          },
        },
        labels,
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"],
        title: {
          text: "Audit Types Distribution",
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
            formatter: (val: number) => `${val} audits (${((val/total)*100).toFixed(1)}%)`,
          },
        },
      },
    }
  }

  // Roles Distribution Chart
  const getRolesDistribution = () => {
    const records = getAllAuditRecords
    if (records.length === 0) {
      return {
        series: [{ name: "Role Count", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const roleCounts = records.reduce((acc, record) => {
      const role = record.pekerjaan || "Unknown"
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const categories = Object.keys(roleCounts).sort((a, b) => roleCounts[b] - roleCounts[a])
    const data = categories.map(role => roleCounts[role])

    return {
      series: [{
        name: "Role Count",
        data,
      }],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const role = categories[config.dataPointIndex]
                const newRole = selectedRole === role ? null : role
                setSelectedRole(newRole)
                onFilterChange?.({ entity: selectedEntity, type: selectedType, role: newRole, year: selectedYear, employee: selectedEmployee })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            columnWidth: "75%",
            colors: {
              ranges: [
                { from: 0, to: 2, color: "#10B981" },
                { from: 3, to: 5, color: "#3B82F6" },
                { from: 6, to: 10, color: "#F59E0B" },
                { from: 11, to: 100, color: "#EF4444" }
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
            rotate: -45,
            style: {
              fontSize: "11px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Number of Assignments",
            style: { fontWeight: "600" },
          },
        },
        title: {
          text: "Audit Roles Distribution",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} assignments`,
          },
        },
      },
    }
  }

  // Audit Timeline Chart
  const getAuditTimeline = () => {
    const records = getAllAuditRecords
    if (records.length === 0) {
      return {
        series: [{ name: "Audits", data: [] }],
        options: {
          chart: { type: "area" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const yearCounts = records.reduce((acc, record) => {
      if (record.tanggal_pemeriksaan) {
        const [, , year] = record.tanggal_pemeriksaan.split("-")
        acc[year] = (acc[year] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const sortedYears = Object.keys(yearCounts).sort()
    const data = sortedYears.map(year => yearCounts[year])

    return {
      series: [{
        name: "Audits",
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
                onFilterChange?.({ entity: selectedEntity, type: selectedType, role: selectedRole, year: newYear, employee: selectedEmployee })
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
            text: "Number of Audits",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Audit Timeline by Year",
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
            formatter: (val: number) => `${val} audits`,
          },
        },
      },
    }
  }

  // Most Active Auditors Chart
  const getMostActiveAuditors = () => {
    const records = getAllAuditRecords
    if (records.length === 0) {
      return {
        series: [{ name: "Audit Count", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const auditorCounts = records.reduce((acc, record) => {
      const name = record.employee_name || "Unknown"
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get top 10 most active auditors
    const sortedAuditors = Object.entries(auditorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)

    const categories = sortedAuditors.map(([name]) => name)
    const data = sortedAuditors.map(([, count]) => count)

    return {
      series: [{
        name: "Audit Count",
        data,
      }],
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
                onFilterChange?.({ entity: selectedEntity, type: selectedType, role: selectedRole, year: selectedYear, employee: newEmployee })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: true,
            barHeight: "70%",
            colors: {
              ranges: [
                { from: 0, to: 2, color: "#10B981" },
                { from: 3, to: 5, color: "#3B82F6" },
                { from: 6, to: 10, color: "#F59E0B" },
                { from: 11, to: 100, color: "#EF4444" }
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
          text: "Top 10 Most Active Auditors",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} audit assignments`,
          },
        },
      },
    }
  }

  // Auditor-Entity Matrix Table
  const getAuditorEntityMatrix = () => {
    const records = getAllAuditRecords
    if (records.length === 0) {
      return { auditors: [], entities: [], matrix: {} }
    }

    // Create matrix data
    const matrix = records.reduce((acc, record) => {
      const auditor = record.employee_name || "Unknown"
      const entity = record.entitas || "Unknown"
      
      if (!acc[auditor]) acc[auditor] = {}
      acc[auditor][entity] = (acc[auditor][entity] || 0) + 1
      
      return acc
    }, {} as Record<string, Record<string, number>>)

    // Get top entities (columns) and auditors (rows)
    const entityCounts = records.reduce((acc, record) => {
      const entity = record.entitas || "Unknown"
      acc[entity] = (acc[entity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const auditorCounts = records.reduce((acc, record) => {
      const auditor = record.employee_name || "Unknown"
      acc[auditor] = (acc[auditor] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const entities = Object.keys(entityCounts)
      .sort((a, b) => entityCounts[b] - entityCounts[a])
      .slice(0, 8) // Top 8 entities as columns

    const auditors = Object.keys(auditorCounts)
      .sort((a, b) => auditorCounts[b] - auditorCounts[a])
      .slice(0, 15) // Top 15 auditors as rows

    return { auditors, entities, matrix }
  }

  // Summary Statistics
  const getSummaryStats = () => {
    const allRecords = getAllAuditRecords
    const filtered = getFilteredAuditRecords

    if (allRecords.length === 0) {
      return {
        totalAudits: 0,
        uniqueEntities: 0,
        uniqueTypes: 0,
        uniqueRoles: 0,
        uniqueAuditors: 0,
        avgAuditsPerAuditor: 0,
      }
    }

    const uniqueEntities = new Set(allRecords.map(record => record.entitas)).size
    const uniqueTypes = new Set(allRecords.map(record => record.jenis_pemeriksaan)).size
    const uniqueRoles = new Set(allRecords.map(record => record.pekerjaan)).size
    const uniqueAuditors = new Set(allRecords.map(record => record.employee_name)).size
    const avgAuditsPerAuditor = uniqueAuditors > 0 ? Math.round((allRecords.length / uniqueAuditors) * 10) / 10 : 0

    return {
      totalAudits: filtered.length,
      uniqueEntities,
      uniqueTypes,
      uniqueRoles,
      uniqueAuditors,
      avgAuditsPerAuditor,
    }
  }

  const stats = getSummaryStats()

  const clearFilters = () => {
    setSelectedEntity(null)
    setSelectedType(null)
    setSelectedRole(null)
    setSelectedYear(null)
    setSelectedEmployee(null)
    onFilterChange?.({ entity: null, type: null, role: null, year: null, employee: null })
  }

  return (
    <div className="space-y-6">
      {/* Filter Status and Clear Button */}
      {(selectedEntity || selectedType || selectedRole || selectedYear || selectedEmployee) && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-blue-800">Active Filters:</span>
                {selectedEntity && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                    <Building className="w-3 h-3 mr-1" />
                    {selectedEntity}
                  </Badge>
                )}
                {selectedType && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
                    <Target className="w-3 h-3 mr-1" />
                    {selectedType}
                  </Badge>
                )}
                {selectedRole && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors">
                    <Shield className="w-3 h-3 mr-1" />
                    {selectedRole}
                  </Badge>
                )}
                {selectedYear && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors">
                    <Calendar className="w-3 h-3 mr-1" />
                    {selectedYear}
                  </Badge>
                )}
                {selectedEmployee && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800 hover:bg-pink-200 transition-colors">
                    <UserCheck className="w-3 h-3 mr-1" />
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
                <p className="text-sm font-medium text-blue-700">Total Audits</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalAudits}</p>
                <p className="text-xs text-blue-600 mt-1">Assignments</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Entities</p>
                <p className="text-2xl font-bold text-green-600">{stats.uniqueEntities}</p>
                <p className="text-xs text-green-600 mt-1">Audited</p>
              </div>
              <Building className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Audit Types</p>
                <p className="text-2xl font-bold text-purple-600">{stats.uniqueTypes}</p>
                <p className="text-xs text-purple-600 mt-1">Different types</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Roles</p>
                <p className="text-2xl font-bold text-orange-600">{stats.uniqueRoles}</p>
                <p className="text-xs text-orange-600 mt-1">Different roles</p>
              </div>
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-700">Auditors</p>
                <p className="text-2xl font-bold text-pink-600">{stats.uniqueAuditors}</p>
                <p className="text-xs text-pink-600 mt-1">Active</p>
              </div>
              <Users className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700">Avg per Auditor</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.avgAuditsPerAuditor}</p>
                <p className="text-xs text-indigo-600 mt-1">Audits</p>
              </div>
              <Award className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audits by Entity */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Audits by Entity
            </CardTitle>
            <CardDescription className="text-sm">
              Distribution of audits across different entities. Colors indicate frequency levels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getAuditsByEntity().options}
              series={getAuditsByEntity().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Audit Types Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-green-600" />
              Audit Types Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Types of audits conducted. Click segments to filter by audit type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getAuditTypesDistribution().options}
              series={getAuditTypesDistribution().series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Roles Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-purple-600" />
              Audit Roles Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Distribution of audit roles/responsibilities. Shows specialization patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getRolesDistribution().options}
              series={getRolesDistribution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Audit Timeline */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
              Audit Timeline
            </CardTitle>
            <CardDescription className="text-sm">
              Audit activity over time. Shows workload trends and patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getAuditTimeline().options}
              series={getAuditTimeline().series}
              type="area"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Most Active Auditors */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-pink-50 border-pink-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-pink-600" />
              Top 10 Most Active Auditors
            </CardTitle>
            <CardDescription className="text-sm">
              Employees with most audit assignments. Colors indicate activity levels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getMostActiveAuditors().options}
              series={getMostActiveAuditors().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Auditor-Entity Matrix */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-indigo-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Auditor-Entity Matrix
            </CardTitle>
            <CardDescription className="text-sm">
              Matrix showing audit assignments per auditor across different entities. Numbers indicate audit counts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[350px] border rounded-lg">
              {(() => {
                const { auditors, entities, matrix } = getAuditorEntityMatrix()
                
                if (auditors.length === 0) {
                  return (
                    <div className="p-8 text-center text-gray-500">
                      <ClipboardCheck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No audit data available</p>
                    </div>
                  )
                }

                return (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gradient-to-r from-indigo-100 to-blue-100 z-10">
                      <tr>
                        <th className="text-left p-3 font-semibold text-indigo-800 border-r border-indigo-200 min-w-[120px] sticky left-0 bg-gradient-to-r from-indigo-100 to-blue-100">
                          Auditor
                        </th>
                        {entities.map((entity, index) => (
                          <th 
                            key={index}
                            className="text-center p-2 font-medium text-indigo-700 border-r border-indigo-200 last:border-r-0 min-w-[100px] max-w-[120px]"
                            title={entity}
                          >
                            <div className="truncate">
                              {entity.length > 12 ? `${entity.substring(0, 12)}...` : entity}
                            </div>
                          </th>
                        ))}
                        <th className="text-center p-3 font-semibold text-indigo-800 min-w-[80px]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditors.map((auditor, auditorIndex) => {
                        const rowTotal = entities.reduce((sum, entity) => 
                          sum + (matrix[auditor]?.[entity] || 0), 0
                        )
                        
                        return (
                          <tr key={auditorIndex} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                            <td className="p-3 font-medium text-gray-800 border-r border-gray-200 sticky left-0 bg-white hover:bg-blue-50/50 transition-colors min-w-[120px]">
                              <div className="truncate" title={auditor}>
                                {auditor}
                              </div>
                            </td>
                            {entities.map((entity, entityIndex) => {
                              const count = matrix[auditor]?.[entity] || 0
                              return (
                                <td 
                                  key={entityIndex}
                                  className="text-center p-2 border-r border-gray-100 last:border-r-0"
                                >
                                  {count > 0 ? (
                                    <span 
                                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white ${
                                        count >= 5 ? 'bg-red-500' :
                                        count >= 3 ? 'bg-orange-500' :
                                        count >= 2 ? 'bg-blue-500' :
                                        'bg-green-500'
                                      }`}
                                      title={`${auditor} has ${count} audit(s) in ${entity}`}
                                    >
                                      {count}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300 text-xs">-</span>
                                  )}
                                </td>
                              )
                            })}
                            <td className="text-center p-3 font-bold border-l border-gray-200">
                              <span 
                                className={`inline-flex items-center justify-center w-10 h-8 rounded-full text-sm font-bold text-white ${
                                  rowTotal >= 10 ? 'bg-red-600' :
                                  rowTotal >= 6 ? 'bg-orange-600' :
                                  rowTotal >= 3 ? 'bg-blue-600' :
                                  'bg-green-600'
                                }`}
                              >
                                {rowTotal}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                      
                      {/* Column Totals Row */}
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-indigo-200 font-semibold">
                        <td className="p-3 text-indigo-800 border-r border-gray-200 sticky left-0 bg-gradient-to-r from-gray-50 to-blue-50">
                          Total
                        </td>
                        {entities.map((entity, entityIndex) => {
                          const columnTotal = auditors.reduce((sum, auditor) => 
                            sum + (matrix[auditor]?.[entity] || 0), 0
                          )
                          return (
                            <td key={entityIndex} className="text-center p-2 border-r border-gray-100 last:border-r-0">
                              <span 
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white ${
                                  columnTotal >= 10 ? 'bg-red-600' :
                                  columnTotal >= 6 ? 'bg-orange-600' :
                                  columnTotal >= 3 ? 'bg-blue-600' :
                                  'bg-green-600'
                                }`}
                              >
                                {columnTotal}
                              </span>
                            </td>
                          )
                        })}
                        <td className="text-center p-3 border-l border-gray-200">
                          <span className="inline-flex items-center justify-center w-10 h-8 rounded-full text-sm font-bold text-white bg-indigo-600">
                            {auditors.reduce((sum, auditor) => 
                              sum + entities.reduce((entitySum, entity) => 
                                entitySum + (matrix[auditor]?.[entity] || 0), 0
                              ), 0
                            )}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )
              })()}
            </div>
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
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-blue-700">Audit Coverage</p>
                  <p className="text-sm text-gray-600">
                    {stats.uniqueEntities} entities covered across {stats.totalAudits} audits shows {
                      stats.uniqueEntities > 10 ? 'comprehensive audit coverage' : 'limited coverage that may need expansion'
                    }. Consider expanding to underrepresented areas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-green-700">Auditor Workload</p>
                  <p className="text-sm text-gray-600">
                    Average of {stats.avgAuditsPerAuditor} audits per auditor indicates {
                      stats.avgAuditsPerAuditor > 5 ? 'heavy workload that may affect quality' :
                      stats.avgAuditsPerAuditor > 3 ? 'balanced workload distribution' :
                      'light workload with capacity for more assignments'
                    }.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-purple-700">Role Specialization</p>
                  <p className="text-sm text-gray-600">
                    {stats.uniqueRoles} different audit roles suggest {
                      stats.uniqueRoles > 5 ? 'good specialization and role clarity' : 'potential need for more specialized roles'
                    }. Monitor for role overlap or gaps.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-orange-700">Audit Types Diversity</p>
                  <p className="text-sm text-gray-600">
                    {stats.uniqueTypes} audit types indicate {
                      stats.uniqueTypes > 4 ? 'comprehensive audit methodology' : 'limited audit scope'
                    }. Ensure all critical areas are covered by appropriate audit types.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-red-700">Resource Optimization</p>
                  <p className="text-sm text-gray-600">
                    Monitor high-frequency entities and roles for potential process improvements. Consider cross-training auditors in multiple roles for flexibility.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-indigo-700">Quality Assurance</p>
                  <p className="text-sm text-gray-600">
                    High-activity auditors should mentor newcomers. Ensure consistent audit quality across different entities and maintain professional development programs.
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