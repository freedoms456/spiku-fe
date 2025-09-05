"use client"

import { useState, useMemo } from "react"
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

export default function AnalitikSertifikasi({
  filteredAccounts: propFilteredAccounts,
  onFilterChange,
}: CertificationAnalyticsProps = {}) {
  const [selectedCertType, setSelectedCertType] = useState<string | null>(null)
  const [selectedIssuer, setSelectedIssuer] = useState<string | null>(null)
  const [selectedExpired, setSelectedExpired] = useState<string | null>(null)

  // Mendapatkan sertifikasi yang telah difilter berdasarkan pilihan (dioptimalkan dengan memoization)
  const getFilteredAccounts = useMemo(() => {
    if (!propFilteredAccounts || propFilteredAccounts.length === 0) {
      return []
    }
    
    // Flatten semua sertifikasi dari akun yang difilter
    const sertifikasiList = propFilteredAccounts.flatMap((account) =>
      (account.account_sertifikasi || []).map((sertifikasi) => ({
        ...sertifikasi,
        account_name: account.account_name || "Tidak Diketahui",
        account_id: account.id,
      }))
    )

    return sertifikasiList
  }, [propFilteredAccounts, selectedExpired, selectedIssuer, selectedCertType])

  // Helper function untuk cek status sertifikat aktif (dioptimalkan)
  const isCertificateActive = useMemo(() => {
    const activeStatusCache = new Map<string, boolean>()
    
    return (expiryDate: string): boolean => {
      if (!expiryDate) return true
      
      if (activeStatusCache.has(expiryDate)) {
        return activeStatusCache.get(expiryDate)!
      }
      
      try {
        const [day, month, year] = expiryDate.split("-").map(Number)
        if (!day || !month || !year) return true
        
        const parsedDate = new Date(year, month - 1, day)
        const isActive = parsedDate > new Date()
        
        activeStatusCache.set(expiryDate, isActive)
        return isActive
      } catch {
        return true
      }
    }
  }, [])

  // Helper function untuk mendapatkan bulan hingga expired (dioptimalkan)
  const getMonthsUntilExpiry = (expiryDate: string): number => {
    if (!expiryDate) return -1
    
    try {
      const [day, month, year] = expiryDate.split("-").map(Number)
      const expiry = new Date(year, month - 1, day)
      const now = new Date()
      const diffTime = expiry.getTime() - now.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
    } catch {
      return -1
    }
  }

  // 1. Sertifikasi berdasarkan Jenis
  const getCertificationsByType = () => {
    const filteredCerts = getFilteredAccounts
    if (!filteredCerts || filteredCerts.length === 0) {
      return {
        series: [{ name: "Sertifikasi", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const typeCounts = filteredCerts.reduce(
      (acc, cert) => {
        const type = cert.name || "Tidak Diketahui"
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedTypes = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)

    const categories = sortedTypes.map(([type, _]) => (type.length > 25 ? type.substring(0, 25) + "..." : type))
    const data = sortedTypes.map(([_, count]) => count)

    return {
      series: [
        {
          name: "Sertifikasi",
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
                onFilterChange?.({ certType: newCertType, issuer: selectedIssuer, expired: selectedExpired })
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
            text: "Jenis Sertifikat",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#3B82F6"],
        title: {
          text: "Sertifikasi berdasarkan Jenis",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} sertifikat`,
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

  // 2. Sertifikasi berdasarkan Penerbit
  const getCertificationsByIssuer = () => {
    const filteredCerts = getFilteredAccounts
    if (!filteredCerts || filteredCerts.length === 0) {
      return {
        series: [{ name: "Sertifikat Diterbitkan", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const issuerCounts = filteredCerts.reduce(
      (acc, cert) => {
        const issuer = cert.certification_penerbit || "Tidak Diketahui"
        acc[issuer] = (acc[issuer] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedIssuers = Object.entries(issuerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)

    const categories = sortedIssuers.map(([issuer, _]) => issuer)
    const data = sortedIssuers.map(([_, count]) => count)

    return {
      series: [
        {
          name: "Sertifikat Diterbitkan",
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
                onFilterChange?.({ certType: selectedCertType, issuer: newIssuer, expired: selectedExpired })
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
            text: "Jumlah Sertifikat",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#10B981"],
        title: {
          text: "Sertifikasi berdasarkan Penerbit",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} sertifikat`,
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

  // 3. Status Aktif vs Kadaluarsa
  const getActiveVsExpiredChart = () => {
    const filteredCerts = getFilteredAccounts
    if (!filteredCerts || filteredCerts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "pie" as const, height: 350 },
          labels: [],
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const activeCerts = filteredCerts.filter((cert) => isCertificateActive(cert.masa_berlaku)).length
    const expiredCerts = filteredCerts.length - activeCerts

    return {
      series: [activeCerts, expiredCerts],
      options: {
        chart: {
          type: "pie" as const,
          height: 350,
          events: {
            dataPointSelection: (
              event: any,
              chartContext: any,
              config: { dataPointIndex: number }
            ) => {
              const idx = config?.dataPointIndex;
              if (typeof idx === "number" && idx >= 0) {
                const label = ["Aktif", "Kadaluarsa"][idx];
                const newStatus = selectedExpired === label ? null : label;
                setSelectedExpired(newStatus);
                onFilterChange?.({
                  certType: selectedCertType,
                  issuer: selectedIssuer,
                  expired: newStatus,
                });
              }
            }
          },
        },
        labels: ["Aktif", "Kadaluarsa"],
        colors: ["#10B981", "#EF4444"],
        title: {
          text: "Status Sertifikat Aktif vs Kadaluarsa",
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
            formatter: (val: number) => `${val} sertifikat`,
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

  // 4. Timeline Penerbitan Sertifikat berdasarkan Tahun
  const getCertificatesByYearTimeline = () => {
    const filteredCerts = getFilteredAccounts
    if (!filteredCerts || filteredCerts.length === 0) {
      return {
        series: [{ name: "Sertifikat Diterbitkan", data: [] }],
        options: {
          chart: { type: "line" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const yearCounts = filteredCerts.reduce((acc, cert) => {
      if (cert.tanggal_sertifikasi) {
        try {
          const [day, month, year] = cert.tanggal_sertifikasi.split("-").map(Number)
          if (day && month && year && year > 1900 && year <= new Date().getFullYear()) {
            acc[year.toString()] = (acc[year.toString()] || 0) + 1
          }
        } catch {
          // Skip invalid dates
        }
      }
      return acc
    }, {} as Record<string, number>)

    const sortedYears = Object.entries(yearCounts).sort(([a], [b]) => a.localeCompare(b))
    const categories = sortedYears.map(([year, _]) => year)
    const data = sortedYears.map(([_, count]) => count)

    return {
      series: [
        {
          name: "Sertifikat Diterbitkan",
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
            text: "Jumlah Sertifikat",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Timeline Penerbitan Sertifikat",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} sertifikat`,
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

  // 5. Sertifikat per Pegawai (dioptimalkan)
  const getCertificatesPerEmployee = () => {
    const accountsToUse = propFilteredAccounts || []
    if (!accountsToUse || accountsToUse.length === 0) {
      return {
        series: [{ name: "Sertifikat", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const employeeCertCounts = accountsToUse
      .map((account) => ({
        name: account.account_name || "Tidak Diketahui",
        count: account.account_sertifikasi?.length || 0,
      }))
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
          name: "Sertifikat",
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
            text: "Jumlah Sertifikat",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#F59E0B"],
        title: {
          text: "Sertifikat per Pegawai (10 Teratas)",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} sertifikat`,
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

  // 6. Sertifikat yang Akan Segera Berakhir (dioptimalkan)
  const getCertificatesExpiringSoon = (): {
    series: ApexAxisChartSeries;
    options: ApexOptions;
  } => {
    const certsToUse = getFilteredAccounts;
  
    if (!certsToUse || certsToUse.length === 0) {
      return {
        series: [{ name: "Sertifikat Berakhir", data: [] }],
        options: {
          chart: { type: "bar", height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      };
    }
    
    const countsByMonth: Record<string, number> = {};
    const currentYear = new Date().getFullYear();

    certsToUse.forEach((cert: any) => {
      if (cert.masa_berlaku) {
        try {
          const [day, month, year] = cert.masa_berlaku.split("-").map(Number);
          const expiryDate = new Date(year, month - 1, day);

          if (expiryDate > new Date() && expiryDate.getFullYear() === currentYear) {
            const monthName = expiryDate.toLocaleString("id-ID", { month: "short" });
            countsByMonth[monthName] = (countsByMonth[monthName] || 0) + 1;
          }
        } catch {
          // Skip invalid dates
        }
      }
    });
    

    // Urutkan sesuai bulan kalender (Indonesia)
    const months = [
      "Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"
    ];
    const categories: string[] = [];
    const data: number[] = [];
  
    months.forEach((m) => {
      if (countsByMonth[m]) {
        categories.push(m);
        data.push(countsByMonth[m]);
      }
    });
    
    return {
      series: [{ name: "Sertifikat Berakhir", data }],
      options: {
        chart: { 
          type: "bar", 
          height: 350,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: "60%",
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
            text: "Jumlah Sertifikat",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#EF4444"],
        title: {
          text: "Sertifikat yang Berakhir Tahun Ini",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} sertifikat berakhir`,
          },
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    };
  };

  // 7. Top Pegawai dengan Sertifikat Aktif Terbanyak (dioptimalkan)
  const getTopEmployeesActiveChart = () => {
    const accountsToUse = propFilteredAccounts || []
    
    if (!accountsToUse || accountsToUse.length === 0) {
      return {
        series: [{ name: "Sertifikat Aktif", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const employeeActiveCerts = accountsToUse
      .map((account) => {
        const activeCertCount = (account.account_sertifikasi || []).filter(
          (cert: any) => isCertificateActive(cert.masa_berlaku)
        ).length
        
        return {
          name: account.account_name || "Tidak Diketahui",
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
          name: "Sertifikat Aktif",
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
            text: "Pegawai",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#06B6D4"],
        title: {
          text: "Pegawai Teratas dengan Sertifikat Aktif Terbanyak",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} sertifikat aktif`,
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

  // Statistik Ringkasan (dioptimalkan dengan memoization)
  const getSummaryStats = useMemo(() => {
    const filteredCerts = getFilteredAccounts
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
      isCertificateActive(cert.masa_berlaku)
    ).length
    const expiredCertifications = totalCertifications - activeCertifications
    
    const expiringSoon = filteredCerts.filter((cert) => {
      const monthsUntil = getMonthsUntilExpiry(cert.masa_berlaku)
      return monthsUntil > 0 && monthsUntil <= 6
    }).length

    // Menggunakan Set untuk efisiensi
    const uniqueIssuers = new Set(
      filteredCerts.map(cert => cert.certification_penerbit).filter(Boolean)
    ).size

    const uniqueTypes = new Set(
      filteredCerts.map(cert => cert.name).filter(Boolean)
    ).size

    return {
      totalCertifications,
      activeCertifications,
      expiredCertifications,
      expiringSoon,
      uniqueIssuers,
      uniqueTypes,
    }
  }, [getFilteredAccounts, isCertificateActive])

  const stats = getSummaryStats

  const clearFilters = () => {
    setSelectedCertType(null)
    setSelectedIssuer(null)
    setSelectedExpired(null)
    onFilterChange?.({ certType: null, issuer: null, expired: null })
  }

  return (
    <div className="space-y-6">
      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Sertifikat</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalCertifications}</p>
                <p className="text-xs text-blue-600 mt-1">Semua rekord</p>
              </div>
              <Certificate className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCertifications}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalCertifications > 0
                    ? ((stats.activeCertifications / stats.totalCertifications) * 100).toFixed(1)
                    : 0}
                  % dari total
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
                <p className="text-sm font-medium text-red-700">Kadaluarsa</p>
                <p className="text-2xl font-bold text-red-600">{stats.expiredCertifications}</p>
                <p className="text-xs text-red-600 mt-1">
                  {stats.totalCertifications > 0
                    ? ((stats.expiredCertifications / stats.totalCertifications) * 100).toFixed(1)
                    : 0}
                  % dari total
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
                <p className="text-sm font-medium text-orange-700">Segera Berakhir</p>
                <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
                <p className="text-xs text-orange-600 mt-1">6 bulan ke depan</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Penerbit</p>
                <p className="text-2xl font-bold text-purple-600">{stats.uniqueIssuers}</p>
                <p className="text-xs text-purple-600 mt-1">Organisasi</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-700">Jenis Sertifikat</p>
                <p className="text-2xl font-bold text-pink-600">{stats.uniqueTypes}</p>
                <p className="text-xs text-pink-600 mt-1">Jenis berbeda</p>
              </div>
              <Target className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Baris Pertama - 3 Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sertifikasi berdasarkan Jenis */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Certificate className="w-5 h-5 text-blue-600" />
              Sertifikasi berdasarkan Jenis
            </CardTitle>
            <CardDescription className="text-sm">
              Klik batang untuk filter berdasarkan jenis sertifikat. Menampilkan 10 sertifikasi paling umum.
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

        {/* Sertifikasi berdasarkan Penerbit */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-green-600" />
              Sertifikasi berdasarkan Penerbit
            </CardTitle>
            <CardDescription className="text-sm">
              Klik batang untuk filter berdasarkan organisasi penerbit. Menampilkan 8 penyedia sertifikat teratas.
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

        {/* Status Aktif vs Kadaluarsa */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-red-600" />
              Status Aktif vs Kadaluarsa
            </CardTitle>
            <CardDescription className="text-sm">
              Distribusi status sertifikat saat ini dalam sistem.
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

      {/* Baris Kedua - 3 Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Penerbitan Sertifikat */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
              Timeline Penerbitan Sertifikat
            </CardTitle>
            <CardDescription className="text-sm">
              Timeline menunjukkan pola penerbitan sertifikat sepanjang tahun.
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

        {/* Sertifikat per Pegawai */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-orange-600" />
              Sertifikat per Pegawai
            </CardTitle>
            <CardDescription className="text-sm">
              Klik batang untuk filter berdasarkan pegawai. Menampilkan 10 pegawai dengan sertifikat terbanyak.
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

        {/* Sertifikat yang Segera Berakhir */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Sertifikat yang Segera Berakhir
            </CardTitle>
            <CardDescription className="text-sm">
              Sertifikat yang berakhir dalam 6 bulan ke depan - perlu perencanaan perpanjangan.
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

      {/* Baris Ketiga - 1 Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Top Pegawai dengan Sertifikat Aktif */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-cyan-50 border-cyan-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-cyan-600" />
              Pegawai Teratas dengan Sertifikat Aktif Terbanyak
            </CardTitle>
            <CardDescription className="text-sm">
              Pegawai dengan sertifikat aktif (belum kadaluarsa) terbanyak.
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

      {/* Panel Wawasan */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Wawasan & Rekomendasi Sertifikasi
          </CardTitle>
          <CardDescription>Wawasan berbasis data dari analitik sertifikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <h4 className="font-semibold text-gray-900">Sertifikasi Aktif</h4>
              </div>
              <p className="text-sm text-gray-700">
                {stats.totalCertifications > 0
                  ? ((stats.activeCertifications / stats.totalCertifications) * 100).toFixed(1)
                  : 0}
                % sertifikat saat ini aktif
              </p>
              <p className="text-xs text-gray-500 mt-1">Pemeliharaan kepatuhan yang kuat</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <h4 className="font-semibold text-gray-900">Perencanaan Perpanjangan</h4>
              </div>
              <p className="text-sm text-gray-700">{stats.expiringSoon} sertifikat berakhir dalam 6 bulan</p>
              <p className="text-xs text-gray-500 mt-1">Diperlukan tindakan perpanjangan segera</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-purple-500" />
                <h4 className="font-semibold text-gray-900">Keberagaman Sertifikasi</h4>
              </div>
              <p className="text-sm text-gray-700">
                {stats.uniqueTypes} jenis sertifikat yang berbeda tersedia
              </p>
              <p className="text-xs text-gray-500 mt-1">Pengembangan profesional yang beragam</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}