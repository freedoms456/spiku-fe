import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, AlertTriangle, Building, Target, BarChart3, ArrowRightLeft, UserCheck, UserX } from "lucide-react"

interface UnitWorkforceAnalysisProps {
  filteredAccounts?: any[]
}

export default function UnitWorkforceAnalysis({ filteredAccounts = [] }: UnitWorkforceAnalysisProps) {
  
  // Konstanta kebutuhan tenaga kerja per unit (sample data)
  const UNIT_WORKFORCE_REQUIREMENTS = {
    "Subauditorat": 45,
    "Sekretariat Perwakilan": 1,
    "Subbagian Humas dan TU": 4,
    "Subbagian Keuangan": 4,
    "Subbagian Umum dan Teknologi Informasi": 25,
    "Kepala Perwakilan" : 1

  }

  // Analisis unit workforce
  const getUnitWorkforceAnalysis = useMemo(() => {
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        unitStats: [],
        totalAssignments: 0,
        criticalUnits: [],
        efficientUnits: [],
        overloadedUnits: []
      }
    }

    // Hitung pegawai per unit
    const unitEmployeeCounts = filteredAccounts.reduce((acc, account) => {
      const unit = account.account_unit || "Tidak Diketahui"
      acc[unit] = (acc[unit] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log(unitEmployeeCounts)
    // Hitung perbantuan yang diberikan oleh setiap unit
    const unitAssistanceGiven = filteredAccounts.reduce((acc, account) => {
      const unit = account.account_unit || "Tidak Diketahui"
      
      const activeAssistance = Array.isArray(account.account_perbantuan) 
        ? account.account_perbantuan.filter(perbantuan => {
            // Jika tanggal_keluar kosong/null/undefined = masih aktif
            if (!perbantuan.tanggal_keluar || 
                perbantuan.tanggal_keluar === '' || 
                perbantuan.tanggal_keluar === '0') {
              return true
            }
            
            try {
              const dateParts = perbantuan.tanggal_keluar.split('-')
              if (dateParts.length !== 3) return true // format tidak valid, anggap aktif
              
              const [day, month, year] = dateParts.map(Number)
              if (isNaN(day) || isNaN(month) || isNaN(year)) return true
              
              const exitDate = new Date(year, month - 1, day)
              const today = new Date()
              today.setHours(0, 0, 0, 0) // set ke awal hari untuk perbandingan yang akurat
              
              return exitDate >= today
            } catch (error) {
              return true // jika error, anggap masih aktif
            }
          })
        : []
      
      acc[unit] = (acc[unit] || 0) + activeAssistance.length
      return acc
    }, {} as Record<string, number>)

    // Hitung perbantuan yang diterima oleh setiap unit
    const unitAssistanceReceived = filteredAccounts.reduce((acc, account) => {
      if (Array.isArray(account.account_perbantuan)) {
        // Filter perbantuan yang masih aktif dulu
        const activeAssistance = account.account_perbantuan.filter(assistance => {
          // Jika tanggal_keluar kosong/null = masih aktif
          if (!assistance.tanggal_keluar || 
              assistance.tanggal_keluar === '' || 
              assistance.tanggal_keluar === '0') {
            return true
          }
          
          try {
            const dateParts = assistance.tanggal_keluar.split('-')
            if (dateParts.length !== 3) return true
            
            const [day, month, year] = dateParts.map(Number)
            if (isNaN(day) || isNaN(month) || isNaN(year)) return true
            
            const exitDate = new Date(year, month - 1, day)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            return exitDate >= today
          } catch (error) {
            return true
          }
        })
        
        // Hitung unit penerima perbantuan dari yang masih aktif
        activeAssistance.forEach(assistance => {
          const targetUnit = assistance.unit_perbantuan || "Tidak Diketahui"
          acc[targetUnit] = (acc[targetUnit] || 0) + 1
        })
      }
      return acc
    }, {} as Record<string, number>)

    // Gabungkan semua unit yang ada
    const allUnits = new Set([
      ...Object.keys(unitEmployeeCounts),
      ...Object.keys(unitAssistanceGiven),
      ...Object.keys(unitAssistanceReceived),
      ...Object.keys(UNIT_WORKFORCE_REQUIREMENTS)
    ])

    const unitStats = Array.from(allUnits).map(unit => {
      const actualStaff = unitEmployeeCounts[unit] || 0
      const requiredStaff = UNIT_WORKFORCE_REQUIREMENTS[unit] || 4
      const assistanceGiven = unitAssistanceGiven[unit] || 0
      const assistanceReceived = unitAssistanceReceived[unit] || 0
      const staffGap = actualStaff - requiredStaff
      const assistanceRatio = actualStaff > 0 ? assistanceGiven / actualStaff : 0
      const netAssistance = assistanceGiven - assistanceReceived
      
      // Hitung beban kerja total (staff + assistance given - assistance received)
      const totalWorkload = actualStaff + assistanceGiven - assistanceReceived
      const workloadPerStaff = actualStaff > 0 ? totalWorkload / actualStaff : 0
      
      return {
        unit,
        actualStaff,
        requiredStaff,
        staffGap,
        assistanceGiven,
        assistanceReceived,
        netAssistance,
        assistanceRatio,
        workloadPerStaff,
        efficiency: actualStaff > 0 ? (requiredStaff / actualStaff) * 100 : 0,
        isOverloaded: workloadPerStaff > 1.5,
        isUnderstaffed: staffGap < 0,
        canProvideHelp: staffGap > 0 && assistanceRatio < 0.5
      }
    }).sort((a, b) => b.actualStaff - a.actualStaff)

    // Klasifikasi unit
    const criticalUnits = unitStats.filter(unit => unit.isUnderstaffed && unit.workloadPerStaff > 1.2)
    const efficientUnits = unitStats.filter(unit => !unit.isUnderstaffed && unit.workloadPerStaff < 1.2 && unit.assistanceGiven > 0)
    const overloadedUnits = unitStats.filter(unit => unit.isOverloaded)

    return {
      unitStats,
      totalAssignments: Object.values(unitAssistanceGiven).reduce((sum, count) => sum + count, 0),
      criticalUnits,
      efficientUnits,
      overloadedUnits
    }
  }, [filteredAccounts])

  const analysis = getUnitWorkforceAnalysis

  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const stats = analysis.unitStats
    if (stats.length === 0) {
      return {
        totalUnits: 0,
        totalStaff: 0,
        totalRequired: 0,
        avgWorkload: 0,
        staffUtilization: 0,
        assistanceEfficiency: 0
      }
    }

    const totalStaff = stats.reduce((sum, unit) => sum + unit.actualStaff, 0)
    const totalRequired = stats.reduce((sum, unit) => sum + unit.requiredStaff, 0)
    const avgWorkload = stats.reduce((sum, unit) => sum + unit.workloadPerStaff, 0) / stats.length
    const totalAssistanceGiven = stats.reduce((sum, unit) => sum + unit.assistanceGiven, 0)
    const totalAssistanceReceived = stats.reduce((sum, unit) => sum + unit.assistanceReceived, 0)
    
    return {
      totalUnits: stats.length,
      totalStaff,
      totalRequired,
      avgWorkload,
      staffUtilization: totalRequired > 0 ? (totalStaff / totalRequired) * 100 : 0,
      assistanceEfficiency: totalAssistanceReceived > 0 ? (totalAssistanceGiven / totalAssistanceReceived) * 100 : 100
    }
  }, [analysis.unitStats])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Unit Kerja</p>
                <p className="text-2xl font-bold text-blue-600">{summaryMetrics.totalUnits}</p>
                <p className="text-xs text-blue-600 mt-1">Unit aktif</p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Utilizasi SDM</p>
                <p className="text-2xl font-bold text-green-600">{summaryMetrics.staffUtilization.toFixed(1)}%</p>
                <p className="text-xs text-green-600 mt-1">{summaryMetrics.totalStaff}/{summaryMetrics.totalRequired} staff</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>


      
      </div> */}

      {/* Unit Analysis Table */}
      <Card className="bg-gradient-to-r from-white to-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            Analisis Detail Unit Kerja
          </CardTitle>
          <CardDescription>
            Perbandingan kebutuhan vs aktual staff, beban perbantuan, dan efisiensi operasional per unit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-700">Unit Kerja</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Staff</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Kebutuhan</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Gap</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Bantuan Diberikan</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Bantuan Diterima</th>
                  {/* <th className="text-center p-3 font-semibold text-gray-700">Beban Kerja</th> */}
                  <th className="text-center p-3 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {analysis.unitStats.map((unit, index) => (
                  <tr key={unit.unit} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="p-3 font-medium text-gray-800">
                      {unit.unit}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${unit.actualStaff < unit.requiredStaff ? 'text-red-600' : 'text-green-600'}`}>
                        {unit.actualStaff}
                      </span>
                    </td>
                    <td className="p-3 text-center text-gray-600">
                      {unit.requiredStaff}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${unit.staffGap < 0 ? 'text-red-600' : unit.staffGap > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {unit.staffGap > 0 ? '+' : ''}{unit.staffGap}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-blue-600 font-medium">{unit.assistanceGiven}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-purple-600 font-medium">{unit.assistanceReceived}</span>
                    </td>
                    {/* <td className="p-3 text-center">
                      <span className={`font-bold ${unit.workloadPerStaff > 1.5 ? 'text-red-600' : unit.workloadPerStaff > 1.2 ? 'text-orange-600' : 'text-green-600'}`}>
                        {unit.workloadPerStaff.toFixed(1)}x
                      </span>
                    </td> */}
                    <td className="p-3 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {unit.isUnderstaffed && (
                          <Badge variant="destructive" className="text-xs">
                            Kurang Staff
                          </Badge>
                        )}
                        {unit.isOverloaded && (
                          <Badge variant="destructive" className="text-xs">
                            Overload
                          </Badge>
                        )}
                        {unit.canProvideHelp && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            Dapat Bantu
                          </Badge>
                        )}
                        {!unit.isUnderstaffed && !unit.isOverloaded && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                            Normal
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Visual Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Gap Analysis */}
        <Card className="bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <UserX className="w-5 h-5" />
              Gap Analisis SDM
            </CardTitle>
            <CardDescription>
              Perbandingan kebutuhan vs ketersediaan staff per unit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.unitStats.slice(0, 8).map((unit) => (
                <div key={unit.unit} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 truncate max-w-32">{unit.unit}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{unit.actualStaff}/{unit.requiredStaff}</span>
                      <span className={`text-xs font-bold ${unit.staffGap < 0 ? 'text-red-600' : unit.staffGap > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        ({unit.staffGap > 0 ? '+' : ''}{unit.staffGap})
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        unit.actualStaff < unit.requiredStaff 
                          ? 'bg-gradient-to-r from-red-400 to-red-500' 
                          : unit.actualStaff === unit.requiredStaff 
                            ? 'bg-gradient-to-r from-green-400 to-green-500'
                            : 'bg-gradient-to-r from-blue-400 to-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min((unit.actualStaff / unit.requiredStaff) * 100, 100)}%` 
                      }}
                    />
                    {unit.actualStaff > unit.requiredStaff && (
                      <div 
                        className="absolute top-0 left-full h-3 bg-gradient-to-r from-blue-300 to-blue-400 opacity-70"
                        style={{ 
                          width: `${((unit.actualStaff - unit.requiredStaff) / unit.requiredStaff) * 100}%` 
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

           {/* Recommendations */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <TrendingUp className="w-5 h-5" />
            Rekomendasi Strategis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
             

              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Optimasi Resource</h4>
                <div className="space-y-2 text-sm">
                  {analysis.unitStats
                    .filter(unit => unit.canProvideHelp)
                    .slice(0, 3)
                    .map((unit) => (
                      <div key={unit.unit} className="p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="font-medium text-blue-700">{unit.unit}</p>
                        <p className="text-xs text-blue-600">
                          Surplus {unit.staffGap} staff, dapat memberikan lebih banyak bantuan
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
            
              <div>
                <h4 className="font-semibold text-purple-700 mb-2">Action Items</h4>
                <ul className="text-sm space-y-1 text-purple-700">
                  <li>• Redistribusi staff dari unit surplus ke unit deficit</li>
                  <li>• Review struktur organisasi untuk kebutuhan aktual</li>
                  <li>• Monitor workload secara berkala</li>
                  <li>• Standardisasi proses di unit efisien</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    
      </div>

      {/* Assistance Flow Analysis */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <ArrowRightLeft className="w-5 h-5" />
            Alur Perbantuan Antar Unit
          </CardTitle>
          <CardDescription>
            Analisis pemberi dan penerima bantuan untuk optimasi resource sharing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Providers */}
            <div>
              <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Top Pemberi Bantuan
              </h4>
              <div className="space-y-2">
                {analysis.unitStats
                  .sort((a, b) => b.assistanceGiven - a.assistanceGiven)
                  .slice(0, 5)
                  .map((unit, index) => (
                    <div key={unit.unit} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-green-800 truncate max-w-24">{unit.unit}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{unit.assistanceGiven}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Recipients */}
            <div>
              <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Top Penerima Bantuan
              </h4>
              <div className="space-y-2">
                {analysis.unitStats
                  .sort((a, b) => b.assistanceReceived - a.assistanceReceived)
                  .slice(0, 5)
                  .map((unit, index) => (
                    <div key={unit.unit} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-blue-800 truncate max-w-24">{unit.unit}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{unit.assistanceReceived}</span>
                    </div>
                  ))}
              </div>
            </div>

          
          </div>
        </CardContent>
      </Card>

    </div>
  )
}