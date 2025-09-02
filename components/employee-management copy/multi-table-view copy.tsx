"use client"

import { useState, useMemo } from "react"
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
  accounts,
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
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("10")
  const [activeTab, setActiveTab] = useState("accounts")

  // Chart filter states
  const [accountsFilters, setAccountsFilters] = useState<any>({})
  const [familyFilters, setFamilyFilters] = useState<any>({})
  const [educationFilters, setEducationFilters] = useState<any>({})
  const [certificationFilters, setCertificationFilters] = useState<any>({})

  // Use global search query if provided, otherwise use local search
  const effectiveSearchTerm = globalSearchQuery || searchTerm

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

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
    filtered = filterDataByName(filtered, ["account_name"])

    // Apply local search filter (for non-name fields)
    if (!globalSearchQuery && searchTerm) {
      filtered = filterData(filtered, ["account_unit", "account_jabatan"])
    }

    // Apply chart filters
    if (accountsFilters.gender) {
      filtered = filtered.filter((acc) => acc.account_jenis_kelamin === accountsFilters.gender)
    }
    if (accountsFilters.grade) {
      filtered = filtered.filter((acc) => acc.account_golongan === accountsFilters.grade)
    }
    if (accountsFilters.unit) {
      filtered = filtered.filter((acc) => acc.account_unit === accountsFilters.unit)
    }

    return filtered
  }, [effectiveSearchTerm, searchTerm, globalSearchQuery, accountsFilters])

  // Apply chart filters to families
  const getFilteredFamilies = useMemo(() => {
    let filtered = families

    // Apply name-based search filter
    filtered = filterDataByName(filtered, ["family_name"])

    // Apply local search filter (for non-name fields)
    if (!globalSearchQuery && searchTerm) {
      filtered = filterData(filtered, ["family_hubungan", "domisili_sekarang"])
    }

    // Apply chart filters
    if (familyFilters.employee) {
      const account = accounts.find((acc) => acc.account_name === familyFilters.employee)
      if (account) {
        filtered = filtered.filter((f) => f.account_id === account.id)
      }
    }
    if (familyFilters.location) {
      filtered = filtered.filter((f) => f.domisili_sekarang === familyFilters.location)
    }
    if (familyFilters.relation) {
      filtered = filtered.filter((f) => f.family_hubungan === familyFilters.relation)
    }

    return filtered
  }, [effectiveSearchTerm, searchTerm, globalSearchQuery, familyFilters])

  // Apply chart filters to educations
  const getFilteredEducations = useMemo(() => {
    let filtered = educations

    // Apply name-based search filter (searches employee names)
    filtered = filterDataByName(filtered, [])

    // Apply local search filter (for non-name fields)
    if (!globalSearchQuery && searchTerm) {
      filtered = filterData(filtered, ["education_tingkat", "education_institusi", "education_jurusan"])
    }

    // Apply chart filters
    if (educationFilters.level) {
      filtered = filtered.filter((edu) => edu.education_tingkat === educationFilters.level)
    }
    if (educationFilters.major) {
      filtered = filtered.filter((edu) => edu.education_jurusan === educationFilters.major)
    }
    if (educationFilters.institution) {
      filtered = filtered.filter((edu) => edu.education_institusi === educationFilters.institution)
    }

    return filtered
  }, [effectiveSearchTerm, searchTerm, globalSearchQuery, educationFilters])

  // Apply chart filters to trainings
  const getFilteredTrainings = useMemo(() => {
    let filtered = trainings

    // Apply name-based search filter (searches employee names)
    filtered = filterDataByName(filtered, [])

    // Apply local search filter (for non-name fields)
    if (!globalSearchQuery && searchTerm) {
      filtered = filterData(filtered, ["training_nama", "training_penyelenggara"])
    }

    return filtered
  }, [effectiveSearchTerm, searchTerm, globalSearchQuery])

  // Apply chart filters to certifications
  const getFilteredCertifications = useMemo(() => {
    let filtered = certifications

    // Apply name-based search filter (searches employee names)
    filtered = filterDataByName(filtered, [])

    // Apply local search filter (for non-name fields)
    if (!globalSearchQuery && searchTerm) {
      filtered = filterData(filtered, ["certification_nama", "certification_penerbit"])
    }

    // Apply chart filters
    if (certificationFilters.certType) {
      filtered = filtered.filter((cert) => cert.certification_nama === certificationFilters.certType)
    }
    if (certificationFilters.issuer) {
      filtered = filtered.filter((cert) => cert.certification_penerbit === certificationFilters.issuer)
    }
    if (certificationFilters.employee) {
      const employee = accounts.find((acc) => acc.account_name === certificationFilters.employee)
      if (employee) {
        filtered = filtered.filter((cert) => cert.account_id === employee.id)
      }
    }

    return filtered
  }, [effectiveSearchTerm, searchTerm, globalSearchQuery, certificationFilters])

  // Apply filters to positions
  const getFilteredPositions = useMemo(() => {
    let filtered = positions

    // Apply name-based search filter (searches employee names)
    filtered = filterDataByName(filtered, [])

    // Apply local search filter (for non-name fields)
    if (!globalSearchQuery && searchTerm) {
      filtered = filterData(filtered, ["position_jabatan", "position_unit"])
    }

    return filtered
  }, [effectiveSearchTerm, searchTerm, globalSearchQuery])

  // Apply filters to placements
  const getFilteredPlacements = useMemo(() => {
    let filtered = placementHistories

    // Apply name-based search filter
    filtered = filterDataByName(filtered, ["name"])

    // Apply local search filter (for non-name fields)
    if (!globalSearchQuery && searchTerm) {
      filtered = filterData(filtered, ["location"])
    }

    return filtered
  }, [effectiveSearchTerm, searchTerm, globalSearchQuery])

  // Apply filters to assistance
  const getFilteredAssistance = useMemo(() => {
    let filtered = assistanceHistories

    // Apply name-based search filter
    filtered = filterDataByName(filtered, ["name"])

    // Apply local search filter (for non-name fields)
    if (!globalSearchQuery && searchTerm) {
      filtered = filterData(filtered, ["unit", "task"])
    }

    return filtered
  }, [effectiveSearchTerm, searchTerm, globalSearchQuery])

  // Apply filters to audits
  const getFilteredAudits = useMemo(() => {
    let filtered = auditAssignments

    // Apply name-based search filter
    filtered = filterDataByName(filtered, ["name"])

    // Apply local search filter (for non-name fields)
    if (!globalSearchQuery && searchTerm) {
      filtered = filterData(filtered, ["entity", "area"])
    }

    return filtered
  }, [effectiveSearchTerm, searchTerm, globalSearchQuery])

  // Paginate data
  const paginateData = (data: any[]) => {
    const limit = Number.parseInt(entriesPerPage)
    return data.slice(0, limit)
  }

  // Modal Components
  const AccountDetailModal = ({ account }: { account: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          Show
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Employee Details
          </DialogTitle>
          <DialogDescription>Complete information for {account.account_name}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-sm font-semibold">{account.account_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="text-sm">
                    <Badge variant={account.account_jenis_kelamin === "Laki-laki" ? "default" : "secondary"}>
                      {account.account_jenis_kelamin}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Birth Date</label>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {account.account_tanggal_lahir} ({calculateAge(account.account_tanggal_lahir)} years old)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Birth Place</label>
                  <p className="text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {account.account_tempat_lahir}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Professional Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Position</label>
                  <p className="text-sm font-semibold text-blue-600">{account.account_jabatan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rank</label>
                  <p className="text-sm">
                    <Badge variant="outline">{account.account_pangkat}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Grade</label>
                  <p className="text-sm">
                    <Badge variant="secondary">{account.account_golongan}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee ID</label>
                  <p className="text-sm font-mono">{account.account_nip}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Unit/Department</label>
                <p className="text-sm flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {account.account_unit}
                </p>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone Number</label>
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {account.account_no_hp || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {account.account_email || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {account.account_alamat || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )

  const FamilyDetailModal = ({ family }: { family: any }) => {
    const employee = accounts.find((acc) => acc.id === family.account_id)
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Show
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Family Member Details
            </DialogTitle>
            <DialogDescription>Complete information for {family.family_name}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Employee Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee Name</label>
                  <p className="text-sm font-semibold text-blue-600">{employee?.account_name}</p>
                </div>
              </div>

              <Separator />

              {/* Family Member Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Family Member Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-sm font-semibold">{family.family_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Relationship</label>
                    <p className="text-sm">
                      <Badge variant="outline">{family.family_hubungan}</Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-sm">
                      <Badge variant={family.family_jenis_kelamin === "Laki-laki" ? "default" : "secondary"}>
                        {family.family_jenis_kelamin}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Birth Date</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {family.family_tanggal_lahir} ({calculateAge(family.family_tanggal_lahir)} years old)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Birth Place</label>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {family.family_tempat_lahir}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Health Status</label>
                    <p className="text-sm">
                      <Badge variant={family.kondisi_kesehatan === "Sehat" ? "default" : "destructive"}>
                        {family.kondisi_kesehatan === "Sehat" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {family.kondisi_kesehatan}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Address</label>
                    <p className="text-sm">{family.domisili_sekarang}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Origin Address</label>
                    <p className="text-sm">{family.domisili_asal}</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  const EducationDetailModal = ({ education }: { education: any }) => {
    const employee = accounts.find((acc) => acc.id === education.account_id)
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Show
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Education Details
            </DialogTitle>
            <DialogDescription>Complete education information</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Employee Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee Name</label>
                  <p className="text-sm font-semibold text-blue-600">{employee?.account_name}</p>
                </div>
              </div>

              <Separator />

              {/* Education Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Education Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Education Level</label>
                    <p className="text-sm">
                      <Badge variant="secondary">{education.education_tingkat}</Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Major/Field of Study</label>
                    <p className="text-sm font-semibold text-blue-600">{education.education_jurusan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Graduation Year</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {education.education_tahun_lulus}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">GPA</label>
                    <p className="text-sm flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <Badge variant="outline">{education.education_ipk}</Badge>
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Institution</label>
                  <p className="text-sm flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {education.education_institusi}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  const TrainingDetailModal = ({ training }: { training: any }) => {
    const employee = accounts.find((acc) => acc.id === training.account_id)
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Show
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Training Details
            </DialogTitle>
            <DialogDescription>Complete training information</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Employee Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee Name</label>
                  <p className="text-sm font-semibold text-blue-600">{employee?.account_name}</p>
                </div>
              </div>

              <Separator />

              {/* Training Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Training Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Training Name</label>
                    <p className="text-sm font-semibold text-blue-600">{training.training_nama}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p className="text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <Badge variant="outline">{training.training_durasi} hours</Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Year</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {training.training_tahun}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Certificate</label>
                    <p className="text-sm">
                      <Badge variant={training.training_sertifikat ? "default" : "secondary"}>
                        {training.training_sertifikat ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {training.training_sertifikat ? "Yes" : "No"}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Organizer</label>
                  <p className="text-sm flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {training.training_penyelenggara}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  const CertificationDetailModal = ({ cert }: { cert: any }) => {
    const employee = accounts.find((acc) => acc.id === cert.account_id)
    const isActive = new Date(cert.certification_tanggal_berakhir) > new Date()
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Show
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Certificate className="w-5 h-5" />
              Certification Details
            </DialogTitle>
            <DialogDescription>Complete certification information</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Employee Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee Name</label>
                  <p className="text-sm font-semibold text-blue-600">{employee?.account_name}</p>
                </div>
              </div>

              <Separator />

              {/* Certification Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Certificate className="w-4 h-4" />
                  Certification Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Certification Name</label>
                    <p className="text-sm font-semibold text-blue-600">{cert.certification_nama}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Issuer</label>
                    <p className="text-sm flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {cert.certification_penerbit}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Issue Date</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {cert.certification_tanggal_terbit}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Expiry Date</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {cert.certification_tanggal_berakhir}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-sm">
                      <Badge variant={isActive ? "default" : "destructive"}>
                        {isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {isActive ? "Active" : "Expired"}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  const PositionDetailModal = ({ position }: { position: any }) => {
    const employee = accounts.find((acc) => acc.id === position.account_id)
    const isCurrent = !position.position_tanggal_selesai
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Show
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Position Details
            </DialogTitle>
            <DialogDescription>Complete position information</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Employee Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee Name</label>
                  <p className="text-sm font-semibold text-blue-600">{employee?.account_name}</p>
                </div>
              </div>

              <Separator />

              {/* Position Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Position Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Position</label>
                    <p className="text-sm font-semibold text-blue-600">{position.position_jabatan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-sm">
                      <Badge variant={isCurrent ? "default" : "secondary"}>
                        {isCurrent ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {isCurrent ? "Current" : "Completed"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {position.position_tanggal_mulai}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {position.position_tanggal_selesai || "Present"}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Unit/Department</label>
                  <p className="text-sm flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {position.position_unit}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  const PlacementDetailModal = ({ placement }: { placement: any }) => {
    const isCurrent = !placement.to
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Show
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Placement Details
            </DialogTitle>
            <DialogDescription>Complete placement information</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Employee Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee Name</label>
                  <p className="text-sm font-semibold text-blue-600">{placement.name}</p>
                </div>
              </div>

              <Separator />

              {/* Placement Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Placement Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {placement.location}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-sm">
                      <Badge variant={isCurrent ? "default" : "secondary"}>
                        {isCurrent ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {isCurrent ? "Current" : "Completed"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {placement.start}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {placement.to || "Present"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  const AssistanceDetailModal = ({ assistance }: { assistance: any }) => {
    const isCurrent = !assistance.to
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Show
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Assistance Details
            </DialogTitle>
            <DialogDescription>Complete assistance information</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Employee Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee Name</label>
                  <p className="text-sm font-semibold text-blue-600">{assistance.name}</p>
                </div>
              </div>

              <Separator />

              {/* Assistance Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Assistance Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Unit</label>
                    <p className="text-sm">
                      <Badge variant="outline">{assistance.unit}</Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Task</label>
                    <p className="text-sm">
                      <Badge variant="secondary">{assistance.task}</Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {assistance.location}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-sm">
                      <Badge variant={isCurrent ? "default" : "secondary"}>
                        {isCurrent ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {isCurrent ? "Ongoing" : "Completed"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {assistance.start}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {assistance.to || "Ongoing"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  const AuditDetailModal = ({ audit }: { audit: any }) => {
    const isCurrent = !audit.to
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Show
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Audit Assignment Details
            </DialogTitle>
            <DialogDescription>Complete audit assignment information</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Employee Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee Name</label>
                  <p className="text-sm font-semibold text-blue-600">{audit.name}</p>
                </div>
              </div>

              <Separator />

              {/* Audit Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Audit Assignment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {audit.location}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Classification</label>
                    <p className="text-sm">
                      <Badge variant={audit.classify === "lkpd" ? "default" : "secondary"}>
                        {audit.classify.toUpperCase()}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Role</label>
                    <p className="text-sm">
                      <Badge variant="outline">{audit.role.toUpperCase()}</Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-sm">
                      <Badge variant={isCurrent ? "default" : "secondary"}>
                        {isCurrent ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {isCurrent ? "Ongoing" : "Completed"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {audit.start}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {audit.to || "Ongoing"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Entity</label>
                    <p className="text-sm">{audit.entity}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Area</label>
                    <p className="text-sm">{audit.area}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Indicator of Area</label>
                    <p className="text-sm">
                      <Badge variant="destructive" className="text-xs">
                        {audit.indicator_of_area}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
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
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>
    </div>
  )

  const summaryCards = [
    { title: "Total Accounts", value: accounts.length, icon: Users, color: "text-blue-600" },
    { title: "Family Records", value: families.length, icon: UserPlus, color: "text-green-600" },
    { title: "Education Records", value: educations.length, icon: GraduationCap, color: "text-purple-600" },
    { title: "Training Records", value: trainings.length, icon: Award, color: "text-orange-600" },
    { title: "Certifications", value: certifications.length, icon: Certificate, color: "text-red-600" },
    { title: "Position Records", value: positions.length, icon: Briefcase, color: "text-indigo-600" },
    { title: "Placement History", value: placementHistories.length, icon: MapPin, color: "text-teal-600" },
    { title: "Assistance History", value: assistanceHistories.length, icon: Heart, color: "text-pink-600" },
    { title: "Audit Assignments", value: auditAssignments.length, icon: ClipboardCheck, color: "text-cyan-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
      </div>

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
        <TabsList className="grid grid-cols-3 lg:grid-cols-10 w-full">
          <TabsTrigger value="accounts" className="text-xs">
            Accounts
          </TabsTrigger>
          <TabsTrigger value="families" className="text-xs">
            Families
          </TabsTrigger>
          <TabsTrigger value="educations" className="text-xs">
            Education
          </TabsTrigger>
          <TabsTrigger value="trainings" className="text-xs">
            Training
          </TabsTrigger>
          <TabsTrigger value="certifications" className="text-xs">
            Certificates
          </TabsTrigger>
          <TabsTrigger value="positions" className="text-xs">
            Positions
          </TabsTrigger>
          <TabsTrigger value="placements" className="text-xs">
            Placements
          </TabsTrigger>
          <TabsTrigger value="assistance" className="text-xs">
            Assistance
          </TabsTrigger>
          <TabsTrigger value="audits" className="text-xs">
            Audits
          </TabsTrigger>
          <TabsTrigger value="family-analytics" className="text-xs">
            <BarChart3 className="w-3 h-3 mr-1" />
            Family Analytics
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
              <CardDescription>Manage employee account information and details</CardDescription>
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
                        <TableCell className="text-blue-600 font-medium">{account.account_jabatan}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{account.account_pangkat}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{account.account_golongan}</Badge>
                        </TableCell>
                        <TableCell>
                          <AccountDetailModal account={account} />
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
            filteredFamilies={getFilteredFamilies}
            filteredAccounts={getFilteredAccounts}
            onFilterChange={setFamilyFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Family Information
                {(Object.keys(familyFilters).some((key) => familyFilters[key]) || effectiveSearchTerm) && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredFamilies.length} filtered
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
                      <TableHead>Employee</TableHead>
                      <TableHead>Family Member</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Birth Date</TableHead>
                      <TableHead>Health Status</TableHead>
                      <TableHead>Current Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(getFilteredFamilies).map((family) => (
                      <TableRow key={family.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {accounts.find((acc) => acc.id === family.account_id)?.account_name}
                        </TableCell>
                        <TableCell>{family.family_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{family.family_hubungan}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={family.family_jenis_kelamin === "Laki-laki" ? "default" : "secondary"}>
                            {family.family_jenis_kelamin}
                          </Badge>
                        </TableCell>
                        <TableCell>{family.family_tanggal_lahir}</TableCell>
                        <TableCell>
                          <Badge variant={family.kondisi_kesehatan === "Sehat" ? "default" : "destructive"}>
                            {family.kondisi_kesehatan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{family.domisili_sekarang}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <FamilyDetailModal family={family} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="educations" className="space-y-6">
          {/* Education Analytics Section */}
          <EducationAnalytics
            filteredEducations={getFilteredEducations}
            filteredAccounts={getFilteredAccounts}
            onFilterChange={setEducationFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education Records
                {(Object.keys(educationFilters).some((key) => educationFilters[key]) || effectiveSearchTerm) && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredEducations.length} filtered
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
                      <TableHead>Employee</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Major</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(getFilteredEducations).map((education) => (
                      <TableRow key={education.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {accounts.find((acc) => acc.id === education.account_id)?.account_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{education.education_tingkat}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={education.education_institusi}>
                          {education.education_institusi}
                        </TableCell>
                        <TableCell className="text-blue-600">{education.education_jurusan}</TableCell>
                        <TableCell>{education.education_tahun_lulus}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{education.education_ipk}</Badge>
                        </TableCell>
                        <TableCell>
                          <EducationDetailModal education={education} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="trainings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Training Records
                {effectiveSearchTerm && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredTrainings.length} filtered
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
                      <TableHead>Employee</TableHead>
                      <TableHead>Training Name</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(getFilteredTrainings).map((training) => (
                      <TableRow key={training.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {accounts.find((acc) => acc.id === training.account_id)?.account_name}
                        </TableCell>
                        <TableCell className="text-blue-600">{training.training_nama}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={training.training_penyelenggara}>
                          {training.training_penyelenggara}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{training.training_durasi} hours</Badge>
                        </TableCell>
                        <TableCell>{training.training_tahun}</TableCell>
                        <TableCell>
                          <Badge variant={training.training_sertifikat ? "default" : "secondary"}>
                            {training.training_sertifikat ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <TrainingDetailModal training={training} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          {/* Certification Analytics Section */}
          <CertificationAnalytics
            filteredCertifications={getFilteredCertifications}
            filteredAccounts={getFilteredAccounts}
            onFilterChange={setCertificationFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Certificate className="w-5 h-5" />
                Certifications
                {(Object.keys(certificationFilters).some((key) => certificationFilters[key]) ||
                  effectiveSearchTerm) && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredCertifications.length} filtered
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(getFilteredCertifications).map((cert) => (
                      <TableRow key={cert.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {accounts.find((acc) => acc.id === cert.account_id)?.account_name}
                        </TableCell>
                        <TableCell className="text-blue-600">{cert.certification_nama}</TableCell>
                        <TableCell>{cert.certification_penerbit}</TableCell>
                        <TableCell>{cert.certification_tanggal_terbit}</TableCell>
                        <TableCell>{cert.certification_tanggal_berakhir}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              new Date(cert.certification_tanggal_berakhir) > new Date() ? "default" : "destructive"
                            }
                          >
                            {new Date(cert.certification_tanggal_berakhir) > new Date() ? "Active" : "Expired"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <CertificationDetailModal cert={cert} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Position History
                {effectiveSearchTerm && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredPositions.length} filtered
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
                      <TableHead>Unit</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(getFilteredPositions).map((position) => (
                      <TableRow key={position.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {accounts.find((acc) => acc.id === position.account_id)?.account_name}
                        </TableCell>
                        <TableCell className="text-blue-600">{position.position_jabatan}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={position.position_unit}>
                          {position.position_unit}
                        </TableCell>
                        <TableCell>{position.position_tanggal_mulai}</TableCell>
                        <TableCell>{position.position_tanggal_selesai || "Present"}</TableCell>
                        <TableCell>
                          <Badge variant={!position.position_tanggal_selesai ? "default" : "secondary"}>
                            {!position.position_tanggal_selesai ? "Current" : "Completed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <PositionDetailModal position={position} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placement History Tab */}
        <TabsContent value="placements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Placement History
                {effectiveSearchTerm && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredPlacements.length} filtered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Employee placement locations and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableControls()}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(getFilteredPlacements).map((placement) => (
                      <TableRow key={placement.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{placement.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {placement.location}
                          </div>
                        </TableCell>
                        <TableCell>{placement.start}</TableCell>
                        <TableCell>{placement.to || "Present"}</TableCell>
                        <TableCell>
                          <Badge variant={!placement.to ? "default" : "secondary"}>
                            {!placement.to ? "Current" : "Completed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <PlacementDetailModal placement={placement} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assistance History Tab */}
        <TabsContent value="assistance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Assistance History
                {effectiveSearchTerm && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredAssistance.length} filtered
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
                      <TableHead>Employee</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(getFilteredAssistance).map((assistance) => (
                      <TableRow key={assistance.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{assistance.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{assistance.unit}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {assistance.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{assistance.task}</Badge>
                        </TableCell>
                        <TableCell>{assistance.start}</TableCell>
                        <TableCell>{assistance.to || "Ongoing"}</TableCell>
                        <TableCell>
                          <Badge variant={!assistance.to ? "default" : "secondary"}>
                            {!assistance.to ? "Ongoing" : "Completed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <AssistanceDetailModal assistance={assistance} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Assignments Tab */}
        <TabsContent value="audits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Audit Assignments
                {effectiveSearchTerm && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilteredAudits.length} filtered
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
                      <TableHead>Employee</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Indicator</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(getFilteredAudits).map((audit) => (
                      <TableRow key={audit.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{audit.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {audit.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={audit.classify === "lkpd" ? "default" : "secondary"}>
                            {audit.classify.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate" title={audit.entity}>
                          {audit.entity}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{audit.role.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[120px] truncate" title={audit.area}>
                          {audit.area}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate" title={audit.indicator_of_area}>
                          <Badge variant="destructive" className="text-xs">
                            {audit.indicator_of_area}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {audit.start} - {audit.to || "Ongoing"}
                        </TableCell>
                        <TableCell>
                          <AuditDetailModal audit={audit} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Family Analytics Tab */}
        <TabsContent value="family-analytics">
          <FamilyAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
