"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, MapPin, BarChart3, TrendingUp, Activity, Clock, User, Target, Award, UserCheck } from "lucide-react"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface JabatanAnalyticsProps {
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

export default function AnalitikJabatan({
  filteredAccounts: propFilteredAccounts,
  onFilterChange,
}: JabatanAnalyticsProps = {}) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [selectedJabatan, setSelectedJabatan] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
 

  // Menghitung durasi dalam bulan (dioptimalkan dengan error handling)
  const calculateDurationInMonths = useMemo(() => {
    const durationCache = new Map<string, number>()
    
    return (startDate: string, endDate: string | null = null): number => {
      const cacheKey = `${startDate}-${endDate || 'current'}`
      
      if (durationCache.has(cacheKey)) {
        return durationCache.get(cacheKey)!
      }
      
      try {
        if (!startDate) return 0
        
        // Parse format dd-mm-yyyy
        const startParts = startDate.split('-')
        if (startParts.length !== 3) return 0
        
        const start = new Date(startParts[2], parseInt(startParts[1]) - 1, parseInt(startParts[0]))
        if (isNaN(start.getTime())) return 0
        
        let end: Date
        if (endDate) {
          const endParts = endDate.split('-')
          if (endParts.length !== 3) return 0
          end = new Date(endParts[2], parseInt(endParts[1]) - 1, parseInt(endParts[0]))
          if (isNaN(end.getTime())) return 0
        } else {
          end = new Date()
        }
        
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
        const result = Math.max(0, months)
        
        durationCache.set(cacheKey, result)
        return result
      } catch (error) {
        console.warn('Error calculating duration:', error)
        return 0
      }
    }
  }, [])

  // Mendapatkan akun yang telah difilter (dioptimalkan)
  const getFilteredAccounts = useMemo(() => {
    return propFilteredAccounts || []
  }, [propFilteredAccounts, selectedEmployee, selectedJabatan, selectedPeriod])

  // Distribusi Jabatan (dioptimalkan)
  const getJabatanDistribution = useMemo(() => {
    const accounts = getFilteredAccounts

    if (!accounts || accounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    // Hitung distribusi jabatan aktif dari data terfilter
    const jabatanCounts = accounts.reduce((acc, account) => {
      if (Array.isArray(account.account_jabatan)) {
        // Ambil jabatan terbaru (aktif)
        const latestJabatan = [...(account.account_jabatan || [])]
          .filter(jab => jab?.awal_menjabat) // buang data yang null/undefined
          .sort((a, b) => {
            try {
              const dateA = new Date(a.awal_menjabat.split('-').reverse().join('-'))
              const dateB = new Date(b.awal_menjabat.split('-').reverse().join('-'))
              return dateB.getTime() - dateA.getTime()
            } catch {
              return 0
            }
          })[0]
  
        if (latestJabatan && !latestJabatan.akhir_menjabat) {
          const jabatanName = latestJabatan.name || "Tidak Diketahui"
          acc[jabatanName] = (acc[jabatanName] || 0) + 1
        }
      }
      return acc
    }, {} as Record<string, number>)

    const categories = Object.keys(jabatanCounts)
    const data = Object.values(jabatanCounts)

    return {
      series: [
        {
          name: "Jabatan Aktif",
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
                const jabatan = categories[config.dataPointIndex]
                const newJabatan = selectedJabatan === jabatan ? null : jabatan
                setSelectedJabatan(newJabatan)
                onFilterChange?.({ employee: selectedEmployee, jabatan: newJabatan, period: selectedPeriod })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            horizontal: false,
            columnWidth: "65%",
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
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#3B82F6"],
        title: {
          text: "Distribusi Jabatan Saat Ini",
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
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }, [getFilteredAccounts, selectedJabatan, selectedEmployee, selectedPeriod, onFilterChange])

  // Analisis Progres Karir (dioptimalkan)
  const getCareerProgression = useMemo(() => {
    const accounts = getFilteredAccounts
    if (!accounts || accounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "line" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    // Analisis pergerakan jabatan per bulan (dioptimalkan)
    const monthlyMovements = accounts.flatMap(account => 
      (account.account_jabatan || [])
        .filter(jab => jab?.awal_menjabat)
        .map(jab => {
          try {
            const [day, month, year] = jab.awal_menjabat.split("-")
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            
            if (isNaN(date.getTime())) return null
            
            return {
              month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
              type: 'appointment' as const
            }
          } catch {
            return null
          }
        })
        .filter(Boolean)
    ).concat(
      accounts.flatMap(account => 
        (account.account_jabatan || [])
          .filter(jab => jab?.akhir_menjabat)
          .map(jab => {
            try {
              const [day, month, year] = jab.akhir_menjabat.split("-")
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
              
              if (isNaN(date.getTime())) return null
              
              return {
                month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                type: 'termination' as const
              }
            } catch {
              return null
            }
          })
          .filter(Boolean)
      )
    )

    const movementsByMonth = monthlyMovements.reduce((acc, movement) => {
      if (movement) {
        if (!acc[movement.month]) {
          acc[movement.month] = { appointments: 0, terminations: 0 }
        }
        acc[movement.month][movement.type === 'appointment' ? 'appointments' : 'terminations']++
      }
      return acc
    }, {} as Record<string, { appointments: number; terminations: number }>)

    const sortedMonths = Object.keys(movementsByMonth).sort()
    const appointmentsData = sortedMonths.map(month => movementsByMonth[month].appointments)
    const terminationsData = sortedMonths.map(month => movementsByMonth[month].terminations)

    return {
      series: [
        {
          name: "Pengangkatan Baru",
          data: appointmentsData,
        },
        {
          name: "Perubahan Jabatan",
          data: terminationsData,
        }
      ],
      options: {
        chart: {
          type: "line" as const,
          height: 350,
          toolbar: { show: false },
        },
        stroke: {
          curve: "smooth" as const,
          width: 3,
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: sortedMonths,
          labels: {
            style: {
              fontSize: "10px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Jumlah Perubahan",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#10B981", "#F59E0B"],
        title: {
          text: "Tren Pergerakan Karir",
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
          y: {
            formatter: (val: number) => `${val} pengangkatan`,
          },
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }, [getFilteredAccounts])

  // Analisis Masa Jabatan (dioptimalkan)
  const getTenureAnalysis = useMemo(() => {
    const accounts = getFilteredAccounts
    if (!accounts || accounts.length === 0) {
      return {
        series: [{ name: "Pegawai", data: [] }],
        options: {
          chart: { type: "column" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    // Analisis masa jabatan untuk posisi aktif
    const tenureData = accounts
      .map(account => {
        if (!Array.isArray(account.account_jabatan) || account.account_jabatan.length === 0) {
          return null
        }
        
        // Ambil jabatan terbaru (aktif)
        const latestJabatan = [...account.account_jabatan]
          .filter(jab => jab?.awal_menjabat)
          .sort((a, b) => {
            try {
              const dateA = new Date(a.awal_menjabat.split('-').reverse().join('-'))
              const dateB = new Date(b.awal_menjabat.split('-').reverse().join('-'))
              return dateB.getTime() - dateA.getTime()
            } catch {
              return 0
            }
          })[0]

        if (latestJabatan && !latestJabatan.akhir_menjabat) {
          const tenure = calculateDurationInMonths(latestJabatan.awal_menjabat)
          return {
            name: account.account_name,
            jabatan: latestJabatan.name,
            tenure
          }
        }
        return null
      })
      .filter(Boolean)

    // Kelompokkan berdasarkan rentang masa jabatan
    const tenureRanges = {
      "0-6 bulan": 0,
      "6-12 bulan": 0,
      "1-2 tahun": 0,
      "2-3 tahun": 0,
      "3+ tahun": 0,
    }

    tenureData.forEach(item => {
      const months = item?.tenure || 0
      if (months <= 6) tenureRanges["0-6 bulan"]++
      else if (months <= 12) tenureRanges["6-12 bulan"]++
      else if (months <= 24) tenureRanges["1-2 tahun"]++
      else if (months <= 36) tenureRanges["2-3 tahun"]++
      else tenureRanges["3+ tahun"]++
    })

    return {
      series: [
        {
          name: "Pegawai",
          data: Object.values(tenureRanges),
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
          categories: Object.keys(tenureRanges),
          labels: {
            style: {
              fontSize: "11px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Jumlah Pegawai",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Analisis Masa Jabatan Saat Ini",
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
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }, [getFilteredAccounts, calculateDurationInMonths])

  // Distribusi Unit (dioptimalkan)
  const getUnitDistribution = useMemo(() => {
    const accounts = getFilteredAccounts
    if (!accounts || accounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const unitCounts = accounts.reduce((acc, account) => {
      const unit = account.account_unit || "Tidak Diketahui"
      acc[unit] = (acc[unit] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const labels = Object.keys(unitCounts)
    const series = Object.values(unitCounts)
    const totalEmployees = series.reduce((sum, v) => sum + (Number(v) || 0), 0)

    return {
      series,
      options: {
        chart: {
          type: "donut" as const,
          height: 350,
        },
        labels,
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
        title: {
          text: "Distribusi berdasarkan Unit Organisasi",
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
                  formatter: () => totalEmployees.toString(),
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
            formatter: (val: number) => `${val} pegawai`,
          },
          theme: "light",
        },
      },
    }
  }, [getFilteredAccounts])

  // Timeline Jabatan Pegawai (dioptimalkan)
  const getEmployeeJabatanTimeline = useMemo(() => {
    const accounts = getFilteredAccounts
    if (!accounts || accounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const employeeData = accounts.map(account => {
      const totalJabatan = account.account_jabatan?.length || 0
      const activeJabatan = account.account_jabatan?.filter(jab => !jab.akhir_menjabat).length || 0
      
      return {
        name: account.account_name || "Tidak Diketahui",
        total: totalJabatan,
        active: activeJabatan
      }
    })

    const categories = employeeData.map(item => item.name)
    const totalData = employeeData.map(item => item.total)
    const activeData = employeeData.map(item => item.active)

    return {
      series: [
        {
          name: "Total Jabatan",
          data: totalData,
        },
        {
          name: "Jabatan Aktif",
          data: activeData,
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
            text: "Jumlah Jabatan",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#3B82F6", "#10B981"],
        title: {
          text: "Riwayat Jabatan Pegawai",
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
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }, [getFilteredAccounts])

  // Tren Pengangkatan Sepanjang Waktu (dioptimalkan)
  const getAppointmentTrends = useMemo(() => {
    const accounts = getFilteredAccounts
    if (!accounts || accounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "area" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    // Kelompokkan pengangkatan berdasarkan tahun-bulan
    const appointmentsByMonth = accounts
      .flatMap(account =>
        (account.account_jabatan || [])
          .filter(jab => jab?.awal_menjabat)
          .map(jab => {
            try {
              const [day, month, year] = jab.awal_menjabat.split("-")
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
              
              if (isNaN(date.getTime())) return null
              
              return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
            } catch {
              return null
            }
          })
          .filter(Boolean)
      )
      .reduce((acc, month) => {
        if (month) {
          acc[month] = (acc[month] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

    const sortedMonths = Object.keys(appointmentsByMonth).sort()
    const data = sortedMonths.map(month => appointmentsByMonth[month])

    return {
      series: [
        {
          name: "Pengangkatan Baru",
          data,
        },
      ],
      options: {
        chart: {
          type: "area" as const,
          height: 350,
          toolbar: { show: false },
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
            opacityTo: 0.2,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: sortedMonths,
          labels: {
            style: {
              fontSize: "10px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Jumlah Pengangkatan",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#F59E0B"],
        title: {
          text: "Tren Pengangkatan Sepanjang Waktu",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} pengangkatan`,
          },
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }, [getFilteredAccounts])

  // Rata-rata Masa Jabatan berdasarkan Posisi (dioptimalkan)
  const getAverageTenureByPosition = useMemo(() => {
    const accounts = getFilteredAccounts
    if (!accounts || accounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const tenureByPosition = accounts.flatMap(account =>
      (account.account_jabatan || [])
        .filter(jab => jab?.awal_menjabat)
        .map(jab => ({
          position: jab.name || "Tidak Diketahui",
          tenure: calculateDurationInMonths(jab.awal_menjabat, jab.akhir_menjabat)
        }))
    ).reduce((acc, item) => {
      if (!acc[item.position]) {
        acc[item.position] = { total: 0, count: 0 }
      }
      acc[item.position].total += item.tenure
      acc[item.position].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    const positionAverages = Object.entries(tenureByPosition)
      .map(([position, data]) => ({
        position: position.length > 15 ? position.substring(0, 15) + '...' : position,
        fullPosition: position,
        avgTenure: data.count > 0 ? Math.round(data.total / data.count) : 0
      }))
      .sort((a, b) => b.avgTenure - a.avgTenure)
      .slice(0, 10)

    const categories = positionAverages.map(item => item.position)
    const data = positionAverages.map(item => item.avgTenure)

    return {
      series: [
        {
          name: "Rata-rata Masa Jabatan (Bulan)",
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
            borderRadius: 8,
            horizontal: true,
            barHeight: "70%",
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `${val}b`,
          style: {
            colors: ["#fff"],
            fontSize: "11px",
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
            text: "Jabatan",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#EF4444"],
        title: {
          text: "Rata-rata Masa Jabatan berdasarkan Posisi",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} bulan rata-rata`,
          },
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }, [getFilteredAccounts, calculateDurationInMonths])

  // Analisis Level Jabatan (dioptimalkan)
  const getPositionLevelAnalysis = useMemo(() => {
    const accounts = getFilteredAccounts
    if (!accounts || accounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    // Kategorisasi level jabatan berdasarkan nama
    const levelCounts = accounts.reduce((acc, account) => {
      if (Array.isArray(account.account_jabatan)) {
        const latestJabatan = [...account.account_jabatan]
          .filter(jab => jab?.awal_menjabat)
          .sort((a, b) => {
            try {
              const dateA = new Date(a.awal_menjabat.split('-').reverse().join('-'))
              const dateB = new Date(b.awal_menjabat.split('-').reverse().join('-'))
              return dateB.getTime() - dateA.getTime()
            } catch {
              return 0
            }
          })[0]
        
        if (latestJabatan && !latestJabatan.akhir_menjabat) {
          let level = "Staf"
          const name = latestJabatan.name.toLowerCase()
        
          if (name.includes("kepala")) {
            level = "Struktural"
          } else if (["ahli", "pertama", "muda", "madya", "terampil", "pemeriksa"].some(k => name.includes(k))) {
            level = "Fungsional"
          } 
        
          acc[level] = (acc[level] || 0) + 1
        }
      }
      return acc
    }, {} as Record<string, number>)

    const labels = Object.keys(levelCounts)
    const series = Object.values(levelCounts)
    const totalEmployees = series.reduce((sum, v) => sum + (Number(v) || 0), 0)

    return {
      series,
      options: {
        chart: {
          type: "donut" as const,
          height: 350,
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && labels[config.dataPointIndex]) {
                const employeeLevel = labels[config.dataPointIndex]
                const newEmployee = selectedEmployee === employeeLevel ? null : employeeLevel
          
                setSelectedPeriod(newEmployee)
                onFilterChange?.({
                  employee: selectedEmployee,
                  jabatan: selectedJabatan,
                  period: newEmployee
                })
              }
            },
          },
        },
        labels,
        colors: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"],
        title: {
          text: "Distribusi Level Jabatan",
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
                  formatter: () => totalEmployees.toString(),
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
            formatter: (val: number) => `${val} pegawai`,
          },
          theme: "light",
        },
      },
    }
  }, [getFilteredAccounts, selectedEmployee, selectedJabatan, selectedPeriod, onFilterChange])

  // Statistik Ringkasan (dioptimalkan dengan memoization)
  const getSummaryStats = useMemo(() => {
    const accounts = getFilteredAccounts
    if (!accounts || accounts.length === 0) {
      return {
        totalEmployees: 0,
        totalPositions: 0,
        activePositions: 0,
        avgTenureMonths: 0,
        uniquePositions: 0,
        uniqueUnits: 0,
        positionChanges: 0,
        longestTenure: 0
      }
    }

    const totalEmployees = accounts.length
    const allJabatan = accounts.flatMap(acc => acc.account_jabatan || [])
    const totalPositions = allJabatan.length
    const activePositions = allJabatan.filter(jab => !jab.akhir_menjabat).length
    
    const uniquePositions = new Set(allJabatan.map(jab => jab.name).filter(Boolean)).size
    const uniqueUnits = new Set(accounts.map(acc => acc.account_unit).filter(Boolean)).size
    
    const positionChanges = accounts.filter(acc => 
      (acc.account_jabatan?.length || 0) > 1
    ).length

    // Hitung rata-rata masa jabatan untuk posisi aktif
    const activeTenures = accounts
      .map(account => {
        const latestJabatan = account.account_jabatan
          ?.filter(jab => jab?.awal_menjabat && !jab.akhir_menjabat)
          ?.sort((a, b) => {
            try {
              const dateA = new Date(a.awal_menjabat.split('-').reverse().join('-'))
              const dateB = new Date(b.awal_menjabat.split('-').reverse().join('-'))
              return dateB.getTime() - dateA.getTime()
            } catch {
              return 0
            }
          })[0]

        return latestJabatan ? calculateDurationInMonths(latestJabatan.awal_menjabat) : 0
      })
      .filter(tenure => tenure > 0)

    const avgTenureMonths = activeTenures.length > 0 
      ? Math.round(activeTenures.reduce((sum, t) => sum + t, 0) / activeTenures.length)
      : 0

    const longestTenure = activeTenures.length > 0 ? Math.max(...activeTenures) : 0

    return {
      totalEmployees,
      totalPositions,
      activePositions,
      avgTenureMonths,
      uniquePositions,
      uniqueUnits,
      positionChanges,
      longestTenure
    }
  }, [getFilteredAccounts, calculateDurationInMonths])

  const stats = getSummaryStats

  const clearFilters = () => {
    setSelectedEmployee(null)
    setSelectedJabatan(null)
    setSelectedPeriod(null)
    onFilterChange?.({ employee: null, jabatan: null, period: null })
  }

  return (
    <div className="space-y-6">
      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Pegawai</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
                <p className="text-xs text-blue-600 mt-1">Dengan data jabatan</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Jabatan Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.activePositions}</p>
                <p className="text-xs text-green-600 mt-1">Saat ini ditempati</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Jabatan Unik</p>
                <p className="text-2xl font-bold text-purple-600">{stats.uniquePositions}</p>
                <p className="text-xs text-purple-600 mt-1">Peran berbeda</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Rata-rata Masa Jabatan</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgTenureMonths}</p>
                <p className="text-xs text-orange-600 mt-1">Bulan di peran saat ini</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kartu Wawasan Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Perubahan Jabatan</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.positionChanges}</p>
                <p className="text-xs text-emerald-600 mt-1">Pegawai dengan progres karir</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700">Masa Jabatan Terpanjang</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.longestTenure}</p>
                <p className="text-xs text-indigo-600 mt-1">Bulan di jabatan saat ini</p>
              </div>
              <Target className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Jabatan Saat Ini */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Distribusi Jabatan Saat Ini
            </CardTitle>
            <CardDescription className="text-sm">
              Klik batang untuk filter berdasarkan jenis jabatan. Menampilkan hanya jabatan aktif saat ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getJabatanDistribution.options}
              series={getJabatanDistribution.series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Analisis Level Jabatan */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-purple-600" />
              Distribusi Level Jabatan
            </CardTitle>
            <CardDescription className="text-sm">
              Distribusi hierarki organisasi berdasarkan jabatan saat ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getPositionLevelAnalysis.options}
              series={getPositionLevelAnalysis.series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Riwayat Jabatan Pegawai */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-green-600" />
              Riwayat Jabatan Pegawai
            </CardTitle>
            <CardDescription className="text-sm">
              Klik batang untuk filter berdasarkan pegawai. Menampilkan total vs jabatan aktif per orang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getEmployeeJabatanTimeline.options}
              series={getEmployeeJabatanTimeline.series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Distribusi Unit Organisasi */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-indigo-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Distribusi Unit
            </CardTitle>
            <CardDescription className="text-sm">
              Distribusi pegawai di berbagai unit organisasi.
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
      </div>

      {/* Baris Kedua Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tren Pergerakan Karir */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-yellow-50 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              Tren Pengangkatan
            </CardTitle>
            <CardDescription className="text-sm">
              Timeline pengangkatan baru dan perubahan jabatan sepanjang waktu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getAppointmentTrends.options}
              series={getAppointmentTrends.series}
              type="area"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Rata-rata Masa Jabatan berdasarkan Posisi */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-red-600" />
              Rata-rata Masa Jabatan berdasarkan Posisi
            </CardTitle>
            <CardDescription className="text-sm">
              Rata-rata durasi pegawai dalam setiap jenis jabatan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getAverageTenureByPosition.options}
              series={getAverageTenureByPosition.series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bagian Wawasan Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wawasan Jabatan */}
        <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-slate-600" />
              Wawasan Jabatan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-lg font-bold text-blue-600">{stats.uniquePositions}</p>
                <p className="text-xs text-blue-700">Jenis Jabatan Unik</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-lg font-bold text-green-600">{stats.uniqueUnits}</p>
                <p className="text-xs text-green-700">Unit Organisasi</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tingkat Pemanfaatan Jabatan</span>
                <span className="font-semibold text-gray-800">
                  {stats.totalPositions > 0 ? ((stats.activePositions / stats.totalPositions) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tingkat Mobilitas Karir</span>
                <span className="font-semibold text-gray-800">
                  {stats.totalEmployees > 0 ? ((stats.positionChanges / stats.totalEmployees) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rata-rata Jabatan per Pegawai</span>
                <span className="font-semibold text-gray-800">
                  {stats.totalEmployees > 0 ? (stats.totalPositions / stats.totalEmployees).toFixed(1) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analisis Masa Jabatan */}
        <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-amber-600" />
              Analisis Masa Jabatan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-lg font-bold text-orange-600">{stats.avgTenureMonths}</p>
                <p className="text-xs text-orange-700">Rata-rata Masa Jabatan (Bulan)</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-lg font-bold text-red-600">{stats.longestTenure}</p>
                <p className="text-xs text-red-700">Masa Jabatan Terpanjang (Bulan)</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rata-rata Masa Jabatan (Tahun)</span>
                <span className="font-semibold text-gray-800">
                  {(stats.avgTenureMonths / 12).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Masa Jabatan Terpanjang (Tahun)</span>
                <span className="font-semibold text-gray-800">
                  {(stats.longestTenure / 12).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stabilitas Jabatan</span>
                <span className="font-semibold text-gray-800">
                  {stats.avgTenureMonths >= 24 ? "Tinggi" : stats.avgTenureMonths >= 12 ? "Sedang" : "Rendah"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wawasan Tambahan */}
      <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-teal-600" />
            Indikator Kinerja Utama
          </CardTitle>
          <CardDescription>
            Wawasan strategis untuk manajemen sumber daya manusia dan pengembangan organisasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg border border-teal-100 shadow-sm">
              <div className="text-2xl font-bold text-teal-600 mb-2">
                {stats.totalEmployees > 0 ? ((stats.positionChanges / stats.totalEmployees) * 100).toFixed(0) : 0}%
              </div>
              <p className="text-sm font-medium text-teal-700 mb-1">Tingkat Progres Karir</p>
              <p className="text-xs text-gray-600">Pegawai yang pernah berganti jabatan</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-teal-100 shadow-sm">
              <div className="text-2xl font-bold text-teal-600 mb-2">
                {stats.totalPositions > 0 ? ((stats.activePositions / stats.totalPositions) * 100).toFixed(0) : 0}%
              </div>
              <p className="text-sm font-medium text-teal-700 mb-1">Tingkat Pengisian Jabatan</p>
              <p className="text-xs text-gray-600">Saat ini aktif vs total jabatan</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-teal-100 shadow-sm">
              <div className="text-2xl font-bold text-teal-600 mb-2">
                {stats.totalEmployees > 0 ? (stats.totalPositions / stats.totalEmployees).toFixed(1) : 0}
              </div>
              <p className="text-sm font-medium text-teal-700 mb-1">Keberagaman Jabatan</p>
              <p className="text-xs text-gray-600">Rata-rata jabatan per pegawai</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-lg border border-teal-200">
            <h4 className="font-semibold text-teal-800 mb-2">Rekomendasi Strategis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-teal-700">• Perencanaan Suksesi</p>
                <p className="text-teal-600 text-xs">Fokus pada jabatan dengan masa kerja tinggi untuk transfer pengetahuan</p>
              </div>
              <div>
                <p className="font-medium text-teal-700">• Pengembangan Karir</p>
                <p className="text-teal-600 text-xs">Buat jalur untuk pegawai tanpa perubahan jabatan</p>
              </div>
              <div>
                <p className="font-medium text-teal-700">• Optimalisasi Sumber Daya</p>
                <p className="text-teal-600 text-xs">Seimbangkan beban kerja di seluruh unit organisasi</p>
              </div>
              <div>
                <p className="font-medium text-teal-700">• Strategi Retensi</p>
                <p className="text-teal-600 text-xs">Pantau pegawai dengan masa jabatan pendek untuk keterlibatan</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}