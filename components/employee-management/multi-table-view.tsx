"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import ActiveFilters from "./ActiveFilters"
import FamilyAnalytics from "./family-analytics"
import EducationAnalytics from "./education-analytics"
import TrainingAnalytics from "./training-analytics"
import PositionAnalytics from "./position-analytics"
import CertificationAnalytics from "./certification-analytics"
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";
import PlacementAnalytics from "./placement-analytic"
import AssistanceAnalytics from "./assistance-analytics"
import AuditAnalytics from "./audit-analytics"
import { useAuth } from "@/hooks/use-auth";




// extend plugin
dayjs.extend(duration);
dayjs.extend(customParseFormat);

interface MultiTableViewProps {
  globalSearchQuery?: string
}

export default function MultiTableView({ globalSearchQuery = "" }: MultiTableViewProps) {
  const { user,logout } = useAuth({ redirectTo: "/login" });
  // data
  const [accounts, setAccounts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("10")
  const [activeTab, setActiveTab] = useState("accounts")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Chart filter states
  const [accountsFilters, setAccountsFilters] = useState<any>({})


  // Use global search query if provided, otherwise use local search
  const effectiveSearchTerm = globalSearchQuery || searchTerm

  // const [accountsFilters, setAccountsFilters] = useState<any>({})



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
  
    
    
  const daysDifference = (tanggalMasuk: string | Date) => {
    const now = dayjs();
    
    // Kalau string, parse sesuai format dd-mm-yyyy
    const masuk = typeof tanggalMasuk === "string" 
      ? dayjs(tanggalMasuk, "DD-MM-YYYY")
      : dayjs(tanggalMasuk);
  
    const diff = dayjs.duration(now.diff(masuk));
  
    return `${diff.years()} tahun ${diff.months()} bulan ${diff.days()} hari`;
  };
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

  const parseDMY = (str) => {
    if (!str) return null;
    const [day, month, year] = str.split("-");
    return new Date(`${year}-${month}-${day}T00:00:00`);
  };

  const isCertificateActive = (expiryDate: string | null | undefined): boolean => {
    if (!expiryDate) return true; // kosong dianggap aktif
    const parsed = parseDMY(expiryDate);
    return parsed ? parsed > new Date() : true;
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

  const clearFilters = () => {
    setAccountsFilters({})
  }
  

  // Apply chart filters to accounts
  const getFilteredAccounts = useMemo(() => {

      let filtered = accounts
      // Apply name-based search filter
      filtered = filterDataByName(filtered, ["account_name","account_unit","account_jabatan"])

      const SEARCH_CONFIG = {
        accountFields: ["account_name", "account_unit", "account_jabatan"],
        diklatFields: ["name", "jenis", "tahun", "jp"] // sesuaikan dengan field yang ada
      };
      
      if (!globalSearchQuery && searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        
        filtered = filtered.filter((account) => {
          // Search di account level
          const accountMatch = SEARCH_CONFIG.accountFields.some(
            field => account[field] && String(account[field]).toLowerCase().includes(lowerSearch)
          );
          
          // Search di diklat array
          const diklatMatch = account.account_diklat?.some(diklat =>
            SEARCH_CONFIG.diklatFields.some(
              field => diklat[field] && String(diklat[field]).toLowerCase().includes(lowerSearch)
            )
          ) || false;
          
          return accountMatch || diklatMatch;
        });
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

          if (ageRange === "20-30") return age >= 20 && age <= 30
          if (ageRange === "31-40") return age >= 31 && age <= 40
          if (ageRange === "41-50") return age >= 41 && age <= 50
          if (ageRange === "51-60") return age >= 51 && age <= 60
          if (ageRange === "60+") return age > 60

          return false
        })
      }
      if (accountsFilters.relation) {
        filtered = filtered
          // simpan hanya account yang punya keluarga sesuai filter
          .filter((acc) => acc.keluarga?.some((k: any) => k.hubungan === accountsFilters.relation))
          // potong isi keluarga biar hanya yg sesuai relation
          .map((acc) => ({
            ...acc,
            keluarga: acc.keluarga.filter((k: any) => k.hubungan === accountsFilters.relation),
          }))
      }
      if (accountsFilters.location) {
        filtered = filtered
          // simpan hanya account yang punya keluarga sesuai filter
          .filter((acc) => acc.keluarga?.some((k: any) => k.domisili_sekarang === accountsFilters.location))
          // potong isi keluarga biar hanya yg sesuai relation
          .map((acc) => ({
            ...acc,
            keluarga: acc.keluarga.filter((k: any) => k.domisili_sekarang === accountsFilters.location),
          }))
      }

      if (accountsFilters.level) {
        filtered = filtered
          // simpan hanya account yang punya keluarga sesuai filter
          .filter((acc) => acc.account_pendidikan?.some((k: any) => k.jenjang === accountsFilters.level))
          // potong isi keluarga biar hanya yg sesuai relation
          .map((acc) => ({
            ...acc,
            keluarga: acc.keluarga.filter((k: any) => k.jenjang === accountsFilters.level),
          }))
      }

      if (accountsFilters.major) {
        filtered = filtered
          // simpan hanya account yang punya keluarga sesuai filter
          .filter((acc) => acc.account_pendidikan?.some((k: any) => k.jurusan === accountsFilters.major))
          // potong isi keluarga biar hanya yg sesuai relation
          .map((acc) => ({
            ...acc,
            pendidikan: acc.account_pendidikan.filter((k: any) => k.jurusan === accountsFilters.major),
          }))
      }
      if (accountsFilters.institution) {
        filtered = filtered
        // simpan hanya account yang punya keluarga sesuai filter
        .filter((acc) => acc.account_pendidikan?.some((k: any) => k.institusi === accountsFilters.institution))
        // potong isi keluarga biar hanya yg sesuai relation
        .map((acc) => ({
          ...acc,
          pendidikan: acc.account_pendidikan.filter((k: any) => k.institusi === accountsFilters.institution),
        }))
      }

      if (accountsFilters.year) {
        filtered = filtered
        // simpan hanya account yang punya keluarga sesuai filter
        .filter((acc) => acc.account_diklat?.some((k: any) => k.tahun === accountsFilters.year))
        // potong isi keluarga biar hanya yg sesuai relation
        .map((acc) => ({
          ...acc,
          diklat: acc.account_diklat.filter((k: any) => k.tahun === accountsFilters.year),
        }))
      }
      if (accountsFilters.trainingType) {
        filtered = filtered
          .filter((acc) =>
            acc.account_diklat?.some((k: any) => k.jenis === accountsFilters.trainingType)
          )
          .map((acc) => ({
            ...acc,
            account_diklat: acc.account_diklat.filter(
              (k: any) => k.jenis === accountsFilters.trainingType
            ),
          }))
      }
      if (accountsFilters.jabatan) {
        filtered = filtered
          .filter((acc) =>
            acc.account_jabatan?.some((k: any) => k.name === accountsFilters.jabatan)
          )
          .map((acc) => ({
            ...acc,
            account_jabatan: acc.account_jabatan.filter(
              (k: any) => k.name === accountsFilters.jabatan
            ),
          }))
      }
      if (accountsFilters.jpRange) {
        const [min, max] = accountsFilters.jpRange.split("-").map(Number)
      
        filtered = filtered.filter((acc) =>
          acc.account_diklat?.some((k: any) => {
            const jp = Number(k.jp) || 0  // pakai k.jp, bukan acc.account_diklat.jp
            if (max) {
              return jp >= min && jp <= max
            } else {
              return jp >= min
            }
          })
        )
      }

      if (accountsFilters.expired) {
        const flag = accountsFilters.expired; // "Active" | "Expired"
      
        filtered = (filtered || [])
          .map((acc: any) => {
            const certs = Array.isArray(acc.account_sertifikasi) ? acc.account_sertifikasi : [];
            const matched = certs.filter((k: any) => {
              const active = isCertificateActive(k.masa_berlaku);
              if (flag === "Active") return active;
              if (flag === "Expired") return !active;
              return true;
            });
            // kembalikan account dengan child yang sudah dipangkas
            return { ...acc, account_sertifikasi: matched };
          })
          // hanya keep account yang masih punya sertifikat setelah pemangkasan
          .filter((acc: any) => Array.isArray(acc.account_sertifikasi) && acc.account_sertifikasi.length > 0);
      }

      if (accountsFilters.certType) {
        filtered = filtered
          .filter((acc) =>
            acc.account_sertifikasi?.some((k: any) => k.name === accountsFilters.certType)
          )
          .map((acc) => ({
            ...acc,
            account_sertifikasi: acc.account_sertifikasi.filter(
              (k: any) => k.name === accountsFilters.certType
            ),
          }))
      }

      if (accountsFilters.period) {
        filtered = filtered.filter((acc) => {
          const latestJabatan = acc.account_jabatan?.[0]
          if (!latestJabatan || latestJabatan.akhir_menjabat) return false
      
          const name = latestJabatan.name.toLowerCase()
      
          let level = "Staff"
          if (name.includes("kepal")) {
            level = "Struktural"
          } else if (["ahli", "pertama", "muda", "madya","terampil","pemeriksa"].some(k => name.includes(k))) {
            level = "Fungsional"
          }
      
          // kalau period Struktural → ambil yang bukan Staff & bukan Fungsional
          if (accountsFilters.period === "Struktural") {
            return level === "Struktural"
          }
      
          return level === accountsFilters.period
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
          placeholder={globalSearchQuery ? "Global search active..." : "Cari Berdasarkan Nama Pegawai"}
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
      <ActiveFilters
        selectedGender={accountsFilters.gender ?? null}
        selectedGrade={accountsFilters.grade ?? null}
        selectedUnit={accountsFilters.unit ?? null}
        selectedAge={accountsFilters.age ?? null}
        selectedRelation={accountsFilters.relation ?? null}
        selectedLocation={accountsFilters.domisili_sekarang ?? null}
        selectedLevel={accountsFilters.level ?? null}
        selectedMajor={accountsFilters.major ?? null}
        selectedInstitution={accountsFilters.Institution ?? null}
        selectedYear={accountsFilters.Year ?? null}
        selectedTrainingType={accountsFilters.trainingType ?? null}
        selectedJPRange={accountsFilters.jpRange ?? null}
        selectedDiklatName ={accountsFilters.diklatName ?? null}
        selectedCertType ={accountsFilters.certType ?? null}
        selectedIssuer ={accountsFilters.issuer ?? null}
        selectedExpired ={accountsFilters.expired ?? null}
        selectedJabatan ={accountsFilters.jabatan ?? null}
        selectedPeriod ={accountsFilters.period ?? null}
        clearFilters={clearFilters}
      />
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

          <AccountsAnalytics
              filteredAccounts={getFilteredAccounts}
              onFilterChange={(newFilters) => setAccountsFilters(prev => ({ ...prev, ...newFilters }))}
            />

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
            onFilterChange={(newFilters) => setAccountsFilters(prev => ({ ...prev, ...newFilters }))}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Informasi Keluarga
                {(Object.keys(accountsFilters).some((key) => accountsFilters[key]) || effectiveSearchTerm) && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredAccounts.length} filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Data Keluarga Pegawai</CardDescription>
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

        <TabsContent value="educations" className="space-y-6">
          {/* Education Analytics Section */}
          <EducationAnalytics
            filteredAccounts={getFilteredAccounts}
            onFilterChange={(newFilters) => setAccountsFilters(prev => ({ ...prev, ...newFilters }))}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education Records
                {(Object.keys(accountsFilters).some((key) => accountsFilters[key]) || effectiveSearchTerm) && (
                  <Badge variant="secondary" className="ml-2">
                     {getFilteredAccounts.length} filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Employee educational background and qualifications</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableControls()}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Pegawai</TableHead>
                      <TableHead>Jenjang</TableHead>
                      <TableHead>Institusi</TableHead>
                      <TableHead>Jurusan</TableHead>
                      <TableHead>Tahun Lulus</TableHead>
                      <TableHead>IPK</TableHead>
                      {/* <TableHead>Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                {paginateData(getFilteredAccounts).map((account) => (
                  account.account_pendidikan?.map((education, idx) => (
                    <TableRow key={`${account.id}-${idx}`} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {account.account_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{education.jenjang}</Badge>
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate"
                        title={education.institusi}
                      >
                        {education.institusi}
                      </TableCell>
                      <TableCell className="text-blue-600">{education.jurusan}</TableCell>
                      <TableCell>{education.tahun_lulus}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{education.gpa}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainings">
          
        <TrainingAnalytics
            filteredAccounts={getFilteredAccounts}
            onFilterChange={(newFilters) => setAccountsFilters(prev => ({ ...prev, ...newFilters }))}
          />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Training Records
                {effectiveSearchTerm && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredAccounts.length} filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Employee training and development activities</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableControls()}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Diklat</TableHead>
                      <TableHead>JP</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Tahun</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(getFilteredAccounts).map((account) => (
                      account.account_diklat?.map((diklat, idx) => (
                        <TableRow key={diklat.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {accounts.find((acc) => acc.id === diklat.account_id)?.account_name}
                          </TableCell>
                          <TableCell className="text-blue-600">{diklat.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            <Badge variant="outline">{diklat.jp} JP</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={diklat.jenis}>
                            {diklat.jenis}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={diklat.tahun}>
                            {diklat.tahun}
                          </TableCell>
                        </TableRow>
                      ))
                    ))}
                  </TableBody>

                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          {/* Certification Analytics Section */}
          <CertificationAnalytics
            filteredAccounts={getFilteredAccounts}
            onFilterChange={setAccountsFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Certificate className="w-5 h-5" />
                Certifications
                {(Object.keys(accountsFilters).some((key) => accountsFilters[key]) ||
                  effectiveSearchTerm) && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredAccounts.length} filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Professional certifications and licenses</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableControls()}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Certification</TableHead>
                      <TableHead>Issuer</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(paginateData(getFilteredAccounts)) ? paginateData(getFilteredAccounts) : []).map(
                      (account) =>
                        (Array.isArray(account?.account_sertifikasi) ? account.account_sertifikasi : []).map(
                          (cert) =>
                            cert && (
                              <TableRow key={cert.id} className="hover:bg-muted/50">
                                <TableCell className="font-medium">
                                  {accounts.find((acc) => acc.id === cert.account_id)?.account_name}
                                </TableCell>
                                <TableCell className="text-blue-600">{cert.certification_nama}</TableCell>
                                <TableCell>{cert.name}</TableCell>
                                <TableCell>{cert.tanggal_sertifikasi}</TableCell>
                                <TableCell>{cert.masa_berlaku}</TableCell>
                                <TableCell>
                                <Badge
                                  variant={
                                    !cert.masa_berlaku || parseDMY(cert.masa_berlaku) > new Date()
                                      ? "default"
                                      : "destructive"
                                  }
                                  className={
                                    !cert.masa_berlaku || parseDMY(cert.masa_berlaku) > new Date()
                                      ? "bg-green-500 text-white"
                                      : "bg-red-500 text-white"
                                  }
                                >
                                  {!cert.masa_berlaku || parseDMY(cert.masa_berlaku) > new Date()
                                    ? "Active"
                                    : "Expired"}
                                </Badge>
                                </TableCell>
                              </TableRow>
                            )
                        )
                    )}
                  </TableBody>

                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         {/* Positions Tab */}
         <TabsContent value="positions">
         <PositionAnalytics
            filteredAccounts={getFilteredAccounts}
            onFilterChange={setAccountsFilters}
          />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Position History
                {effectiveSearchTerm && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredAccounts.length} filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Employee position and role changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableControls()}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                 
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                        {(Array.isArray(paginateData(getFilteredAccounts)) ? paginateData(getFilteredAccounts) : []).map(
                          (account) => {
                            if (!Array.isArray(account?.account_jabatan) || account.account_jabatan.length === 0) {
                              return null
                            }

                            // ambil jabatan terbaru berdasarkan awal_menjabat
                            const latestJabatan = [...account.account_jabatan].sort(
                              (a, b) => new Date(b.awal_menjabat) - new Date(a.awal_menjabat)
                            )[0]

                            return (
                              latestJabatan && (
                                <TableRow key={latestJabatan.id} className="hover:bg-muted/50">
                                  <TableCell className="font-medium">
                                    {accounts.find((acc) => acc.id === latestJabatan.account_id)?.account_name}
                                  </TableCell>
                                  <TableCell className="text-blue-600">{latestJabatan.name}</TableCell>
                                  <TableCell>{latestJabatan.awal_menjabat}</TableCell>
                                  <TableCell>{latestJabatan.akhir_menjabat}</TableCell>
                                </TableRow>
                              )
                            )
                          }
                        )}
                  </TableBody>


                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>     


          {/* Placement History Tab */}
        <TabsContent value="placements">
        <PlacementAnalytics
            filteredAccounts={getFilteredAccounts}
            onFilterChange={setAccountsFilters}
          />             
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Masa Kerja
              </CardTitle>
              <CardDescription>Masa Kerja Pegawai di Kalimantan Utara</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableControls()}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Satuan kerja</TableHead>
                      <TableHead>Tanggal Masuk</TableHead>
                      {/* <TableHead>Tanggal Keluar</TableHead> */}
                      <TableHead>Lama Penempatan</TableHead>
                
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {paginateData(
                      // filterData(accountsapi, ["account_name"]).
                      getFilteredAccounts
                        .filter(acc =>
                          acc.account_penempatan.some(p => p.tanggal_keluar === null) &&
                          acc.account_jabatan.length > 0 &&
                          acc.account_jabatan[0].name &&
                          acc.account_jabatan[0].name.trim() !== '-'
                        )
                        
                        .sort((a, b) => {
                          const diffA = dayjs().diff(
                            dayjs(a.account_penempatan[0]?.tanggal_masuk, "DD-MM-YYYY"),
                            'day'
                          );
                          const diffB = dayjs().diff(
                            dayjs(b.account_penempatan[0]?.tanggal_masuk, "DD-MM-YYYY"),
                            'day'
                          );
                          
                          return diffB - diffA; // urut dari penempatan terlama
                        })
                      ).map((acc, index) => {
                      const penempatanAktif = acc.account_penempatan.find(
                        ( p: { tanggal_keluar: null }) => p.tanggal_keluar === null
                      );

                      return (
                        <TableRow key={acc.id} className="hover:bg-muted/50">
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{acc.account_name}</TableCell>
                          <TableCell>{penempatanAktif?.satuan_kerja || "-"}</TableCell>
                          <TableCell>{penempatanAktif?.tanggal_masuk || "-"}</TableCell>
                          <TableCell>
                            {penempatanAktif
                              ? daysDifference(penempatanAktif.tanggal_masuk)
                              : "-"}
                          </TableCell>
                        </TableRow>
                      );
                      })}
                    </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>           

         {/* Assistance History Tab */}
         <TabsContent value="assistance">
         <AssistanceAnalytics
            filteredAccounts={getFilteredAccounts}
            onFilterChange={setAccountsFilters}
          />       
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Assistance History
                {effectiveSearchTerm && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredAccounts.length} filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Employee assistance assignments and support activities</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableControls()}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pegawai</TableHead>
                      <TableHead>Unit Kerja Perbantuan</TableHead>
                      <TableHead>Tugas</TableHead>
                      <TableHead>Tanggal Mulai</TableHead>
                      <TableHead>Tanggal Selesai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {(Array.isArray(paginateData(getFilteredAccounts.filter(
                          (acc) => Array.isArray(acc.account_perbantuan) && acc.account_perbantuan.length > 0
                      ))) ? paginateData(getFilteredAccounts.filter(
                          (acc) => Array.isArray(acc.account_perbantuan) && acc.account_perbantuan.length > 0
                      )) : []).flatMap((account) =>
                        account.account_perbantuan.map((perbantuan) => (
                          <TableRow key={perbantuan.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{account.account_name}</TableCell>
                            <TableCell className="text-blue-600">{perbantuan.unit_perbantuan}</TableCell>
                            <TableCell>{perbantuan.deskripsi || "-"}</TableCell>
                            <TableCell>{perbantuan.tanggal_masuk}</TableCell>
                            <TableCell>{perbantuan.tanggal_keluar || "-"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
  

         {/* Pemeriksaan */}            
            {/* Audit Assignments Tab */}
        <TabsContent value="audits">
        <AuditAnalytics
            filteredAccounts={getFilteredAccounts}
            onFilterChange={setAccountsFilters}
          />       
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Audit Assignments
                {effectiveSearchTerm && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredAccounts.length} filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Employee audit assignments and responsibilities</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableControls()}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Pegawai</TableHead>
                      <TableHead>Entitas Pemeriksaan</TableHead>
                      <TableHead>Jenis Pemeriksaan</TableHead>
                      <TableHead>Peran</TableHead>
                      <TableHead>Tanggal Pemeriksaan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {(Array.isArray(paginateData(getFilteredAccounts.filter(
                          (acc) => Array.isArray(acc.pemeriksaan) && acc.pemeriksaan.length > 0
                      ))) ? paginateData(getFilteredAccounts.filter(
                          (acc) => Array.isArray(acc.pemeriksaan) && acc.pemeriksaan.length > 0
                      )) : []).flatMap((account) =>
                        account.pemeriksaan.map((pemeriksaan) => (
                          <TableRow key={pemeriksaan.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{account.account_name}</TableCell>
                            <TableCell className="text-blue-600">{pemeriksaan.entitas}</TableCell>
                            <TableCell>{pemeriksaan.jenis_pemeriksaan || "-"}</TableCell>
                            <TableCell>{pemeriksaan.pekerjaan}</TableCell>
                            <TableCell>{pemeriksaan.tanggal_pemeriksaan || "-"}</TableCell>
                          </TableRow>
                        ))
                      )}
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
