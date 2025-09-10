'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Download, 
  RotateCcw, 
  Target,
  Settings,
  X,
  Shuffle,
  BookOpen,
  AlertCircle
} from 'lucide-react'

const DEPARTMENTS = {   
  akuntansi: {      
    name: 'Akuntansi',      
    color: 'bg-green-500',      
    bgColor: 'bg-green-50',     
    borderColor: 'border-green-200'   
  },   
  sipil: {      
    name: 'Teknik Sipil',      
    color: 'bg-blue-500',     
    bgColor: 'bg-blue-50',     
    borderColor: 'border-blue-200'   
  },   
  ti: {      
    name: 'Teknologi Informasi',      
    color: 'bg-purple-500',     
    bgColor: 'bg-purple-50',     
    borderColor: 'border-purple-200'   
  },   
  hukum: {      
    name: 'Hukum / Legal',      
    color: 'bg-indigo-500',     
    bgColor: 'bg-indigo-50',     
    borderColor: 'border-indigo-200'   
  },
  lainnya: {      
    name: 'Lainnya',      
    color: 'bg-yellow-500',     
    bgColor: 'bg-yellow-50',     
    borderColor: 'border-yellow-200'   
  },
  leader: {      
    name: 'Ketua Tim',      
    color: 'bg-yellow-500',     
    bgColor: 'bg-yellow-50',     
    borderColor: 'border-yellow-200'   
  },
  pt: {      
    name: 'Pengelola Tim',      
    color: 'bg-yellow-500',     
    bgColor: 'bg-yellow-50',     
    borderColor: 'border-yellow-200'   
  }
}

