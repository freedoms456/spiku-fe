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
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Menu
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
    color: 'bg-red-500',     
    bgColor: 'bg-red-50',     
    borderColor: 'border-red-200'   
  },
  pt: {      
    name: 'Pengendali Teknis',      
    color: 'bg-orange-500',     
    bgColor: 'bg-orange-50',     
    borderColor: 'border-orange-200'   
  }
}

export default function DepartmentTeamBuilder() {
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
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
  const [activeDepartment, setActiveDepartment] = useState('akuntansi')

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
    const latestJabatan = getLatestJabatan(account.account_jabatan);

    const jabatanList = account.account_jabatan.filter(
      (j) => j.name?.toLowerCase().includes("pemeriksa")
    );
      // console.log(jabatanList)
      if (jabatanList.length > 0) {
      const earliest = jabatanList.reduce((min, curr) => {
        return new Date(curr.awal_menjabat) < new Date(min.awal_menjabat) ? curr : min;
      });

      const startDate = new Date(earliest.awal_menjabat);
      const now = new Date();

      const diffMs = now.getTime() - startDate.getTime();
      const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

      const yearsFormatted = diffYears.toFixed(1);
      
      if (parseFloat(yearsFormatted) > 5) {
        department = "leader"
      }
    }
  
    if (account.account_pendidikan && account.account_pendidikan.length > 0) {
      const firstEducation = account.account_pendidikan[0]
      if (department !== "leader") {
        department = categorizeDepartment(firstEducation.jurusan)
      }
    }

    if (latestJabatan.name.includes("Madya") || latestJabatan.name.includes("Muda")) {
      department = "pt"
    }
    
    let unit = "Unit Tidak Tersedia"
    if (account.account_jabatan && account.account_jabatan.length > 0) {
      const latestJabatan = getLatestJabatan(account.account_jabatan);
      unit = latestJabatan.name
    }
    
    return {
      id: account.id,
      name: account.account_name,
      department: department,
      experience: account.pemeriksaan.length,
      workload: " ",
      unit: unit
    }
  }, [categorizeDepartment])
  const parseDDMMYYYY = (dateString) => {
    if (!dateString) return new Date(0); // Return tanggal minimal jika tidak ada
    
    const parts = dateString.split('-');
    if (parts.length !== 3) return new Date(0);
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Bulan dimulai dari 0
    const year = parseInt(parts[2], 10);
    
    return new Date(year, month, day);
  };

  const getLatestJabatan = (accountJabatan) => {
    if (!accountJabatan || accountJabatan.length === 0) return null;
    
    // Urutkan jabatan berdasarkan tanggal awal_menjabat (dari yang terbaru)
    const sortedJabatan = [...accountJabatan].sort((a, b) => {
      const dateA = parseDDMMYYYY(a.awal_menjabat);
      const dateB = parseDDMMYYYY(b.awal_menjabat);
      return dateB - dateA; // Descending (terbaru ke terlama)
    });
    
    return sortedJabatan[0]; // Jabatan paling terbaru
  };
  
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

      const filteredAccounts = accounts.filter(account => {
        if (!account.account_jabatan || account.account_jabatan.length === 0) {
          return false
        }
        
        const latestJabatan = getLatestJabatan(account.account_jabatan);
        const jabatanName = latestJabatan.name ? latestJabatan.name.toLowerCase() : ''
        
        return jabatanName.includes('pemeriksa') 
      })
      
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
  const unassignedByDepartment = useMemo(() => {
    const assignedIds = new Set()
    teams.forEach(team => {
      Object.values(team.members).forEach(member => {
        if (member && member.department !== 'pt') {
          assignedIds.add(member.id)
        }
      })
    })

    const unassigned = {}
    Object.keys(DEPARTMENTS).forEach(dept => {
      if (dept === 'pt') {
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
        { id: 'slot1', department: 'pt', name: 'Pengendali Teknis' },
        { id: 'slot2', department: 'leader', name: 'Ketua Tim' },
        { id: 'slot3', department: 'akuntansi', name: 'AT Akuntansi' },
        { id: 'slot4', department: 'sipil', name: 'Anggota Tim (Sipil)' },
        { id: 'slot5', department: 'ti', name: 'Anggota Tim (IT)' },
        { id: 'slot6', department: 'lainnya', name: 'Anggota Tim' }
      ],
      members: { slot1: null, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null }
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
      id: `slot${Date.now()}`,
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
          if (slot.department !== 'pt') {
            availableByDept[slot.department] = deptEmployees.filter(emp => emp.id !== bestEmployee.id)
          }
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
    if (teamCount === 2) return 'grid-cols-1 lg:grid-cols-2'
    if (teamCount === 3) return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
    if (teamCount <= 4) return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-2'
    return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
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
            Tidak ditemukan data pegawai dengan jabatan "pemeriksa" di localStorage.
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
    <div className="min-h-screen bg-gray-50 flex">
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

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-80' : 'mr-0'} p-6`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl text-blue-800">
                    <GraduationCap className="w-8 h-8" />
                    Pembentukan Tim Berdasarkan Jurusan
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Drag & drop pegawai dari sidebar kanan ke slot tim yang sesuai
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  variant="outline"
                  className="lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={autoAssignTeams} className="bg-green-600 hover:bg-green-700">
              <Target className="w-4 h-4 mr-2" />
              Auto Assign
            </Button>
            <Button onClick={shuffleTeams} variant="outline">
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
            <Button onClick={resetTeams} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={addTeam} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Tim
            </Button>
            <Button onClick={downloadResults} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Teams Grid */}
                    {/* Teams Grid */}
                    <div className={`grid ${getGridColumns(teams.length)} gap-6`}>
            {teams.map(team => {
              const filledSlots = team.slots.filter(slot => team.members[slot.id]).length
              const completeness = Math.round((filledSlots / team.slots.length) * 100)
              
              return (
                <Card key={team.id} className="relative overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-colors">
                  <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          {team.name}
                        </CardTitle>
                        <CardDescription>
                          {filledSlots}/{team.slots.length} slot terisi ({completeness}%)
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => editTeamSlots(team.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTeam(team.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          completeness === 100 ? 'bg-green-500' : 
                          completeness >= 70 ? 'bg-blue-500' : 
                          completeness >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${completeness}%` }}
                      ></div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {team.slots.map(slot => {
                        const member = team.members[slot.id]
                        const deptInfo = DEPARTMENTS[slot.department]
                        const isMismatch = member && member.department !== slot.department
                        
                        return (
                          <div
                            key={slot.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, team.id, slot.id)}
                            className={`p-3 rounded-lg border-2 border-dashed min-h-16 flex flex-col justify-center ${
                              member ? deptInfo.bgColor : 'bg-gray-50'
                            } ${deptInfo.borderColor} transition-colors`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`${deptInfo.color} text-white border-0 text-xs`}
                                >
                                  {deptInfo.name}
                                </Badge>
                                <span className="text-sm font-medium text-gray-700">
                                  {slot.name}
                                </span>
                              </div>
                              {member && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setTeams(prev => prev.map(t => 
                                      t.id === team.id 
                                        ? { ...t, members: { ...t.members, [slot.id]: null } }
                                        : t
                                    ))
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            
                            {member ? (
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, member, team.id, slot.id)}
                                className={`p-2 rounded-md cursor-move bg-white border ${
                                  isMismatch 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-green-300 bg-green-50'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{member.name}</p>
                                    <p className="text-xs text-gray-600">{member.unit}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {member.experience} pemeriksaan
                                      </Badge>
                                      {isMismatch && (
                                        <Badge variant="outline" className="bg-red-100 text-red-800 text-xs border-red-200">
                                          ⚠️ Jurusan tidak sesuai
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Badge 
                                    className={`${DEPARTMENTS[member.department]?.color || 'bg-gray-500'} text-white border-0 ml-2`}
                                  >
                                    {DEPARTMENTS[member.department]?.name || 'Lainnya'}
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-2 text-gray-500 text-sm">
                                Drag pegawai ke sini
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sidebar - Employee Pool */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-white border-l shadow-lg transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } z-40 overflow-y-auto`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Pegawai Tersedia</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(DEPARTMENTS).map(([deptKey, deptInfo]) => {
              const availableEmployees = unassignedByDepartment[deptKey]
              const isActive = activeDepartment === deptKey
              
              return (
                <div key={deptKey} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActiveDepartment(isActive ? '' : deptKey)}
                    className={`w-full p-3 flex justify-between items-center ${
                      deptInfo.bgColor
                    } hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${deptInfo.color}`}></div>
                      <span className="font-medium">{deptInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white">
                        {availableEmployees.length} orang
                      </Badge>
                      {isActive ? (
                        <ChevronRight className="w-4 h-4 transform rotate-90" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                  
                  {isActive && (
                    <div className="max-h-60 overflow-y-auto">
                      {availableEmployees.length > 0 ? (
                        <div className="p-2 space-y-2">
                          {availableEmployees.map(employee => (
                            <div
                              key={employee.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, employee, null, null)}
                              className="p-2 border rounded-md bg-white cursor-move hover:shadow-md transition-shadow"
                            >
                              <p className="font-medium text-sm">{employee.name}</p>
                              <p className="text-xs text-gray-600">{employee.unit}</p>
                              <div className="flex justify-between items-center mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {employee.experience} pemeriksaan
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-blue-50 text-blue-700"
                                >
                                  Workload: {employee.workload}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          Tidak ada pegawai tersedia
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Summary */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ringkasan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(DEPARTMENTS).map(([deptKey, deptInfo]) => {
                  const total = employeesByDepartment[deptKey].length
                  const assigned = total - unassignedByDepartment[deptKey].length
                  
                  return (
                    <div key={deptKey} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${deptInfo.color}`}></div>
                        <span>{deptInfo.name}:</span>
                      </div>
                      <span className="font-medium">
                        {assigned}/{total}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}