"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  UserPlus,
  GraduationCap,
  Award,
  BadgeIcon as Certificate,
  Briefcase,
  MapPin,
  Heart,
  ClipboardCheck,
  Search,
  Filter,
  Download,
  Plus,
  BarChart3,
  Eye,
  Calendar,
  Phone,
  Mail,
  Building,
  User,
  BookOpen,
  Star,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import {
  families,
  educations,
  trainings,
  certifications,
  positions,
  placementHistories,
  assistanceHistories,
  auditAssignments,
} from "@/lib/employee-management-data"
import AccountsAnalytics from "./accounts-analytics"
import FamilyAnalytics from "./family-analytics"
import EducationAnalytics from "./education-analytics"
import CertificationAnalytics from "./certification-analytics"


interface MultiTableViewProps {
  globalSearchQuery?: string
}

export default function MultiTableView({ globalSearchQuery = "" }: MultiTableViewProps) {
 
  // data
  const [accounts, setAccounts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("10")
  const [activeTab, setActiveTab] = useState("accounts")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Chart filter states
  const [accountsFilters, setAccountsFilters] = useState<any>({})
  const [familyFilters, setFamilyFilters] = useState<any>({})
  const [educationFilters, setEducationFilters] = useState<any>({})
  const [certificationFilters, setCertificationFilters] = useState<any>({})

  // Use global search query if provided, otherwise use local search
  const effectiveSearchTerm = globalSearchQuery || searchTerm



  // Fetch Data
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true)
      setError(null)
      try {
      // ambil dari localStorage
      const stored = localStorage.getItem("accounts");
      const res: any[] = stored ? JSON.parse(stored) : [];

      // pastikan array valid
      const data = Array.isArray(res) ? res : [];

      setAccounts(data) // <-- masukin ke state

      

      } catch (e: any) {
        setError(e?.message || "Gagal memuat data")
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
     }, [])
  

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const today = new Date();
  
    // birthDate format: "DD/MM/YYYY"
    const [day, month, year] = birthDate.split("/").map(Number);
    const birth = new Date(year, month - 1, day); // bulan dikurangi 1 karena index dimulai 0
  
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
  
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
  
    return age;
  };


  // Enhanced filter function for global name search
  const filterDataByName = (data: any[], nameFields: string[]) => {
    if (!effectiveSearchTerm) return data
    return data.filter((item) => {
      // Check direct name fields
      const directMatch = nameFields.some((field) =>
        item[field]?.toString().toLowerCase().includes(effectiveSearchTerm.toLowerCase()),
      )

      // For non-account data, also check related employee name
      if (!directMatch && item.account_id) {
        const relatedAccount = accounts.find((acc) => acc.id === item.account_id)
        if (relatedAccount) {
          return relatedAccount.account_name?.toLowerCase().includes(effectiveSearchTerm.toLowerCase())
        }
      }

      // For placement, assistance, and audit data that use 'name' field directly
      if (!directMatch && item.name) {
        return item.name.toLowerCase().includes(effectiveSearchTerm.toLowerCase())
      }

      return directMatch
    })
  }

  // Filter function for local search (non-name fields)
  const filterData = (data: any[], searchFields: string[]) => {
    if (!searchTerm || globalSearchQuery) return data // Skip local search if global search is active
    return data.filter((item) =>
      searchFields.some((field) => item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }

  // Apply chart filters to accounts
  const getFilteredAccounts = useMemo(() => {

      let filtered = accounts

      // Apply name-based search filter
      filtered = filterDataByName(filtered, ["account_name","account_unit","account_jabatan"])

      // Apply local search filter (for non-name fields)
      if (!globalSearchQuery && searchTerm) {
        filtered = filterData(filtered, ["account_name","account_unit", "account_jabatan"])
      }

      // Apply chart filters
      if (accountsFilters.gender) {
        filtered = filtered.filter(
          (acc) => acc.account_jenis_kelamin === accountsFilters.gender
        )
      }
      if (accountsFilters.grade) {
        filtered = filtered.filter(
          (acc) => acc.account_golongan === accountsFilters.grade
        )
      }
      if (accountsFilters.unit) {
        filtered = filtered.filter(
          (acc) => acc.account_unit === accountsFilters.unit
        )
      }
      // Apply age filter
      if (accountsFilters.age) {
        filtered = filtered.filter((acc) => {
          const age = calculateAge(acc.account_tanggal_lahir)
          const ageRange = accountsFilters.age

          console.log(age)
          if (ageRange === "20-30") return age >= 20 && age <= 30
          if (ageRange === "31-40") return age >= 31 && age <= 40
          if (ageRange === "41-50") return age >= 41 && age <= 50
          if (ageRange === "51-60") return age >= 51 && age <= 60
          if (ageRange === "60+") return age > 60

          return false
        })
      }

      

      return filtered
    }, [
      accounts,              // ⬅️ tambahin ini
      effectiveSearchTerm,
      searchTerm,
      globalSearchQuery,
      accountsFilters,
    ])

  

  // Flatten keluarga untuk table
  const familyRows = getFilteredAccounts.flatMap(account =>
    (account.keluarga ?? []).map(fam => ({
      ...fam,
      account_name: account.account_name, // relasi ke nama pegawai
    }))
  )
  // Paginate data
  const paginateData = (data: any[]) => {
    const limit = Number.parseInt(entriesPerPage)
    return data.slice(0, limit)
  }
  

  

  const renderTableControls = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={globalSearchQuery ? "Global search active..." : "Search in current tab..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={!!globalSearchQuery}
        />
        {globalSearchQuery && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Badge variant="default" className="text-xs">
              Global: {globalSearchQuery}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 entries</SelectItem>
            <SelectItem value="25">25 entries</SelectItem>
            <SelectItem value="50">50 entries</SelectItem>
            <SelectItem value="100">100 entries</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        {/* <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button> */}
      </div>
    </div>
  )

  // const summaryCards = [
  //   { title: "Total Accounts", value: accounts.length, icon: Users, color: "text-blue-600" },
  //   { title: "Family Records", value: families.length, icon: UserPlus, color: "text-green-600" },
  //   { title: "Education Records", value: educations.length, icon: GraduationCap, color: "text-purple-600" },
  //   { title: "Training Records", value: trainings.length, icon: Award, color: "text-orange-600" },
  //   { title: "Certifications", value: certifications.length, icon: Certificate, color: "text-red-600" },
  //   { title: "Position Records", value: positions.length, icon: Briefcase, color: "text-indigo-600" },
  //   { title: "Placement History", value: placementHistories.length, icon: MapPin, color: "text-teal-600" },
  //   { title: "Assistance History", value: assistanceHistories.length, icon: Heart, color: "text-pink-600" },
  //   { title: "Audit Assignments", value: auditAssignments.length, icon: ClipboardCheck, color: "text-cyan-600" },
  // ]
        
  return (
    <div className="space-y-6">
      
      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                <card.icon className={`w-8 h-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}
  
      {/* Global Search Indicator */}
      {globalSearchQuery && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Global search active: "{globalSearchQuery}" - Filtering all data by employee names
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-9 w-full">
          <TabsTrigger value="accounts" className="text-xs">
            Pegawai
          </TabsTrigger>
          <TabsTrigger value="families" className="text-xs">
            Keluarga
          </TabsTrigger>
          <TabsTrigger value="educations" className="text-xs">
            Pendidikan
          </TabsTrigger>
          <TabsTrigger value="trainings" className="text-xs">
            Diklat
          </TabsTrigger>
          <TabsTrigger value="certifications" className="text-xs">
            Sertifikasi
          </TabsTrigger>
          <TabsTrigger value="positions" className="text-xs">
            Jabatan
          </TabsTrigger>
          <TabsTrigger value="placements" className="text-xs">
            Penempatan
          </TabsTrigger>
          <TabsTrigger value="assistance" className="text-xs">
            Perbantuan
          </TabsTrigger>
          <TabsTrigger value="audits" className="text-xs">
            Pemeriksaan
          </TabsTrigger>
    
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          {/* Analytics Section */}

          <AccountsAnalytics filteredAccounts={getFilteredAccounts} onFilterChange={setAccountsFilters} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Employee Accounts
                {(Object.keys(accountsFilters).some((key) => accountsFilters[key]) || effectiveSearchTerm) && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredAccounts.length} filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Daftar Nama Pegawai</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableControls()}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(getFilteredAccounts).map((account) => (
                      <TableRow key={account.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{account.account_name}</TableCell>
                        <TableCell>
                          <Badge variant={account.account_jenis_kelamin === "Laki-laki" ? "default" : "secondary"}>
                            {account.account_jenis_kelamin}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={account.account_unit}>
                          {account.account_unit}
                        </TableCell>
                        <TableCell className="text-blue-600 font-medium">
                        {(() => {
                          if (!account.account_jabatan || account.account_jabatan.length === 0) return "-"

                          // urutkan berdasarkan awal_menjabat (tanggal terbaru)
                          const latest = [...account.account_jabatan].sort(
                            (a, b) => new Date(b.awal_menjabat).getTime() - new Date(a.awal_menjabat).getTime()
                          )[0]

                          return latest?.name || "-"
                        })()}
                      </TableCell>
                        <TableCell>
                          <Badge variant="outline">{account.account_pangkat}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{account.account_golongan}</Badge>
                        </TableCell>
                        <TableCell>
                          {/* <AccountDetailModal account={account} /> */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Families Tab */}
          <TabsContent value="families" className="space-y-6">
          {/* Family Analytics Section */}
          <FamilyAnalytics
            filteredAccounts={getFilteredAccounts}
            familiesAcc = {familyRows}
            onFilterChange={setFamilyFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Family Information
                {(Object.keys(familyFilters).some((key) => familyFilters[key]) || effectiveSearchTerm) && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredAccounts.length} filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Employee family members and dependents with health and location data</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableControls()}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Pegawai</TableHead>
                      <TableHead>Nama Keluarga</TableHead>
                      <TableHead>Hubungan</TableHead>
                      <TableHead>Jenis Kelamin</TableHead>
                      <TableHead>Tanggal Lahir</TableHead>
                      <TableHead>Domisili Sekarang</TableHead>
                     
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                   {paginateData(familyRows).map((family) => (
                     <TableRow key={family.id} className="hover:bg-muted/50">
                     <TableCell className="font-medium">{family.account_name}</TableCell>
                        <TableCell>{family.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{family.hubungan}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={family.jenis_kelamin === "Laki-laki" ? "default" : "secondary"}>
                            {family.jenis_kelamin}
                          </Badge>
                        </TableCell>
                        <TableCell>{family.tanggal_lahir}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{family.domisili_sekarang}</span>
                          </div>
                        </TableCell>
                       
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

    
      </Tabs>
    </div>
  )
}
