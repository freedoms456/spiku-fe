"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

export default function MultiTableView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("10")
  const [activeTab, setActiveTab] = useState("accounts")

  // Filter function for search
  const filterData = (data: any[], searchFields: string[]) => {
    if (!searchTerm) return data
    return data.filter((item) =>
      searchFields.some((field) => item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }

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
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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
          {/* Analytics Section - Only for Accounts */}
          <AccountsAnalytics />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Employee Accounts
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
                    {paginateData(filterData(accounts, ["account_name", "account_unit", "account_jabatan"])).map(
                      (account) => (
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
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Families Tab */}
        <TabsContent value="families" className="space-y-6">
          {/* Family Analytics Section */}
          <FamilyAnalytics />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Family Information
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
                    {paginateData(filterData(families, ["family_name", "family_hubungan", "domisili_sekarang"])).map(
                      (family) => (
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
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="educations" className="space-y-6">
          {/* Education Analytics Section */}
          <EducationAnalytics />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education Records
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
                    {paginateData(
                      filterData(educations, ["education_tingkat", "education_institusi", "education_jurusan"]),
                    ).map((education) => (
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
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
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
                    {paginateData(filterData(trainings, ["training_nama", "training_penyelenggara"])).map(
                      (training) => (
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
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Certificate className="w-5 h-5" />
                Certifications
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
                    {paginateData(filterData(certifications, ["certification_nama", "certification_penerbit"])).map(
                      (cert) => (
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
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
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
                    {paginateData(filterData(positions, ["position_jabatan", "position_unit"])).map((position) => (
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
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
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
                    {paginateData(filterData(placementHistories, ["name", "location"])).map((placement) => (
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
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
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
                    {paginateData(filterData(assistanceHistories, ["name", "unit", "task"])).map((assistance) => (
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
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
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
                    {paginateData(filterData(auditAssignments, ["name", "entity", "area"])).map((audit) => (
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
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
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
