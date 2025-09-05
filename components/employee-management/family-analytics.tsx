"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Heart, MapPin, BarChart3, TrendingUp, Activity, Baby, User, AlertTriangle, CheckCircle } from "lucide-react"
import { accounts, familiess } from "@/lib/employee-management-data"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface FamilyAnalyticsProps {
  filteredFamilies?: any[]
  filteredAccounts?: any[]
  familiesAcc?: any[]
  onFilterChange?: (filters: any) => void
}

export default function AnalitikKeluarga({
  filteredFamilies: propFilteredFamilies,
  filteredAccounts: propFilteredAccounts,
  familiesAcc: families,
  onFilterChange,
}: FamilyAnalyticsProps = {}) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedRelation, setSelectedRelation] = useState<string | null>(null)
  // const families = {}

  // Menghitung umur dari tanggal lahir dengan error handling
  const calculateAge = (birthDate: string): number => {
    try {
      // Validasi input kosong atau null
      if (!birthDate || typeof birthDate !== 'string') {
        return 100;
      }

      const today = new Date();
      
      // birthDate format: bisa "DD/MM/YYYY" atau "YYYY-MM-DD"
      let dateParts: string[];
      if (birthDate.includes("/")) {
        dateParts = birthDate.split("/");
      } else if (birthDate.includes("-")) {
        dateParts = birthDate.split("-");
        // Jika format YYYY-MM-DD, ubah urutan ke DD/MM/YYYY
        if (dateParts[0].length === 4) {
          dateParts = [dateParts[2], dateParts[1], dateParts[0]];
        }
      } else {
        return 100;
      }
      
      // Validasi format tanggal (harus ada 3 bagian)
      if (dateParts.length !== 3) {
        return 100;
      }
      
      const [day, month, year] = dateParts.map(Number);
      
      // Validasi angka valid
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return 100;
      }
      
      // Validasi rentang tanggal yang masuk akal
      if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > today.getFullYear()) {
        return 100;
      }
      
      // bulan dikurangi 1 karena index dimulai 0
      const birth = new Date(year, month - 1, day);
      
      // Validasi tanggal yang dibuat valid
      if (isNaN(birth.getTime())) {
        return 100;
      }
      
      // Validasi tanggal lahir tidak di masa depan
      if (birth > today) {
        return 100;
      }
      
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      // Validasi umur dalam rentang yang masuk akal
      if (age < 0 || age > 150) {
        return 100;
      }
      
      return age;
    } catch (error) {
      // Jika ada error apapun, return 100
      console.warn('Error calculating age:', error);
      return 100;
    }
  };

  
  // Mendapatkan keluarga yang telah difilter berdasarkan pilihan
  const getFilteredAccounts = useMemo(() => {
    
      let filtered = propFilteredAccounts
      

      return filtered
    }, [families, propFilteredAccounts, selectedEmployee, selectedLocation, selectedRelation, accounts])


  

  // Grafik Anggota Keluarga per Pegawai
  const getFamilyMembersPerEmployee = () => {
    const accountsToUse = propFilteredAccounts
    if (!accountsToUse || accountsToUse.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const employeeFamilyCount = propFilteredAccounts.map((account) => ({
      name: account.account_name || "Tidak Diketahui",
      count: account.keluarga?.length ?? 0
    }))

    const categories = employeeFamilyCount.map((item) => item.name)
    const totalData = employeeFamilyCount.map((item) => item.count)

    return {
      series: [
        {
          name: "Total Anggota Keluarga",
          data: totalData,
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
            text: "Jumlah Anggota Keluarga",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#3B82F6", "#EF4444"],
        title: {
          text: "Anggota Keluarga per Pegawai",
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

  // Grafik Distribusi Hubungan
  const getRelationshipDistribution = () => {
    const filteredFamilies = getFilteredAccounts
    if (!filteredFamilies || filteredFamilies.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }
  
    // Hitung jumlah hubungan dari semua keluarga
    const relationshipCounts = filteredFamilies.reduce((acc, account) => {
      if (Array.isArray(account.keluarga)) {
        account.keluarga.forEach((fam) => {
          const relation = fam.hubungan || "Tidak Diketahui"
          acc[relation] = (acc[relation] || 0) + 1
        })
      }
      return acc
    }, {} as Record<string, number>)
  
    const labels = Object.keys(relationshipCounts)
    const series = Object.values(relationshipCounts)
  
    // total anggota keluarga
    const totalMembers = series.reduce((sum, v) => sum + (Number(v) || 0), 0)
  
    return {
      series,
      options: {
        chart: {
          type: "donut" as const,
          height: 350,
          events: {
            dataPointSelection: (_event: any, _chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && labels[config.dataPointIndex]) {
                const relation = labels[config.dataPointIndex]
                const newRelation = selectedRelation === relation ? null : relation
                setSelectedRelation(newRelation)
                onFilterChange?.({
                  employee: selectedEmployee,
                  location: selectedLocation,
                  relation: newRelation,
                })
              }
            },
          },
        },
        labels,
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
        title: {
          text: "Distribusi Hubungan Keluarga",
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
                  formatter: () => totalMembers.toString(),
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
            formatter: (val: number) => `${val} anggota`,
          },
          theme: "light",
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: { width: 300 },
              legend: { position: "bottom" },
            },
          },
        ],
      },
    }
  }

  // Grafik Distribusi Lokasi
  const getLocationDistribution = () => {
    const filteredFamilies = families
    if (!filteredFamilies || filteredFamilies.length === 0) {
      return {
        series: [{ name: "Anggota Keluarga", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const locationCounts = filteredFamilies.reduce(
      (acc, family) => {
        const location = family.domisili_sekarang || "Tidak Diketahui"
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
          name: "Anggota Keluarga",
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
            text: "Lokasi",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#10B981"],
        title: {
          text: "Anggota Keluarga Berdasarkan Lokasi",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} anggota`,
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

  // Grafik Distribusi Umur
  // const getFamilyAgeDistribution = () => {
  //   const filteredFamilies = getFilteredAccounts
  //   if (!filteredFamilies || filteredFamilies.length === 0) {
  //     return {
  //       series: [{ name: "Anggota Keluarga", data: [] }],
  //       options: {
  //         chart: { type: "column" as const, height: 350 },
  //         xaxis: { categories: [] },
  //         noData: { text: "Tidak ada data tersedia" },
  //       },
  //     }
  //   }

  //   const ages = filteredFamilies
  //     .filter((family) => family.family_tanggal_lahir)
  //     .map((family) => calculateAge(family.family_tanggal_lahir))

  //   const ageRanges = {
  //     "0-10": 0,
  //     "11-20": 0,
  //     "21-30": 0,
  //     "31-40": 0,
  //     "41-50": 0,
  //     "51+": 0,
  //   }

  //   ages.forEach((age) => {
  //     if (age <= 10) ageRanges["0-10"]++
  //     else if (age <= 20) ageRanges["11-20"]++
  //     else if (age <= 30) ageRanges["21-30"]++
  //     else if (age <= 40) ageRanges["31-40"]++
  //     else if (age <= 50) ageRanges["41-50"]++
  //     else ageRanges["51+"]++
  //   })

  //   return {
  //     series: [
  //       {
  //         name: "Anggota Keluarga",
  //         data: Object.values(ageRanges),
  //       },
  //     ],
  //     options: {
  //       chart: {
  //         type: "column" as const,
  //         height: 350,
  //         toolbar: { show: false },
  //       },
  //       plotOptions: {
  //         bar: {
  //           borderRadius: 8,
  //           columnWidth: "75%",
  //         },
  //       },
  //       dataLabels: {
  //         enabled: true,
  //         style: {
  //           colors: ["#fff"],
  //           fontWeight: "bold",
  //           fontSize: "12px",
  //         },
  //       },
  //       xaxis: {
  //         categories: Object.keys(ageRanges),
  //         labels: {
  //           style: {
  //             fontSize: "12px",
  //             fontWeight: "500",
  //           },
  //         },
  //       },
  //       yaxis: {
  //         title: {
  //           text: "Jumlah Anggota Keluarga",
  //           style: {
  //             fontWeight: "600",
  //           },
  //         },
  //       },
  //       colors: ["#8B5CF6"],
  //       title: {
  //         text: "Distribusi Umur Anggota Keluarga",
  //         align: "center" as const,
  //         style: {
  //           fontSize: "16px",
  //           fontWeight: "bold",
  //           color: "#1F2937",
  //         },
  //       },
  //       tooltip: {
  //         y: {
  //           formatter: (val: number) => `${val} anggota`,
  //         },
  //         theme: "light",
  //       },
  //       grid: {
  //         borderColor: "#E5E7EB",
  //         strokeDashArray: 3,
  //       },
  //     },
  //   }
  // }

 



  // Statistik Ringkasan
  const getSummaryStats = () => {
    const filteredFamilies = getFilteredAccounts
    if (!filteredFamilies || filteredFamilies.length === 0) {
      return {
        totalFamilies: 0,
        sickFamilies: 0,
        uniqueLocations: 0,
        avgAge: 0,
        healthyFamilies: 0,
      }
    }

    const totalFamilies = filteredFamilies.reduce(
      (acc, account) => acc + (account.keluarga?.length ?? 0),
      0
    )
    const uniqueLocations = new Set(
      filteredFamilies
        .flatMap((acc) => acc.keluarga ?? [])
        .map((f) => f.domisili_sekarang)
        .filter(Boolean)
    ).size

    const validFamilyAges = filteredFamilies
    .flatMap((acc) => acc.keluarga || []) // ambil semua keluarga dari tiap akun
    .filter((fam) => fam.tanggal_lahir)   // hanya yang punya tanggal lahir
    .map((fam) => calculateAge(fam.tanggal_lahir))
    .filter((age) => !isNaN(age) && age !== 100) // filter out error values
    
   
      const avgAge =
        validFamilyAges.length > 0
          ? Math.round(validFamilyAges.reduce((sum, age) => sum + age, 0) / validFamilyAges.length)
          : 0

    return {
      totalFamilies,
      uniqueLocations,
      avgAge
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
      {/* Status Filter dan Tombol Hapus */}
      {(selectedEmployee || selectedLocation || selectedRelation) && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-blue-800">Filter Aktif:</span>
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
                Hapus Semua Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Keluarga</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalFamilies}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {families?.length > 0 ? ((stats.totalFamilies / families.length) * 100).toFixed(1) : 0}% dari semua
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Lokasi</p>
                <p className="text-2xl font-bold text-purple-600">{stats.uniqueLocations}</p>
                <p className="text-xs text-purple-600 mt-1">Daerah berbeda</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Rata-rata Umur</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgAge}</p>
                <p className="text-xs text-orange-600 mt-1">Tahun</p>
              </div>
              <Baby className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Baris Pertama - 3 Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anggota Keluarga per Pegawai */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Anggota Keluarga per Pegawai
            </CardTitle>
            <CardDescription className="text-sm">
              Klik batang untuk filter berdasarkan pegawai. Menampilkan total anggota keluarga.
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

        {/* Distribusi Hubungan */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-green-600" />
              Distribusi Hubungan
            </CardTitle>
            <CardDescription className="text-sm">
              Klik segmen untuk filter berdasarkan jenis hubungan. Grafik donat interaktif.
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

        {/* Distribusi Geografis */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
              Distribusi Geografis
            </CardTitle>
            <CardDescription className="text-sm">
              Klik batang untuk filter berdasarkan lokasi. Menampilkan distribusi anggota keluarga di berbagai daerah.
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

      {/* Baris Kedua - 3 Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
     

        {/* Distribusi Umur */}
        {/* <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-indigo-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Distribusi Umur
            </CardTitle>
            <CardDescription className="text-sm">Kelompok umur anggota keluarga di seluruh pegawai.</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getFamilyAgeDistribution().options}
              series={getFamilyAgeDistribution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card> */}

       
      </div>

   

     
    </div>
  )
}