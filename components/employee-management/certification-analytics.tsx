"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BadgeIcon as Certificate,
  Award,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Activity,
} from "lucide-react"
import { accounts, certifications } from "@/lib/employee-management-data"
import dynamic from "next/dynamic"
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface CertificationAnalyticsProps {
  filteredCertifications?: any[]
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

export default function CertificationAnalytics({
  filteredCertifications: propFilteredCertifications,
  filteredAccounts: propFilteredAccounts,
  onFilterChange,
}: CertificationAnalyticsProps = {}) {
  const [selectedCertType, setSelectedCertType] = useState<string | null>(null)
  const [selectedIssuer, setSelectedIssuer] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  // Get filtered certifications based on selections
  const getFilteredCertifications = () => {
    if (propFilteredCertifications) {
      return propFilteredCertifications
    }

    let filtered = certifications

    if (selectedCertType) {
      filtered = filtered.filter((cert) => cert.certification_nama === selectedCertType)
    }

    if (selectedIssuer) {
      filtered = filtered.filter((cert) => cert.certification_penerbit === selectedIssuer)
    }

    if (selectedEmployee) {
      const employee = propFilteredAccounts
        ? propFilteredAccounts.find((acc) => acc.account_name === selectedEmployee)
        : accounts.find((acc) => acc.account_name === selectedEmployee)
      if (employee) {
        filtered = filtered.filter((cert) => cert.account_id === employee.id)
      }
    }

    return filtered
  }

  // Helper function to check if certificate is active
  const isCertificateActive = (expiryDate: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) > new Date()
  }

  // Helper function to get months until expiry
  const getMonthsUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return -1
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
    return diffMonths
  }

  // 1. Certifications by Type Chart
  const getCertificationsByType = () => {
    const filteredCerts = getFilteredCertifications()
    if (!filteredCerts || filteredCerts.length === 0) {
      return {
        series: [{ name: "Certifications", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const typeCounts = filteredCerts.reduce(
      (acc, cert) => {
        const type = cert.certification_nama || "Unknown"
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedTypes = Object.entries(typeCounts)
      .map(([k, v]) => [k, Number(v)] as [string, number])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const categories = sortedTypes.map(([type, _]) => (type.length > 25 ? type.substring(0, 25) + "..." : type))
    const data = sortedTypes.map(([_, count]) => count)

    return {
      series: [
        {
          name: "Certifications",
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
              if (config && config.dataPointIndex >= 0 && sortedTypes[config.dataPointIndex]) {
                const certType = sortedTypes[config.dataPointIndex][0]
                const newCertType = selectedCertType === certType ? null : certType
                setSelectedCertType(newCertType)
                onFilterChange?.({ certType: newCertType, issuer: selectedIssuer, employee: selectedEmployee })
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
              fontSize: "10px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Certificate Types",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#3B82F6"],
        title: {
          text: "Certifications by Type",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} certificates`,
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

  // 2. Certifications by Issuer Chart
  const getCertificationsByIssuer = () => {
    const filteredCerts = getFilteredCertifications()
    if (!filteredCerts || filteredCerts.length === 0) {
      return {
        series: [{ name: "Certificates Issued", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const issuerCounts = filteredCerts.reduce(
      (acc, cert) => {
        const issuer = cert.certification_penerbit || "Unknown"
        acc[issuer] = (acc[issuer] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

const sortedIssuers = Object.entries(issuerCounts)
  .map(([k, v]) => [k, Number(v)] as [string, number])
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8);

    const categories = sortedIssuers.map(([issuer, _]) => issuer)
    const data = sortedIssuers.map(([_, count]) => count)

    return {
      series: [
        {
          name: "Certificates Issued",
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
                const issuer = categories[config.dataPointIndex]
                const newIssuer = selectedIssuer === issuer ? null : issuer
                setSelectedIssuer(newIssuer)
                onFilterChange?.({ certType: selectedCertType, issuer: newIssuer, employee: selectedEmployee })
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
            text: "Number of Certificates",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#10B981"],
        title: {
          text: "Certifications by Issuer",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} certificates`,
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

  // 3. Active vs Expired Certificates Chart
  const getActiveVsExpiredChart = () => {
    const filteredCerts = getFilteredCertifications()
    if (!filteredCerts || filteredCerts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "pie" as const, height: 350 },
          labels: [],
          noData: { text: "No data available" },
        },
      }
    }

    const activeCerts = filteredCerts.filter((cert) => isCertificateActive(cert.certification_tanggal_berakhir)).length
    const expiredCerts = filteredCerts.length - activeCerts

    return {
      series: [activeCerts, expiredCerts],
      options: {
        chart: {
          type: "pie" as const,
          height: 350,
        },
        labels: ["Active", "Expired"],
        colors: ["#10B981", "#EF4444"],
        title: {
          text: "Active vs Expired Certificates",
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
            formatter: (val: number) => `${val} certificates`,
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
          formatter: (val: number) => `${val.toFixed(1)}%`,
        },
        plotOptions: {
          pie: {
            donut: {
              size: "60%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "Total",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  formatter: () => filteredCerts.length.toString(),
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
      },
    }
  }

  // 4. Certificates Issued by Year Timeline
  const getCertificatesByYearTimeline = () => {
    const filteredCerts = getFilteredCertifications()
    if (!filteredCerts || filteredCerts.length === 0) {
      return {
        series: [{ name: "Certificates Issued", data: [] }],
        options: {
          chart: { type: "line" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const yearCounts = filteredCerts.reduce(
      (acc, cert) => {
        if (cert.certification_tanggal_terbit) {
          const year = new Date(cert.certification_tanggal_terbit).getFullYear().toString()
          acc[year] = (acc[year] || 0) + 1
        }
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
          name: "Certificates Issued",
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
          hover: { size: 12 },
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
            text: "Number of Certificates",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Certificate Issuance Timeline",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} certificates`,
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

  // 5. Certificates per Employee Chart
  const getCertificatesPerEmployee = () => {
    const accountsToUse = propFilteredAccounts || accounts
    if (!accountsToUse || accountsToUse.length === 0) {
      return {
        series: [{ name: "Certificates", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const employeeCertCounts = accountsToUse
      .map((account) => {
        const certCount = (propFilteredCertifications || certifications).filter(
          (cert) => cert.account_id === account.id,
        ).length
        return {
          name: account.account_name || "Unknown",
          count: certCount,
        }
      })
      .filter((emp) => emp.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const categories = employeeCertCounts.map((emp) =>
      emp.name.length > 15 ? emp.name.substring(0, 15) + "..." : emp.name,
    )
    const data = employeeCertCounts.map((emp) => emp.count)

    return {
      series: [
        {
          name: "Certificates",
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
              if (config && config.dataPointIndex >= 0 && employeeCertCounts[config.dataPointIndex]) {
                const employee = employeeCertCounts[config.dataPointIndex].name
                const newEmployee = selectedEmployee === employee ? null : employee
                setSelectedEmployee(newEmployee)
                onFilterChange?.({ certType: selectedCertType, issuer: selectedIssuer, employee: newEmployee })
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
            text: "Number of Certificates",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#F59E0B"],
        title: {
          text: "Certificates per Employee (Top 10)",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} certificates`,
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

  // 6. Certificates Expiring Soon Chart
  const getCertificatesExpiringSoon = (): {
  series: ApexAxisChartSeries;
  options: ApexOptions;
} => {
  const certsToUse = propFilteredCertifications || certifications;

  if (!certsToUse || certsToUse.length === 0) {
    return {
      series: [{ name: "Expiring Certificates", data: [] }],
      options: {
        chart: { type: "bar", height: 350 },
        xaxis: { categories: [] },
        noData: { text: "No data available" },
      },
    };
  }

  // contoh jika ada data:
  return {
    series: [{ name: "Expiring Certificates", data: [10, 20, 15] }],
    options: {
      chart: { type: "bar", height: 350 },
      xaxis: { categories: ["Jan", "Feb", "Mar"] },
    },
  };
};

  // 7. Top Employees with Most Active Certifications
  const getTopEmployeesActiveChart = () => {
    const accountsToUse = propFilteredAccounts || accounts
    const certsToUse = propFilteredCertifications || certifications

    if (!accountsToUse || accountsToUse.length === 0) {
      return {
        series: [{ name: "Active Certificates", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const employeeActiveCerts = accountsToUse
      .map((account) => {
        const activeCertCount = certsToUse.filter(
          (cert) => cert.account_id === account.id && isCertificateActive(cert.certification_tanggal_berakhir),
        ).length
        return {
          name: account.account_name || "Unknown",
          count: activeCertCount,
        }
      })
      .filter((emp) => emp.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    const categories = employeeActiveCerts.map((emp) =>
      emp.name.length > 20 ? emp.name.substring(0, 20) + "..." : emp.name,
    )
    const data = employeeActiveCerts.map((emp) => emp.count)

    return {
      series: [
        {
          name: "Active Certificates",
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
              fontSize: "10px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Employees",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#06B6D4"],
        title: {
          text: "Top Employees with Most Active Certifications",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} active certificates`,
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
    const filteredCerts = getFilteredCertifications()
    if (!filteredCerts || filteredCerts.length === 0) {
      return {
        totalCertifications: 0,
        activeCertifications: 0,
        expiredCertifications: 0,
        expiringSoon: 0,
        uniqueIssuers: 0,
        uniqueTypes: 0,
      }
    }

    const totalCertifications = filteredCerts.length
    const activeCertifications = filteredCerts.filter((cert) =>
      isCertificateActive(cert.certification_tanggal_berakhir),
    ).length
    const expiredCertifications = totalCertifications - activeCertifications
    const expiringSoon = filteredCerts.filter((cert) => {
      const monthsUntil = getMonthsUntilExpiry(cert.certification_tanggal_berakhir)
      return monthsUntil > 0 && monthsUntil <= 6
    }).length
    const uniqueIssuers = new Set(filteredCerts.map((cert) => cert.certification_penerbit).filter(Boolean)).size
    const uniqueTypes = new Set(filteredCerts.map((cert) => cert.certification_nama).filter(Boolean)).size

    return {
      totalCertifications,
      activeCertifications,
      expiredCertifications,
      expiringSoon,
      uniqueIssuers,
      uniqueTypes,
    }
  }

  const stats = getSummaryStats()

  const clearFilters = () => {
    setSelectedCertType(null)
    setSelectedIssuer(null)
    setSelectedEmployee(null)
    onFilterChange?.({ certType: null, issuer: null, employee: null })
  }

  return (
    <div className="space-y-6">
      {/* Filter Status and Clear Button */}
      {(selectedCertType || selectedIssuer || selectedEmployee) && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-blue-800">Active Filters:</span>
                {selectedCertType && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                    <Certificate className="w-3 h-3 mr-1" />
                    {selectedCertType.length > 20 ? selectedCertType.substring(0, 20) + "..." : selectedCertType}
                  </Badge>
                )}
                {selectedIssuer && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    {selectedIssuer}
                  </Badge>
                )}
                {selectedEmployee && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
                  >
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
                <p className="text-sm font-medium text-blue-700">Total Certificates</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalCertifications}</p>
                <p className="text-xs text-blue-600 mt-1">All records</p>
              </div>
              <Certificate className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCertifications}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalCertifications > 0
                    ? ((stats.activeCertifications / stats.totalCertifications) * 100).toFixed(1)
                    : 0}
                  % of total
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expiredCertifications}</p>
                <p className="text-xs text-red-600 mt-1">
                  {stats.totalCertifications > 0
                    ? ((stats.expiredCertifications / stats.totalCertifications) * 100).toFixed(1)
                    : 0}
                  % of total
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
                <p className="text-xs text-orange-600 mt-1">Next 6 months</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Issuers</p>
                <p className="text-2xl font-bold text-purple-600">{stats.uniqueIssuers}</p>
                <p className="text-xs text-purple-600 mt-1">Organizations</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-700">Certificate Types</p>
                <p className="text-2xl font-bold text-pink-600">{stats.uniqueTypes}</p>
                <p className="text-xs text-pink-600 mt-1">Different types</p>
              </div>
              <Target className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* First Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certifications by Type */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Certificate className="w-5 h-5 text-blue-600" />
              Certifications by Type
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by certificate type. Shows top 10 most common certifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getCertificationsByType().options}
              series={getCertificationsByType().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Certifications by Issuer */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-green-600" />
              Certifications by Issuer
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by issuing organization. Shows top 8 certificate providers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getCertificationsByIssuer().options}
              series={getCertificationsByIssuer().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Active vs Expired */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-red-600" />
              Active vs Expired Status
            </CardTitle>
            <CardDescription className="text-sm">
              Current status distribution of all certificates in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getActiveVsExpiredChart().options}
              series={getActiveVsExpiredChart().series}
              type="pie"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Second Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Issuance Timeline */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
              Certificate Issuance Timeline
            </CardTitle>
            <CardDescription className="text-sm">
              Timeline showing certificate issuance patterns over the years.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getCertificatesByYearTimeline().options}
              series={getCertificatesByYearTimeline().series}
              type="line"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Certificates per Employee */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-orange-600" />
              Certificates per Employee
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by employee. Shows top 10 employees with most certificates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getCertificatesPerEmployee().options}
              series={getCertificatesPerEmployee().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Certificates Expiring Soon */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Certificates Expiring Soon
            </CardTitle>
            <CardDescription className="text-sm">
              Certificates expiring within the next 6 months - renewal planning required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getCertificatesExpiringSoon().options}
              series={getCertificatesExpiringSoon().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Third Row - 1 Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Top Employees with Active Certifications */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-cyan-50 border-cyan-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-cyan-600" />
              Top Employees with Most Active Certifications
            </CardTitle>
            <CardDescription className="text-sm">
              Employees with the most active (non-expired) certifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getTopEmployeesActiveChart().options}
              series={getTopEmployeesActiveChart().series}
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
            Certification Insights & Recommendations
          </CardTitle>
          <CardDescription>Data-driven insights from certification analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <h4 className="font-semibold text-gray-900">Active Certifications</h4>
              </div>
              <p className="text-sm text-gray-700">
                {stats.totalCertifications > 0
                  ? ((stats.activeCertifications / stats.totalCertifications) * 100).toFixed(1)
                  : 0}
                % of certificates are currently active
              </p>
              <p className="text-xs text-gray-500 mt-1">Strong compliance maintenance</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <h4 className="font-semibold text-gray-900">Renewal Planning</h4>
              </div>
              <p className="text-sm text-gray-700">{stats.expiringSoon} certificates expire within 6 months</p>
              <p className="text-xs text-gray-500 mt-1">Immediate renewal action required</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-purple-500" />
                <h4 className="font-semibold text-gray-900">Certification Diversity</h4>
              </div>
              <p className="text-sm text-gray-700">
                {stats.uniqueTypes} different certificate types from {stats.uniqueIssuers} issuers
              </p>
              <p className="text-xs text-gray-500 mt-1">Diverse professional development</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
