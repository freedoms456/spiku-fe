import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Database, BarChart3, FileText, TrendingUp, Table, Settings } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation";

export default function Home() {
    redirect("/login"); // langsung lempar ke login

  // return (
  //   <div className="min-h-screen bg-background">
  //     {/* Header */}
  //     <div className="border-b bg-card">
  //       <div className="container mx-auto px-4 py-6">
  //         <div className="text-center">
  //           <h1 className="text-4xl font-bold mb-2">SPIKU</h1>
  //           <p className="text-xl text-muted-foreground">Sistem Pelaporan Informasi Kepegawaian Universitas</p>
  //         </div>
  //       </div>
  //     </div>

  //     {/* Main Content */}
  //     <div className="container mx-auto px-4 py-12">
  //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
  //         {/* Employee Management Card */}
  //         <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200">
  //           <CardHeader>
  //             <CardTitle className="flex items-center gap-2 text-blue-700">
  //               <Settings className="h-5 w-5" />
  //               Employee Management
  //             </CardTitle>
  //             <CardDescription>Complete employee data management with multiple related tables</CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             <Link href="/employee-management">
  //               <Button className="w-full bg-blue-600 hover:bg-blue-700">Access Management System</Button>
  //             </Link>
  //           </CardContent>
  //         </Card>

  //         {/* Table Master Card */}
  //         <Card className="hover:shadow-lg transition-shadow">
  //           <CardHeader>
  //             <CardTitle className="flex items-center gap-2">
  //               <Database className="h-5 w-5" />
  //               Data Master Pegawai
  //             </CardTitle>
  //             <CardDescription>Kelola dan lihat data master pegawai universitas</CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             <Link href="/table-master">
  //               <Button className="w-full">Lihat Data Master</Button>
  //             </Link>
  //           </CardContent>
  //         </Card>

  //         {/* HR Analytics Card */}
  //         <Card className="hover:shadow-lg transition-shadow">
  //           <CardHeader>
  //             <CardTitle className="flex items-center gap-2">
  //               <BarChart3 className="h-5 w-5" />
  //               HR Analytics Dashboard
  //             </CardTitle>
  //             <CardDescription>Analisis komprehensif data kepegawaian dan insights</CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             <Link href="/hr-analytics">
  //               <Button className="w-full">Lihat HR Analytics</Button>
  //             </Link>
  //           </CardContent>
  //         </Card>

  //         {/* Employee Analytics Card */}
  //         <Card className="hover:shadow-lg transition-shadow">
  //           <CardHeader>
  //             <CardTitle className="flex items-center gap-2">
  //               <Users className="h-5 w-5" />
  //               Employee Analytics
  //             </CardTitle>
  //             <CardDescription>Visualisasi dan analisis data demografis pegawai</CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             <Link href="/employee-analytics">
  //               <Button className="w-full bg-transparent" variant="outline">
  //                 Lihat Employee Analytics
  //               </Button>
  //             </Link>
  //           </CardContent>
  //         </Card>

  //         {/* Modern Table Card */}
  //         <Card className="hover:shadow-lg transition-shadow">
  //           <CardHeader>
  //             <CardTitle className="flex items-center gap-2">
  //               <Table className="h-5 w-5" />
  //               Modern Data Table
  //             </CardTitle>
  //             <CardDescription>Clean, professional table design with sorting and search</CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             <Link href="/modern-table">
  //               <Button className="w-full" variant="secondary">
  //                 View Modern Table
  //               </Button>
  //             </Link>
  //           </CardContent>
  //         </Card>

  //         {/* ApexCharts Demo Card */}
  //         <Card className="hover:shadow-lg transition-shadow">
  //           <CardHeader>
  //             <CardTitle className="flex items-center gap-2">
  //               <TrendingUp className="h-5 w-5" />
  //               Advanced Charts
  //             </CardTitle>
  //             <CardDescription>Interactive charts with ApexCharts integration</CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             <Link href="/apex-funnel">
  //               <Button className="w-full" variant="secondary">
  //                 View ApexCharts Demo
  //               </Button>
  //             </Link>
  //           </CardContent>
  //         </Card>
  //       </div>

  //       {/* Statistics Overview */}
  //       <div className="mt-12 text-center">
  //         <h2 className="text-2xl font-bold mb-6">Ringkasan Sistem</h2>
  //         <div className="grid grid-cols-1 md:grid-cols-6 gap-6 max-w-6xl mx-auto">
  //           <div className="p-6 bg-card rounded-lg border">
  //             <Settings className="h-8 w-8 mx-auto mb-2 text-blue-600" />
  //             <div className="text-2xl font-bold">1</div>
  //             <p className="text-sm text-muted-foreground">Management System</p>
  //           </div>
  //           <div className="p-6 bg-card rounded-lg border">
  //             <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
  //             <div className="text-2xl font-bold">8</div>
  //             <p className="text-sm text-muted-foreground">Total Pegawai</p>
  //           </div>
  //           <div className="p-6 bg-card rounded-lg border">
  //             <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
  //             <div className="text-2xl font-bold">6</div>
  //             <p className="text-sm text-muted-foreground">Unit Kerja</p>
  //           </div>
  //           <div className="p-6 bg-card rounded-lg border">
  //             <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
  //             <div className="text-2xl font-bold">4</div>
  //             <p className="text-sm text-muted-foreground">Golongan</p>
  //           </div>
  //           <div className="p-6 bg-card rounded-lg border">
  //             <Table className="h-8 w-8 mx-auto mb-2 text-primary" />
  //             <div className="text-2xl font-bold">6</div>
  //             <p className="text-sm text-muted-foreground">Data Tables</p>
  //           </div>
  //           <div className="p-6 bg-card rounded-lg border">
  //             <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
  //             <div className="text-2xl font-bold">6</div>
  //             <p className="text-sm text-muted-foreground">Dashboard Modules</p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // )
}