export default function DepartmentTeamBuilder() {
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: "Tim 1",
      slots: [
        { id: 'slot1', department: 'pt', name: 'Pengendali Teknis' },
        { id: 'slot2', department: 'leader', name: 'Ketua Tim' },
        { id: 'slot3', department: 'akuntansi', name: 'AT Akuntansi' },
        { id: 'slot4', department: 'sipil', name: 'Anggota Tim (Sipil)' },
        { id: 'slot5', department: 'ti', name: 'Anggota Tim (IT)' },
        { id: 'slot6', department: 'lainnya', name: 'Anggota Tim' }
      ],
      members: { slot1: null, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null }
    },
    {
      id: 2,
      name: "Tim 2",
      slots: [
        { id: 'slot1', department: 'pt', name: 'Pengendali Teknis' },
        { id: 'slot2', department: 'leader', name: 'Ketua Tim' },
        { id: 'slot3', department: 'akuntansi', name: 'AT Akuntansi' },
        { id: 'slot4', department: 'sipil', name: 'Anggota Tim (Sipil)' },
        { id: 'slot5', department: 'ti', name: 'Anggota Tim (IT)' },
        { id: 'slot6', department: 'lainnya', name: 'Anggota Tim' }
      ],
      members: { slot1: null, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null }
    },
    {
      id: 3,
      name: "Tim 3",
      slots: [
        { id: 'slot1', department: 'pt', name: 'Pengendali Teknis' },
        { id: 'slot2', department: 'leader', name: 'Ketua Tim' },
        { id: 'slot3', department: 'akuntansi', name: 'AT Akuntansi' },
        { id: 'slot4', department: 'sipil', name: 'Anggota Tim (Sipil)' },
        { id: 'slot5', department: 'ti', name: 'Anggota Tim (IT)' },
        { id: 'slot6', department: 'lainnya', name: 'Anggota Tim' }
      ],
      members: { slot1: null, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null }
    },
    {
      id: 4,
      name: "Tim 4",
      slots: [
        { id: 'slot1', department: 'pt', name: 'Pengendali Teknis' },
        { id: 'slot2', department: 'leader', name: 'Ketua Tim' },
        { id: 'slot3', department: 'akuntansi', name: 'AT Akuntansi' },
        { id: 'slot4', department: 'sipil', name: 'Anggota Tim (Sipil)' },
        { id: 'slot5', department: 'ti', name: 'Anggota Tim (IT)' },
        { id: 'slot6', department: 'lainnya', name: 'Anggota Tim' }
      ],
      members: { slot1: null, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null }
    }
  ])
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [tempSlots, setTempSlots] = useState([])

  // Kategorisasi department berdasarkan jurusan
  const categorizeDepartment = useCallback((jurusan) => {
    if (!jurusan) return 'lainnya'
    
    const jurusanLower = jurusan.toLowerCase()
    
    if (jurusanLower.includes('akuntansi') || jurusanLower.includes('accounting')) {
      return 'akuntansi'
    }
    
    if (jurusanLower.includes('sipil') || jurusanLower.includes('civil')) {
      return 'sipil'
    }
    
    if (jurusanLower.includes('teknologi informasi') || 
        jurusanLower.includes('teknik informatika') ||
        jurusanLower.includes('sistem informasi') ||
        jurusanLower.includes('computer science') ||
        jurusanLower.includes('komputer') ||
        jurusanLower.includes('ilmu komputer') ||
        jurusanLower.includes('ti') ||
        jurusanLower.includes('informatika')) {
      return 'ti'
    }
    
    if (jurusanLower.includes('hukum') || 
        jurusanLower.includes('law') || 
        jurusanLower.includes('legal')) {
      return 'hukum'
    }
    
    return 'lainnya'
  }, [])

  // Transform account ke format employee
  const transformToEmployeeFormat = useCallback((account) => {
    let department = 'lainnya'
    const latestJabatan = account.account_jabatan[account.account_jabatan.length - 1]

      // Ambil semua jabatan dengan nama tertentu
  

    const jabatanList = account.account_jabatan.filter(
      (j: any) => j.name?.toLowerCase().includes("pemeriksa")
    );

 
      // Cari tanggal mulai paling lama (paling awal)
      const earliest = jabatanList.reduce((min: any, curr: any) => {
        return new Date(curr.awal_menjabat) < new Date(min.awal_menjabat) ? curr : min;
      });

      const startDate = new Date(earliest.awal_menjabat);
      const now = new Date();

      const diffMs = now.getTime() - startDate.getTime();
      const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

      const yearsFormatted = diffYears.toFixed(1);
    

   
  
    if (account.account_pendidikan && account.account_pendidikan.length > 0) {
      const firstEducation = account.account_pendidikan[0]
      department = categorizeDepartment(firstEducation.jurusan)
    }

    if (latestJabatan.name.includes("Muda" ) || yearsFormatted > 5) {
      // console.log(latestJabatan)
      department = "leader"
    }
    if (latestJabatan.name.includes("Muda" ) || latestJabatan.name.includes("Madya" ) ) {
      // console.log(latestJabatan)
      department = "pt"
    }
 
    
    let unit = "Unit Tidak Tersedia"
    if (account.account_jabatan && account.account_jabatan.length > 0) {
      const latestJabatan = account.account_jabatan[account.account_jabatan.length - 1]
      unit = latestJabatan.name
    }
    
    return {
      id: account.id,
      name: account.account_name,
      department: department,
      experience: account.pemeriksaan.length, // Random 1-10 tahun
      workload: " ",
      unit: unit
    }
  }, [categorizeDepartment])

  // Load data dari localStorage
  const loadEmployeesFromStorage = useCallback(() => {
    try {
      setIsLoading(true)
      const stored = localStorage.getItem("accounts")
      
      if (!stored) {
        console.warn("No accounts found in localStorage")
        setEmployees([])
        return
      }

      const accounts = JSON.parse(stored)
      
      if (!Array.isArray(accounts)) {
        console.warn("Invalid accounts data format")
        setEmployees([])
        return
      }

      // Filter accounts dengan jabatan pemeriksa atau kepala
      const filteredAccounts = accounts.filter(account => {
        if (!account.account_jabatan || account.account_jabatan.length === 0) {
          return false
        }
        
        const latestJabatan = account.account_jabatan[account.account_jabatan.length - 1]
        const jabatanName = latestJabatan.name ? latestJabatan.name.toLowerCase() : ''
        
        return jabatanName.includes('pemeriksa') 
      })
      
      // Transform ke format employee
      const transformedEmployees = filteredAccounts.map(account => 
        transformToEmployeeFormat(account)
      )
      
      console.log(`Loaded ${transformedEmployees.length} employees from localStorage`)
      setEmployees(transformedEmployees)
      
    } catch (error) {
      console.error("Error loading employees from localStorage:", error)
      setEmployees([])
    } finally {
      setIsLoading(false)
    }
  }, [transformToEmployeeFormat])

  // Load data saat component mount
  useEffect(() => {
    loadEmployeesFromStorage()
  }, [loadEmployeesFromStorage])

  // Group employees by department
  const employeesByDepartment = useMemo(() => {
    const grouped = {}
    Object.keys(DEPARTMENTS).forEach(dept => {
      grouped[dept] = employees.filter(emp => emp.department === dept)
        .sort((a, b) => {
          const workloadDiff = a.workload - b.workload
          if (workloadDiff !== 0) return workloadDiff
          return b.experience - a.experience
        })
    })
    return grouped
  }, [employees])

  // Get unassigned employees by department
   // Get unassigned employees by department
   const unassignedByDepartment = useMemo(() => {
    const assignedIds = new Set()
    teams.forEach(team => {
      Object.values(team.members).forEach(member => {
        if (member && member.department !== 'pt') { // PT bisa di multiple tim
          assignedIds.add(member.id)
        }
      })
    })

    const unassigned = {}
    Object.keys(DEPARTMENTS).forEach(dept => {
      if (dept === 'pt') {
        // PT selalu tersedia untuk semua tim
        unassigned[dept] = employeesByDepartment[dept]
      } else {
        unassigned[dept] = employeesByDepartment[dept].filter(emp => !assignedIds.has(emp.id))
      }
    })
    return unassigned
  }, [employeesByDepartment, teams])

  // Team management functions
  const addTeam = useCallback(() => {
    const newId = Math.max(...teams.map(t => t.id), 0) + 1
    const newTeam = {
      id: newId,
      name: `Tim ${newId}`,
      slots: [
        { id: 'slot1', department: 'akuntansi', name: 'Slot 1' }
      ],
      members: { slot1: null }
    }
    setTeams([...teams, newTeam])
  }, [teams])

  const removeTeam = useCallback((teamId) => {
    setTeams(teams.filter(t => t.id !== teamId))
  }, [teams])

  const editTeamSlots = useCallback((teamId) => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return
    
    setEditingTeam(teamId)
    setTempSlots([...team.slots])
    setShowSlotModal(true)
  }, [teams])

  // Slot management functions
  const addTempSlot = useCallback(() => {
    const newSlot = {
      id: `slot${Date.now()}`, // Unique ID
      department: 'akuntansi',
      name: `Slot ${tempSlots.length + 1}`
    }
    setTempSlots([...tempSlots, newSlot])
  }, [tempSlots])

  const removeTempSlot = useCallback((slotId) => {
    setTempSlots(tempSlots.filter(s => s.id !== slotId))
  }, [tempSlots])

  const updateTempSlot = useCallback((slotId, field, value) => {
    setTempSlots(tempSlots.map(slot => 
      slot.id === slotId ? { ...slot, [field]: value } : slot
    ))
  }, [tempSlots])

  const applySlotChanges = useCallback(() => {
    if (!editingTeam || tempSlots.length === 0) return
    
    setTeams(prevTeams => 
      prevTeams.map(team => {
        if (team.id === editingTeam) {
          const newMembers = {}
          tempSlots.forEach(slot => {
            newMembers[slot.id] = team.members[slot.id] || null
          })
          
          return {
            ...team,
            slots: [...tempSlots],
            members: newMembers
          }
        }
        return team
      })
    )
    
    setShowSlotModal(false)
    setEditingTeam(null)
    setTempSlots([])
  }, [editingTeam, tempSlots])

  // Team assignment functions
  const autoAssignTeams = useCallback(() => {
    const newTeams = teams.map(team => ({
      ...team,
      members: Object.fromEntries(team.slots.map(slot => [slot.id, null]))
    }))

    const availableByDept = { ...unassignedByDepartment }

    newTeams.forEach(team => {
      team.slots.forEach(slot => {
        const deptEmployees = availableByDept[slot.department]
        if (deptEmployees && deptEmployees.length > 0) {
          const bestEmployee = deptEmployees[0]
          team.members[slot.id] = bestEmployee
          availableByDept[slot.department] = deptEmployees.filter(emp => emp.id !== bestEmployee.id)
        }
      })
    })

    setTeams(newTeams)
  }, [teams, unassignedByDepartment])

  const shuffleTeams = useCallback(() => {
    const newTeams = [...teams]
    const allMembers = []
    
    newTeams.forEach(team => {
      Object.entries(team.members).forEach(([slotId, member]) => {
        if (member) {
          const slot = team.slots.find(s => s.id === slotId)
          allMembers.push({ member, department: slot.department })
        }
      })
    })

    newTeams.forEach(team => {
      Object.keys(team.members).forEach(slotId => {
        team.members[slotId] = null
      })
    })

    const membersByDept = {}
    allMembers.forEach(({ member, department }) => {
      if (!membersByDept[department]) membersByDept[department] = []
      membersByDept[department].push(member)
    })

    Object.keys(membersByDept).forEach(dept => {
      for (let i = membersByDept[dept].length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [membersByDept[dept][i], membersByDept[dept][j]] = [membersByDept[dept][j], membersByDept[dept][i]]
      }
    })

    newTeams.forEach(team => {
      team.slots.forEach(slot => {
        const deptMembers = membersByDept[slot.department]
        if (deptMembers && deptMembers.length > 0) {
          team.members[slot.id] = deptMembers.pop()
        }
      })
    })

    setTeams(newTeams)
  }, [teams])

  const resetTeams = useCallback(() => {
    setTeams(teams.map(team => ({
      ...team,
      members: Object.fromEntries(team.slots.map(slot => [slot.id, null]))
    })))
  }, [teams])

  // Drag and drop handlers
  const handleDragStart = (e, employee, fromTeam, fromSlot) => {
    const dragData = { 
      employeeId: employee.id, 
      fromTeam, 
      fromSlot,
      employee: employee 
    }
    e.dataTransfer.setData('application/json', JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, toTeam, toSlot) => {
    e.preventDefault()
    
    try {
      const dragDataText = e.dataTransfer.getData('application/json')
      if (!dragDataText) return
      
      const dragData = JSON.parse(dragDataText)
      const employee = dragData.employee || employees.find(emp => emp.id === dragData.employeeId)
      
      if (!employee) return
      
      let existingMember = null
      if (toTeam && toSlot) {
        const targetTeam = teams.find(t => t.id === toTeam)
        existingMember = targetTeam?.members[toSlot]
      }
      
      setTeams(prevTeams => {
        return prevTeams.map(team => {
          const updatedTeam = { ...team, members: { ...team.members } }
          
          if (team.id === dragData.fromTeam && dragData.fromSlot) {
            updatedTeam.members[dragData.fromSlot] = existingMember
          }
          
          if (team.id === toTeam && toSlot) {
            updatedTeam.members[toSlot] = employee
          }
          
          return updatedTeam
        })
      })
      
    } catch (error) {
      console.error('Drop error:', error)
    }
  }

  const downloadResults = useCallback(() => {
    const content = teams.map(team => {
      const members = team.slots.map(slot => {
        const member = team.members[slot.id]
        const deptName = DEPARTMENTS[slot.department].name
        const mismatchWarning = member && member.department !== slot.department ? ' (⚠️ Tidak sesuai jurusan)' : ''
        return `  ${slot.name} (${deptName}): ${member ? `${member.name} - ${member.unit}${mismatchWarning}` : 'Tidak Terisi'}`
      }).join('\n')
      
      const filledSlots = team.slots.filter(slot => team.members[slot.id]).length
      const completeness = Math.round((filledSlots / team.slots.length) * 100)
      
      return `${team.name}\nKelengkapan: ${completeness}% (${filledSlots}/${team.slots.length})\nAnggota:\n${members}\n`
    }).join('\n' + '='.repeat(40) + '\n\n')
    
    const header = 'HASIL PEMBENTUKAN TIM BERDASARKAN JURUSAN\n' + '='.repeat(40) + '\n\n'
    
    const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `team-department-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [teams])

  const getGridColumns = (teamCount) => {
    if (teamCount === 1) return 'grid-cols-1'
    if (teamCount === 2) return 'grid-cols-1 md:grid-cols-2'
    if (teamCount === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    if (teamCount <= 4) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pegawai...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (employees.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Data Pegawai</h3>
          <p className="text-gray-600 mb-4">
            Tidak ditemukan data pegawai dengan jabatan "pemeriksa" atau "kepala" di localStorage.
          </p>
          <Button onClick={loadEmployeesFromStorage} className="bg-blue-600 hover:bg-blue-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Muat Ulang Data
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Slot Editor Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Slot Tim</h3>
              <Button size="sm" variant="ghost" onClick={() => setShowSlotModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Slot dalam Tim</Label>
                <Button size="sm" onClick={addTempSlot}>
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Slot
                </Button>
              </div>
              
              <div className="space-y-3">
                {tempSlots.map(slot => (
                  <div key={slot.id} className="flex gap-2 items-center p-3 border rounded-lg">
                    <Input
                      value={slot.name}
                      onChange={(e) => updateTempSlot(slot.id, 'name', e.target.value)}
                      placeholder="Nama slot"
                      className="flex-1"
                    />
                    <Select
                      value={slot.department}
                      onValueChange={(value) => updateTempSlot(slot.id, 'department', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                          <SelectItem key={key} value={key}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="ghost" onClick={() => removeTempSlot(slot.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                
                {tempSlots.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Belum ada slot. Klik "Tambah Slot" untuk memulai.
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowSlotModal(false)}>
                Batal
              </Button>
              <Button onClick={applySlotChanges} disabled={tempSlots.length === 0}>
                Terapkan
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-blue-800">
              <GraduationCap className="w-8 h-8" />
              Pembentukan Tim Berdasarkan Jurusan
            </CardTitle>
            <CardDescription className="text-blue-600">
              Sistem pembentukan tim dinamis berdasarkan jurusan pendidikan dari data localStorage
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Data Info */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-800">
                  <strong>Total Pegawai:</strong> {employees.length} orang (dengan jabatan pemeriksa/kepala)
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Data diambil dari localStorage dan dikategorisasi berdasarkan jurusan pendidikan
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={loadEmployeesFromStorage}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Settings className="w-5 h-5" />
              Manajemen Tim
            </CardTitle>
            <CardDescription>
              Atur jumlah tim dan konfigurasi slot untuk setiap tim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-medium">Jumlah Tim: {teams.length}</h4>
                <p className="text-xs text-gray-500">Tim dapat ditambah sesuai kebutuhan</p>
              </div>
              <Button 
                size="sm" 
                onClick={addTeam}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Tim
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teams.map(team => (
                <div key={team.id} className="p-3 bg-white border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{team.name}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => editTeamSlots(team.id)}>
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeTeam(team.id)}
                        disabled={teams.length <= 1}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {team.slots.length} slot • {team.slots.filter(s => team.members[s.id]).length} terisi
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={autoAssignTeams} className="bg-green-600 hover:bg-green-700">
            <Target className="w-4 h-4 mr-2" />
            Auto Assign
          </Button>
          <Button onClick={shuffleTeams} variant="outline">
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle Teams
          </Button>
          <Button onClick={resetTeams} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
          <Button onClick={downloadResults} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download Results
          </Button>
        </div>

        {/* Teams Grid */}
        <div className={`grid gap-6 ${getGridColumns(teams.length)}`}>
          {teams.map(team => {
            const filledSlots = team.slots.filter(slot => team.members[slot.id]).length
            const completeness = (filledSlots / team.slots.length) * 100
            
            return (
              <Card key={team.id} className="border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <Badge variant={completeness === 100 ? "default" : "secondary"}>
                      {filledSlots}/{team.slots.length}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {team.slots.map(slot => {
                    const member = team.members[slot.id]
                    const deptConfig = DEPARTMENTS[slot.department]
                    const isMismatch = member && member.department !== slot.department
                    
                    return (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          member 
                            ? isMismatch 
                              ? 'border-solid border-red-400 bg-red-50'
                              : `border-solid ${deptConfig.borderColor} ${deptConfig.bgColor}`
                            : 'border-dashed border-gray-300 bg-gray-50 hover:border-blue-400'
                        }`}
                        onDrop={(e) => handleDrop(e, team.id, slot.id)}
                        onDragOver={handleDragOver}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${deptConfig.color}`} />
                            <span className="font-medium text-sm">{slot.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {deptConfig.name}
                          </Badge>
                        </div>
                        
                        {member ? (
                          <div 
                            draggable
                            onDragStart={(e) => handleDragStart(e, member, team.id, slot.id)}
                            className="cursor-move"
                          >
                            <div className="font-medium text-sm">{member.name}</div>
                            <div className="text-xs text-gray-500 mb-1">{member.unit}</div>
                            <div className="flex justify-between items-center text-xs">
                              <span>Jumlah: {member.experience} Pemeriksaan</span>
                              <Badge 
                                variant={member.workload < 0.5 ? "default" : member.workload < 0.8 ? "secondary" : "destructive"} 
                                className="text-[10px] px-1 py-0"
                              >
                                {/* Load: {Math.round(member.workload * 100)}% */}
                              </Badge>
                            </div>
                            {isMismatch && (
                              <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <span className="font-medium">⚠️ Jurusan tidak sesuai</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 py-2">
                            <span className="text-xs">Drop {deptConfig.name} here</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Department Pools */}
        <div className="space-y-4">
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <BookOpen className="w-5 h-5" />
                Pool Pegawai Berdasarkan Jurusan
              </CardTitle>
              <CardDescription>
                Drag pegawai dari pool jurusan ke slot tim yang sesuai
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Object.entries(DEPARTMENTS).map(([deptKey, deptConfig]) => {
              const deptEmployees = unassignedByDepartment[deptKey] || []
              
              return (
                <Card key={deptKey} className={`${deptConfig.borderColor} ${deptConfig.bgColor} border-2`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded-full ${deptConfig.color}`} />
                      {deptConfig.name}
                      <Badge variant="outline" className="ml-auto">
                        {deptEmployees.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto"
                      onDrop={(e) => handleDrop(e, null, null)}
                      onDragOver={handleDragOver}
                    >
                      {deptEmployees.map(employee => (
                        <div
                          key={employee.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, employee, null, null)}
                          className="cursor-move bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                        >
                          <div className="font-medium text-sm mb-1">{employee.name}</div>
                          <div className="text-xs text-gray-500 mb-2">{employee.unit}</div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Jumlah: {employee.experience} Pemeriksaan</span>
                            <Badge 
                              variant={
                                employee.workload < 0.5 ? "default" : 
                                employee.workload < 0.8 ? "secondary" : "destructive"
                              } 
                              className="text-[10px] px-1 py-0"
                            >
                              {/* Load: {Math.round(employee.workload * 100)}% */}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {deptEmployees.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Semua pegawai {deptConfig.name} sudah ditempatkan</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Team Statistics */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Users className="w-5 h-5" />
              Statistik Tim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map(team => {
                const filledSlots = team.slots.filter(slot => team.members[slot.id]).length
                const completeness = Math.round((filledSlots / team.slots.length) * 100)
                
                const deptDistribution = {}
                const mismatchCount = {}
                team.slots.forEach(slot => {
                  const member = team.members[slot.id]
                  if (member) {
                    deptDistribution[slot.department] = (deptDistribution[slot.department] || 0) + 1
                    if (member.department !== slot.department) {
                      mismatchCount[slot.department] = (mismatchCount[slot.department] || 0) + 1
                    }
                  }
                })
                
                const totalMismatches = Object.values(mismatchCount).reduce((sum, count) => sum + count, 0)
                
                return (
                  <div key={team.id} className="bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{team.name}</h4>
                      <div className="flex gap-1">
                        <Badge variant={completeness === 100 ? "default" : "secondary"}>
                          {completeness}%
                        </Badge>
                        {totalMismatches > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {totalMismatches} mismatch
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Kelengkapan: {filledSlots}/{team.slots.length} slot
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${completeness}%` }}
                        />
                      </div>
                      
                      <div className="text-xs space-y-1">
                        <div className="font-medium text-gray-700">Distribusi Jurusan:</div>
                        {Object.entries(deptDistribution).map(([dept, count]) => (
                          <div key={dept} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${DEPARTMENTS[dept].color}`} />
                              <span>{DEPARTMENTS[dept].name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{count}</span>
                              {mismatchCount[dept] && (
                                <span className="text-red-500 text-xs">({mismatchCount[dept]} ⚠️)</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {Object.keys(deptDistribution).length === 0 && (
                          <div className="text-gray-500 italic">Tim belum terisi</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-blue-800">Cara Penggunaan</h4>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>• Data pegawai diambil dari localStorage (filter: jabatan pemeriksa/kepala)</li>
                <li>• Tambah tim baru dengan tombol "Tambah Tim"</li>
                <li>• Klik ikon gear pada setiap tim untuk mengatur slot dan jurusan yang dibutuhkan</li>
                <li>• Drag & drop pegawai dari pool jurusan ke slot tim yang sesuai</li>
                <li>• Background merah menandakan ketidaksesuaian jurusan pegawai dengan slot</li>
                <li>• Auto Assign mengisi slot berdasarkan workload terendah dan pengalaman tertinggi</li>
                <li>• Shuffle mengacak penempatan pegawai dalam jurusan yang sama</li>
                <li>• Download hasil untuk mendapatkan laporan tim dalam format teks</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}