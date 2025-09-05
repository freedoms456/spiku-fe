"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, TrendingUp, Users, AlertTriangle, BarChart3, Calendar, Building, Activity, Target, Shield, Zap } from "lucide-react"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface PlacementAnalyticsProps {
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

export default function AnalitikPenempatan({
  filteredAccounts: propFilteredAccounts = [],
  onFilterChange,
}: PlacementAnalyticsProps) {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [selectedTenure, setSelectedTenure] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)

  // Helper function untuk menghitung selisih hari (dioptimalkan)
  const daysDifference = useMemo(() => {
    const daysCache = new Map<string, number>()
    
    return (startDate: string): number => {
      if (!startDate) return 0
      
      if (daysCache.has(startDate)) {
        return daysCache.get(startDate)!
      }
      
      try {
        const today = new Date()
        const [day, month, year] = startDate.split("-").map(Number)
        const start = new Date(year, month - 1, day)
        
        if (isNaN(start.getTime())) return 0
        
        const diffTime = Math.abs(today.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        daysCache.set(startDate, diffDays)
        return diffDays
      } catch {
        return 0
      }
    }
  }, [])

  // Helper function untuk mendapatkan tahun dari hari
  const getYearsFromDays = (days: number) => {
    return Math.floor(days / 365)
  }

  // Mendapatkan akun yang telah difilter berdasarkan pilihan (dioptimalkan)
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
  }, [propFilteredAccounts, selectedUnit, selectedTenure, selectedYear, daysDifference])

  // Distribusi Masa Kerja
  const getTenureDistribution = useMemo(() => {
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
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const tenureRanges = {
      "0-1 Tahun": 0,
      "1-3 Tahun": 0,
      "3-5 Tahun": 0,
      "5+ Tahun": 0,
    }

    accountsToUse.forEach(acc => {
      const activePlacement = acc.account_penempatan?.find(p => p.tanggal_keluar === null)
      if (activePlacement?.tanggal_masuk) {
        const days = daysDifference(activePlacement.tanggal_masuk)
        const years = getYearsFromDays(days)
        
        if (years <= 1) tenureRanges["0-1 Tahun"]++
        else if (years <= 3) tenureRanges["1-3 Tahun"]++
        else if (years <= 5) tenureRanges["3-5 Tahun"]++
        else tenureRanges["5+ Tahun"]++
      }
    })

    const categories = Object.keys(tenureRanges)
    const data = Object.values(tenureRanges)

    return {
      series: [{
        name: "Pegawai",
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
            text: "Jumlah Pegawai",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"],
        title: {
          text: "Distribusi Masa Kerja Pegawai",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} pegawai`,
          },
        },
      },
    }
  }, [propFilteredAccounts, selectedTenure, selectedUnit, selectedYear, daysDifference, onFilterChange])

  // Distribusi Unit Kerja
  const getUnitDistribution = useMemo(() => {
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
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const unitCounts = accountsToUse.reduce((acc, account) => {
      const activePlacement = account.account_penempatan?.find(p => p.tanggal_keluar === null)
      const unit = activePlacement?.satuan_kerja || "Tidak Diketahui"
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
          text: "Distribusi Pegawai berdasarkan Unit Kerja",
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
            formatter: (val: number) => `${val} pegawai (${((val/total)*100).toFixed(1)}%)`,
          },
        },
      },
    }
  }, [propFilteredAccounts, selectedUnit, selectedTenure, selectedYear, onFilterChange])

  // Timeline Penempatan
  const getPlacementTimeline = useMemo(() => {
    const accountsToUse = propFilteredAccounts?.filter(acc => 
      acc.account_penempatan?.some(p => p.tanggal_keluar === null) &&
      acc.account_jabatan?.length > 0 &&
      acc.account_jabatan[0]?.name &&
      acc.account_jabatan[0]?.name.trim() !== '-'
    ) || []

    if (accountsToUse.length === 0) {
      return {
        series: [{ name: "Penempatan Baru", data: [] }],
        options: {
          chart: { type: "area" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
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
        name: "Penempatan Baru",
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
            text: "Jumlah Penempatan",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Timeline Penempatan berdasarkan Tahun",
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
            formatter: (val: number) => `${val} penempatan baru`,
          },
        },
      },
    }
  }, [propFilteredAccounts, selectedYear, selectedUnit, selectedTenure, onFilterChange])

  // Pegawai dengan Masa Kerja Terpanjang
  const getLongestServingEmployees = useMemo(() => {
    const accountsToUse = propFilteredAccounts?.filter(acc => 
      acc.account_penempatan?.some(p => p.tanggal_keluar === null) &&
      acc.account_jabatan?.length > 0 &&
      acc.account_jabatan[0]?.name &&
      acc.account_jabatan[0]?.name.trim() !== '-'
    ) || []

    if (accountsToUse.length === 0) {
      return {
        series: [{ name: "Tahun Pengabdian", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    // Ambil 10 pegawai dengan masa kerja terpanjang
    const employeeData = accountsToUse
      .map(acc => {
        const activePlacement = acc.account_penempatan?.find(p => p.tanggal_keluar === null)
        const days = activePlacement?.tanggal_masuk ? daysDifference(activePlacement.tanggal_masuk) : 0
        const years = Math.round((days / 365) * 10) / 10 // Bulatkan ke 1 desimal
        
        return {
          name: acc.account_name || "Tidak Diketahui",
          years,
          unit: activePlacement?.satuan_kerja || "Tidak Diketahui"
        }
      })
      .sort((a, b) => b.years - a.years)
      .slice(0, 10)

    const categories = employeeData.map(emp => emp.name)
    const data = employeeData.map(emp => emp.years)

    return {
      series: [{
        name: "Tahun Pengabdian",
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
          formatter: (val: number) => `${val} tahun`,
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
          text: "10 Pegawai dengan Masa Kerja Terpanjang",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} tahun pengabdian`,
          },
        },
      },
    }
  }, [propFilteredAccounts, daysDifference])

  // CHART BARU: Analisis Risiko Rotasi per Unit
  const getRotationRiskAnalysis = useMemo(() => {
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
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const unitRiskData = accountsToUse.reduce((acc, account) => {
      const activePlacement = account.account_penempatan?.find(p => p.tanggal_keluar === null)
      const unit = activePlacement?.satuan_kerja || "Tidak Diketahui"
      
      if (!acc[unit]) {
        acc[unit] = { total: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 }
      }
      
      acc[unit].total += 1
      
      const days = activePlacement?.tanggal_masuk ? daysDifference(activePlacement.tanggal_masuk) : 0
      const years = getYearsFromDays(days)
      
      if (years > 7) acc[unit].highRisk += 1
      else if (years > 4) acc[unit].mediumRisk += 1
      else acc[unit].lowRisk += 1
      
      return acc
    }, {} as Record<string, { total: number; highRisk: number; mediumRisk: number; lowRisk: number }>)

    const sortedUnits = Object.entries(unitRiskData)
      .sort(([,a], [,b]) => b.highRisk - a.highRisk)
      .slice(0, 8)

    const categories = sortedUnits.map(([unit, _]) => unit.length > 15 ? unit.substring(0, 15) + "..." : unit)
    const highRiskData = sortedUnits.map(([, data]) => data.highRisk)
    const mediumRiskData = sortedUnits.map(([, data]) => data.mediumRisk)
    const lowRiskData = sortedUnits.map(([, data]) => data.lowRisk)

    return {
      series: [
        { name: "Risiko Tinggi (>7 tahun)", data: highRiskData },
        { name: "Risiko Sedang (4-7 tahun)", data: mediumRiskData },
        { name: "Risiko Rendah (<4 tahun)", data: lowRiskData }
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          stacked: true,
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: "70%",
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
            text: "Jumlah Pegawai",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#EF4444", "#F59E0B", "#10B981"],
        title: {
          text: "Analisis Risiko Rotasi per Unit",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        legend: {
          position: "top" as const,
          fontSize: "11px",
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} pegawai`,
          },
        },
      },
    }
  }, [propFilteredAccounts, daysDifference])

  // CHART BARU: Pola Penempatan Bulanan
  const getMonthlyPlacementPattern = useMemo(() => {
    const accountsToUse = propFilteredAccounts?.filter(acc => 
      acc.account_penempatan?.some(p => p.tanggal_keluar === null) &&
      acc.account_jabatan?.length > 0 &&
      acc.account_jabatan[0]?.name &&
      acc.account_jabatan[0]?.name.trim() !== '-'
    ) || []

    if (accountsToUse.length === 0) {
      return {
        series: [{ name: "Penempatan", data: [] }],
        options: {
          chart: { type: "line" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const monthCounts = accountsToUse.reduce((acc, account) => {
      const activePlacement = account.account_penempatan?.find(p => p.tanggal_keluar === null)
      if (activePlacement?.tanggal_masuk) {
        try {
          const [, month, ] = activePlacement.tanggal_masuk.split("-")
          const monthName = new Date(2000, parseInt(month) - 1, 1).toLocaleString('id-ID', { month: 'short' })
          acc[monthName] = (acc[monthName] || 0) + 1
        } catch {
          // Skip invalid dates
        }
      }
      return acc
    }, {} as Record<string, number>)

    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
    const categories = months
    const data = months.map(month => monthCounts[month] || 0)

    return {
      series: [{
        name: "Penempatan",
        data,
      }],
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
          size: 6,
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
            text: "Jumlah Penempatan",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#06B6D4"],
        title: {
          text: "Pola Penempatan Sepanjang Tahun",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} penempatan`,
          },
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }, [propFilteredAccounts])

  // CHART BARU: Analisis Kapasitas Unit
  const getUnitCapacityAnalysis = useMemo(() => {
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
          chart: { type: "radar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const unitAnalysis = accountsToUse.reduce((acc, account) => {
      const activePlacement = account.account_penempatan?.find(p => p.tanggal_keluar === null)
      const unit = activePlacement?.satuan_kerja || "Tidak Diketahui"
      
      if (!acc[unit]) {
        acc[unit] = { 
          employeeCount: 0, 
          avgTenure: 0, 
          totalTenure: 0,
          rotationUrgency: 0 
        }
      }
      
      acc[unit].employeeCount += 1
      
      const days = activePlacement?.tanggal_masuk ? daysDifference(activePlacement.tanggal_masuk) : 0
      const years = days / 365
      acc[unit].totalTenure += years
      
      if (years > 5) acc[unit].rotationUrgency += 1
      
      return acc
    }, {} as Record<string, { employeeCount: number; avgTenure: number; totalTenure: number; rotationUrgency: number }>)

    // Hitung rata-rata dan skor
    Object.keys(unitAnalysis).forEach(unit => {
      const data = unitAnalysis[unit]
      data.avgTenure = data.totalTenure / data.employeeCount
    })

    const sortedUnits = Object.entries(unitAnalysis)
      .sort(([,a], [,b]) => b.employeeCount - a.employeeCount)
      .slice(0, 6)

    const categories = sortedUnits.map(([unit, _]) => unit)
    const staffingData = sortedUnits.map(([, data]) => data.employeeCount)
    const urgencyData = sortedUnits.map(([, data]) => data.rotationUrgency)

    return {
      series: [
        { name: "Jumlah Pegawai", data: staffingData },
        { name: "Butuh Rotasi", data: urgencyData }
      ],
      options: {
        chart: {
          type: "radar" as const,
          height: 350,
        },
        xaxis: {
          categories,
        },
        colors: ["#3B82F6", "#EF4444"],
        title: {
          text: "Analisis Kapasitas Unit Kerja",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        legend: {
          position: "bottom" as const,
        },
        plotOptions: {
          radar: {
            polygons: {
              strokeColors: "#E5E7EB",
              strokeWidth: 1,
            }
          }
        },
        tooltip: {
          y: {
            formatter: (val: number, { seriesIndex }) => 
              seriesIndex === 0 ? `${val} pegawai` : `${val} butuh rotasi`,
          },
        },
      },
    }
  }, [propFilteredAccounts, daysDifference])

  // Statistik Ringkasan (dioptimalkan)
  const getSummaryStats = useMemo(() => {
    const filtered = getFilteredAccounts

    if (filtered.length === 0) {
      return {
        totalEmployees: 0,
        avgTenure: 0,
        longestTenure: 0,
        needsRotation: 0,
        urgentRotation: 0,
        uniqueUnits: 0,
        stabilityIndex: 0,
        retentionRate: 0,
      }
    }

    const tenureData = filtered.map(acc => {
      const activePlacement = acc.account_penempatan?.find(p => p.tanggal_keluar === null)
      const days = activePlacement?.tanggal_masuk ? daysDifference(activePlacement.tanggal_masuk) : 0
      return days / 365 // Convert ke tahun
    })

    const avgTenure = tenureData.reduce((sum, years) => sum + years, 0) / tenureData.length
    const longestTenure = Math.max(...tenureData)
    const needsRotation = tenureData.filter(years => years > 5).length
    const urgentRotation = tenureData.filter(years => years > 8).length

    const uniqueUnits = new Set(
      filtered.map(acc => {
        const activePlacement = acc.account_penempatan?.find(p => p.tanggal_keluar === null)
        return activePlacement?.satuan_kerja || "Tidak Diketahui"
      })
    ).size

    // Indeks stabilitas (0-100, semakin tinggi semakin stabil)
    const stabilityIndex = Math.round(((tenureData.filter(years => years >= 2 && years <= 6).length) / tenureData.length) * 100)
    
    // Tingkat retensi (persentase yang bertahan >1 tahun)
    const retentionRate = Math.round((tenureData.filter(years => years > 1).length / tenureData.length) * 100)

    return {
      totalEmployees: filtered.length,
      avgTenure: Math.round(avgTenure * 10) / 10,
      longestTenure: Math.round(longestTenure * 10) / 10,
      needsRotation,
      urgentRotation,
      uniqueUnits,
      stabilityIndex,
      retentionRate,
    }
  }, [getFilteredAccounts, daysDifference])

  const stats = getSummaryStats

  const clearFilters = () => {
    setSelectedUnit(null)
    setSelectedTenure(null)
    setSelectedYear(null)
    onFilterChange?.({ unit: null, tenure: null, year: null })
  }

  return (
    <div className="space-y-6">
      {/* Status Filter dan Tombol Hapus */}
      {(selectedUnit || selectedTenure || selectedYear) && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-blue-800">Filter Aktif:</span>
                {selectedUnit && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                    <Building className="w-3 h-3 mr-1" />
                    {selectedUnit}
                  </Badge>
                )}
                {selectedTenure && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedTenure} Tahun
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
                Hapus Semua Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kartu Ringkasan yang Diperluas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Pegawai</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
                <p className="text-xs text-blue-600 mt-1">Penempatan aktif</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Rata-rata Masa Kerja</p>
                <p className="text-2xl font-bold text-green-600">{stats.avgTenure}</p>
                <p className="text-xs text-green-600 mt-1">Tahun</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Perlu Rotasi</p>
                <p className="text-2xl font-bold text-red-600">{stats.needsRotation}</p>
                <p className="text-xs text-red-600 mt-1">&gt;5 tahun</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Unit Kerja</p>
                <p className="text-2xl font-bold text-orange-600">{stats.uniqueUnits}</p>
                <p className="text-xs text-orange-600 mt-1">Unit berbeda</p>
              </div>
              <Building className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BARU: Kartu Metrik Strategis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-violet-700">Indeks Stabilitas</p>
                <p className="text-2xl font-bold text-violet-600">{stats.stabilityIndex}%</p>
                <p className="text-xs text-violet-600 mt-1">Pegawai dengan masa kerja ideal (2-6 tahun)</p>
              </div>
              <Shield className="w-8 h-8 text-violet-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Tingkat Retensi</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.retentionRate}%</p>
                <p className="text-xs text-emerald-600 mt-1">Pegawai bertahan >1 tahun</p>
              </div>
              <Target className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-700">Rotasi Mendesak</p>
                <p className="text-2xl font-bold text-pink-600">{stats.urgentRotation}</p>
                <p className="text-xs text-pink-600 mt-1">Pegawai &gt;8 tahun di posisi sama</p>
              </div>
              <Zap className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Grafik Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Masa Kerja */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Distribusi Masa Kerja
            </CardTitle>
            <CardDescription className="text-sm">
              Distribusi pegawai berdasarkan tahun pengabdian. Merah menunjukkan perlu rotasi (&gt;5 tahun).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getTenureDistribution.options}
              series={getTenureDistribution.series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Distribusi Unit Kerja */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5 text-green-600" />
              Distribusi Unit Kerja
            </CardTitle>
            <CardDescription className="text-sm">
              Distribusi pegawai di berbagai unit kerja. Klik untuk filter berdasarkan unit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getUnitDistribution.options}
              series={getUnitDistribution.series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Timeline Penempatan */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
              Timeline Penempatan
            </CardTitle>
            <CardDescription className="text-sm">
              Penempatan pegawai baru berdasarkan tahun. Menunjukkan tren dan pola rekrutmen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getPlacementTimeline.options}
              series={getPlacementTimeline.series}
              type="area"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Pegawai dengan Masa Kerja Terpanjang */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Pegawai dengan Masa Kerja Terpanjang
            </CardTitle>
            <CardDescription className="text-sm">
              10 pegawai teratas berdasarkan tahun pengabdian. Batang merah menunjukkan prioritas rotasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getLongestServingEmployees.options}
              series={getLongestServingEmployees.series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* BARU: Grafik Analisis Lanjutan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analisis Risiko Rotasi per Unit */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Analisis Risiko Rotasi per Unit
            </CardTitle>
            <CardDescription className="text-sm">
              Identifikasi unit dengan pegawai yang perlu rotasi segera. Tinggi = &gt;7 tahun, Sedang = 4-7 tahun.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getRotationRiskAnalysis.options}
              series={getRotationRiskAnalysis.series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Pola Penempatan Bulanan */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-cyan-50 border-cyan-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-cyan-600" />
              Pola Penempatan Sepanjang Tahun
            </CardTitle>
            <CardDescription className="text-sm">
              Identifikasi bulan dengan penempatan tertinggi untuk optimalisasi proses rekrutmen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getMonthlyPlacementPattern.options}
              series={getMonthlyPlacementPattern.series}
              type="line"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* BARU: Analisis Kapasitas Unit (Radar Chart) */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-indigo-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-indigo-600" />
              Analisis Kapasitas Unit Kerja
            </CardTitle>
            <CardDescription className="text-sm">
              Radar chart menunjukkan jumlah pegawai vs kebutuhan rotasi per unit. Unit dengan area merah tinggi butuh perhatian.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getUnitCapacityAnalysis.options}
              series={getUnitCapacityAnalysis.series}
              type="radar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Kartu Wawasan yang Diperluas */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Wawasan Utama & Rekomendasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-red-700">Prioritas Rotasi Mendesak</p>
                  <p className="text-sm text-gray-700">
                    {stats.urgentRotation} pegawai telah berada di posisi saat ini lebih dari 8 tahun. 
                    Rotasi segera diperlukan untuk mencegah stagnasi dan memastikan transfer pengetahuan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-orange-700">Perencanaan Rotasi</p>
                  <p className="text-sm text-gray-700">
                    {stats.needsRotation} pegawai (termasuk {stats.urgentRotation} mendesak) perlu dipertimbangkan 
                    untuk rotasi dalam 12-18 bulan ke depan untuk mencegah burnout.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-blue-700">Analisis Masa Kerja</p>
                  <p className="text-sm text-gray-700">
                    Rata-rata masa kerja {stats.avgTenure} tahun menunjukkan {stats.avgTenure > 4 
                      ? 'stabilitas kerja tinggi namun mungkin perlu perspektif baru' 
                      : 'turnover yang baik untuk berbagi pengetahuan'}.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-green-700">Distribusi Unit</p>
                  <p className="text-sm text-gray-700">
                    {stats.uniqueUnits} unit kerja yang berbeda menunjukkan cakupan organisasi yang baik. 
                    Pantau unit dengan pegawai senior yang tidak proporsional.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-purple-700">Perencanaan Suksesi</p>
                  <p className="text-sm text-gray-700">
                    Pegawai dengan {stats.longestTenure}+ tahun pengabdian harus membimbing staf baru 
                    dan mendokumentasikan pengetahuan institusional sebelum rotasi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-indigo-700">Optimalisasi Retensi</p>
                  <p className="text-sm text-gray-700">
                    Tingkat retensi {stats.retentionRate}% {stats.retentionRate > 85 
                      ? 'sangat baik - pertahankan strategi saat ini' 
                      : 'perlu perbaikan program onboarding dan engagement'}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BARU: Dashboard Aksi Strategis */}
      <Card className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Target className="w-5 h-5" />
            Dashboard Aksi Strategis
          </CardTitle>
          <CardDescription>Langkah konkret berdasarkan analisis data penempatan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Aksi Segera */}
            <div className="p-4 bg-white rounded-lg shadow-sm border border-red-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-red-500" />
                <h4 className="font-semibold text-red-700">Aksi Segera (0-3 Bulan)</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Rotasi {stats.urgentRotation} pegawai dengan masa kerja &gt;8 tahun</li>
                <li>• Dokumentasi pengetahuan institusional</li>
                <li>• Identifikasi successor untuk posisi kritis</li>
              </ul>
            </div>

            {/* Rencana Jangka Menengah */}
            <div className="p-4 bg-white rounded-lg shadow-sm border border-orange-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <h4 className="font-semibold text-orange-700">Jangka Menengah (3-12 Bulan)</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Program cross-training untuk {stats.needsRotation - stats.urgentRotation} pegawai</li>
                <li>• Evaluasi beban kerja per unit</li>
                <li>• Pengembangan talent pipeline</li>
              </ul>
            </div>

            {/* Strategi Jangka Panjang */}
            <div className="p-4 bg-white rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-green-700">Jangka Panjang (1-3 Tahun)</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Sistem rotasi otomatis setiap 5-7 tahun</li>
                <li>• Program mentoring dan knowledge management</li>
                <li>• Optimalisasi struktur organisasi</li>
              </ul>
            </div>
          </div>

          {/* Indikator Kesehatan Organisasi */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">Indikator Kesehatan Organisasi</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats.stabilityIndex}%</div>
                <div className="text-xs text-blue-700">Indeks Stabilitas</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.stabilityIndex > 70 ? "Sangat Stabil" : stats.stabilityIndex > 50 ? "Stabil" : "Perlu Perbaikan"}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{stats.retentionRate}%</div>
                <div className="text-xs text-green-700">Tingkat Retensi</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.retentionRate > 85 ? "Excellent" : stats.retentionRate > 70 ? "Baik" : "Perlu Perbaikan"}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {stats.totalEmployees > 0 ? ((stats.needsRotation / stats.totalEmployees) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-xs text-orange-700">Perlu Rotasi</div>
                <div className="text-xs text-gray-500 mt-1">
                  {((stats.needsRotation / stats.totalEmployees) * 100) < 20 ? "Normal" : "Tinggi"}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{(stats.avgTenure * 12).toFixed(0)}</div>
                <div className="text-xs text-purple-700">Rata-rata (Bulan)</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.avgTenure > 5 ? "Sangat Senior" : stats.avgTenure > 3 ? "Berpengalaman" : "Fresh"}
                </div>
              </div>
            </div>
          </div>

          {/* Rekomendasi Spesifik per Kategori */}
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-slate-800">Rekomendasi Berdasarkan Kondisi Saat Ini:</h4>
            
            {stats.urgentRotation > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-700 mb-1">🚨 Tindakan Darurat:</p>
                <p className="text-sm text-red-600">
                  {stats.urgentRotation} pegawai dengan masa kerja &gt;8 tahun memerlukan rotasi dalam 3 bulan. 
                  Risiko: kehilangan motivasi, resistensi terhadap perubahan, bottleneck pengetahuan.
                </p>
              </div>
            )}
            
            {stats.stabilityIndex < 50 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="font-medium text-orange-700 mb-1">⚠️ Stabilitas Rendah:</p>
                <p className="text-sm text-orange-600">
                  Indeks stabilitas {stats.stabilityIndex}% di bawah target. Pertimbangkan program retensi 
                  dan evaluasi kompensasi untuk meningkatkan loyalitas pegawai.
                </p>
              </div>
            )}
            
            {stats.retentionRate > 90 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-700 mb-1">✅ Retensi Excellent:</p>
                <p className="text-sm text-green-600">
                  Tingkat retensi {stats.retentionRate}% sangat baik. Manfaatkan stabilitas ini untuk 
                  program pengembangan internal dan knowledge transfer sistematis.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}