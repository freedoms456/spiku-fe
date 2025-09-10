'use client'
import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Users, 
  Shuffle, 
  Lock, 
  Unlock, 
  Download, 
  RotateCcw, 
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Info,
  Plus,
  Trash2,
  Settings,
  X,
  AlertCircle
} from 'lucide-react'
import Navbar from "@/components/employee-management/navbar"
// Simple Progress component
const Progress = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(Math.max(value || 0, 0), 100)}%` }}
    ></div>
  </div>
)

// Sample static data
const SAMPLE_EMPLOYEES = [
  { id: 1, name: "Andi Saputra", unit: "Subauditorat", skills: { sipil: 85, it: 75, hukum: 60, finance: 70, leadership: 80 }, workload: 0.7, experience: 5 },
  { id: 2, name: "Budi Hartono", unit: "Sekretariat", skills: { sipil: 70, it: 90, hukum: 55, finance: 85, leadership: 75 }, workload: 0.9, experience: 7 },
  { id: 3, name: "Citra Dewi", unit: "Subauditorat", skills: { sipil: 50, it: 40, hukum: 95, finance: 60, leadership: 70 }, workload: 0.5, experience: 3 },
  { id: 4, name: "Dodi Setiawan", unit: "Subbagian Keuangan", skills: { sipil: 75, it: 65, hukum: 70, finance: 90, leadership: 85 }, workload: 0.6, experience: 6 },
  { id: 5, name: "Eka Putri", unit: "Subbagian Umum", skills: { sipil: 60, it: 95, hukum: 45, finance: 55, leadership: 60 }, workload: 0.4, experience: 4 },
  { id: 6, name: "Fajar Rahman", unit: "Subauditorat", skills: { sipil: 90, it: 70, hukum: 75, finance: 65, leadership: 90 }, workload: 0.8, experience: 8 },
  { id: 7, name: "Gita Sari", unit: "Sekretariat", skills: { sipil: 45, it: 80, hukum: 85, finance: 75, leadership: 65 }, workload: 0.3, experience: 2 },
  { id: 8, name: "Hadi Wijaya", unit: "Subbagian Keuangan", skills: { sipil: 80, it: 85, hukum: 50, finance: 95, leadership: 80 }, workload: 0.7, experience: 9 },
  { id: 9, name: "Indira Kusuma", unit: "Subbagian Umum", skills: { sipil: 65, it: 60, hukum: 90, finance: 70, leadership: 75 }, workload: 0.5, experience: 4 },
  { id: 10, name: "Joko Santoso", unit: "Subauditorat", skills: { sipil: 95, it: 55, hukum: 60, finance: 80, leadership: 95 }, workload: 0.6, experience: 10 },
  { id: 11, name: "Kartika Dewi", unit: "Sekretariat", skills: { sipil: 55, it: 85, hukum: 75, finance: 65, leadership: 70 }, workload: 0.4, experience: 3 },
  { id: 12, name: "Lukman Hakim", unit: "Subbagian Keuangan", skills: { sipil: 70, it: 75, hukum: 80, finance: 85, leadership: 85 }, workload: 0.8, experience: 6 }
]

// Team history - only last team matters for alert
const TEAM_HISTORY = {
  1: [1, 2], 2: [2, 3], 3: [1], 4: [3], 5: [1, 3], 6: [2], 
  7: [1], 8: [3], 9: [2], 10: [1], 11: [2, 3], 12: [1, 2]
}

// Get last team from history
const getLastTeam = (employeeId) => {
  const history = TEAM_HISTORY[employeeId]
  return history && history.length > 0 ? history[history.length - 1] : null
}

// Role definitions
const ROLE_CONFIGS = {
  sipil: { name: 'Sipil Expert', skill: 'sipil', color: 'bg-blue-500' },
  it: { name: 'IT Expert', skill: 'it', color: 'bg-green-500' },
  hukum: { name: 'Legal Expert', skill: 'hukum', color: 'bg-purple-500' },
  finance: { name: 'Finance Expert', skill: 'finance', color: 'bg-orange-500' },
  leadership: { name: 'Team Leader', skill: 'leadership', color: 'bg-red-500' }
}

// Team templates
const TEAM_TEMPLATES = {
  balanced: {
    name: "Tim Seimbang",
    positions: [
      { id: 'pos1', role: 'sipil', name: 'Sipil Expert' },
      { id: 'pos2', role: 'it', name: 'IT Expert' },
      { id: 'pos3', role: 'hukum', name: 'Legal Expert' },
      { id: 'pos4', role: 'finance', name: 'Finance Expert' },
      { id: 'pos5', role: 'leadership', name: 'Team Leader' }
    ]
  },
  technical: {
    name: "Tim Teknis",
    positions: [
      { id: 'pos1', role: 'sipil', name: 'Sipil Expert 1' },
      { id: 'pos2', role: 'sipil', name: 'Sipil Expert 2' },
      { id: 'pos3', role: 'it', name: 'IT Expert 1' },
      { id: 'pos4', role: 'it', name: 'IT Expert 2' },
      { id: 'pos5', role: 'leadership', name: 'Team Leader' }
    ]
  },
  audit: {
    name: "Tim Audit",
    positions: [
      { id: 'pos1', role: 'hukum', name: 'Legal Expert 1' },
      { id: 'pos2', role: 'hukum', name: 'Legal Expert 2' },
      { id: 'pos3', role: 'finance', name: 'Finance Expert 1' },
      { id: 'pos4', role: 'finance', name: 'Finance Expert 2' },
      { id: 'pos5', role: 'leadership', name: 'Team Leader' }
    ]
  },
  custom: {
    name: "Custom",
    positions: []
  }
}

// Custom Alert Component
const CustomAlert = ({ show, onClose, employee, teamId }) => {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 animate-in zoom-in-95">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Informasi Riwayat Tim
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              <span className="font-medium">{employee?.name}</span> pernah berada di <span className="font-medium">Tim {teamId}</span> pada pemeriksaan terakhir.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
              <p className="text-xs text-orange-800">
                💡 <span className="font-medium">Tips:</span> Penempatan pegawai di tim yang sama dengan pemeriksaan sebelumnya dapat mempengaruhi objektivitas audit.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClose}
              >
                Tetap Tempatkan
              </Button>
              <Button 
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={onClose}
              >
                Mengerti
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeamFormationBuilder() {
  const [employees] = useState(SAMPLE_EMPLOYEES)
  const [selectedTemplate, setSelectedTemplate] = useState('balanced')
  const [teams, setTeams] = useState(() => 
    Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      name: `Tim ${i + 1}`,
      template: 'balanced',
      positions: [...TEAM_TEMPLATES.balanced.positions],
      members: Object.fromEntries(TEAM_TEMPLATES.balanced.positions.map(pos => [pos.id, null])),
      locked: Object.fromEntries(TEAM_TEMPLATES.balanced.positions.map(pos => [pos.id, false]))
    }))
  )
  const [unassigned, setUnassigned] = useState(employees)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customPositions, setCustomPositions] = useState([])
  const [customTeamName, setCustomTeamName] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState({ employee: null, teamId: null })

  // Show custom alert for team history
  const showTeamHistoryAlert = useCallback((employee, teamId) => {
    const lastTeam = getLastTeam(employee.id)
    if (lastTeam === teamId) {
      setAlertData({ employee, teamId })
      setShowAlert(true)
    }
  }, [])

  const getRoleConfig = useCallback((role) => {
    return ROLE_CONFIGS[role] || ROLE_CONFIGS.sipil
  }, [])

  // TOPSIS Scoring
  const employeeScores = useMemo(() => {
    const skills = Object.keys(ROLE_CONFIGS)
    const scores = {}
    
    skills.forEach(skill => {
      const values = employees.map(emp => emp.skills[skill])
      const maxVal = Math.max(...values)
      const minVal = Math.min(...values)
      
      scores[skill] = employees.map(emp => {
        const normalizedSkill = maxVal !== minVal ? (emp.skills[skill] - minVal) / (maxVal - minVal) : 0.5
        const normalizedWorkload = 1 - emp.workload
        const normalizedExperience = emp.experience / Math.max(...employees.map(e => e.experience))
        
        const compositeScore = (normalizedSkill * 0.6) + (normalizedWorkload * 0.3) + (normalizedExperience * 0.1)
       
        console.log(compositeScore)
        return {
          employeeId: emp.id,
          employee: emp,
          score: Math.round(compositeScore * 100),
          rank: 0
        }
      }).sort((a, b) => b.score - a.score)
       .map((item, index) => ({ ...item, rank: index + 1 }))
    })
    
    return scores
  }, [employees])

  // Add new team
  const addTeam = useCallback(() => {
    const newId = Math.max(...teams.map(t => t.id), 0) + 1
    const newTeam = {
      id: newId,
      name: `Tim ${newId}`,
      template: selectedTemplate,
      positions: [...TEAM_TEMPLATES[selectedTemplate].positions],
      members: Object.fromEntries(TEAM_TEMPLATES[selectedTemplate].positions.map(pos => [pos.id, null])),
      locked: Object.fromEntries(TEAM_TEMPLATES[selectedTemplate].positions.map(pos => [pos.id, false]))
    }
    setTeams([...teams, newTeam])
  }, [teams, selectedTemplate])

  // Remove team
  const removeTeam = useCallback((teamId) => {
    const teamToRemove = teams.find(t => t.id === teamId)
    if (!teamToRemove) return
    
    // Return members to unassigned pool
    const membersToReturn = Object.values(teamToRemove.members).filter(m => m)
    
    setTeams(teams.filter(t => t.id !== teamId))
    setUnassigned(prev => {
      const newUnassigned = [...prev]
      membersToReturn.forEach(member => {
        if (!newUnassigned.some(e => e.id === member.id)) {
          newUnassigned.push(member)
        }
      })
      return newUnassigned
    })
  }, [teams])

  // Create custom template
  const createCustomTemplate = useCallback(() => {
    if (customPositions.length === 0 || !customTeamName) {
      alert('Silakan tambahkan posisi dan nama tim')
      return
    }
    
    const newTeam = {
      id: Math.max(...teams.map(t => t.id), 0) + 1,
      name: customTeamName,
      template: 'custom',
      positions: customPositions.map((pos, idx) => ({
        id: `custom_pos_${idx}`,
        role: pos.role,
        name: pos.name
      })),
      members: Object.fromEntries(customPositions.map((pos, idx) => [`custom_pos_${idx}`, null])),
      locked: Object.fromEntries(customPositions.map((pos, idx) => [`custom_pos_${idx}`, false]))
    }
    
    setTeams([...teams, newTeam])
    setShowCustomModal(false)
    setCustomPositions([])
    setCustomTeamName('')
  }, [customPositions, customTeamName, teams])

  // Add position to custom template
  const addCustomPosition = useCallback(() => {
    setCustomPositions([...customPositions, { role: 'sipil', name: 'New Position' }])
  }, [customPositions])
  console.log(employeeScores)
  // Apply template to team
  const applyTemplate = useCallback((teamId, templateKey) => {
    const template = TEAM_TEMPLATES[templateKey]
    if (!template || templateKey === 'custom') return

    // Collect all employees from the team being reset
    const teamToReset = teams.find(t => t.id === teamId)
    const employeesToReturn = []
    if (teamToReset) {
      Object.values(teamToReset.members).forEach(member => {
        if (member) employeesToReturn.push(member)
      })
    }

    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === teamId 
          ? {
              ...team,
              template: templateKey,
              positions: [...template.positions],
              members: Object.fromEntries(template.positions.map(pos => [pos.id, null])),
              locked: Object.fromEntries(template.positions.map(pos => [pos.id, false]))
            }
          : team
      )
    )

    // Return employees to unassigned pool
    if (employeesToReturn.length > 0) {
      setUnassigned(prev => {
        const newUnassigned = [...prev]
        employeesToReturn.forEach(emp => {
          if (!newUnassigned.some(e => e.id === emp.id)) {
            newUnassigned.push(emp)
          }
        })
        return newUnassigned
      })
    }
  }, [teams])

  // Calculate team balance
  const calculateTeamBalance = useCallback((team) => {
    if (!team.positions || team.positions.length === 0) return 0
    
    const filledPositions = team.positions.filter(pos => team.members[pos.id])
    if (filledPositions.length === 0) return 0
    
    const avgScore = filledPositions.reduce((sum, pos) => {
      const member = team.members[pos.id]
      return sum + (member ? member.skills[pos.role] : 0)
    }, 0) / filledPositions.length
    
    return Math.round(avgScore)
  }, [])

  // Auto assign teams
  const autoAssignTeams = useCallback(() => {
    const newTeams = teams.map(team => ({
      ...team,
      members: Object.fromEntries(team.positions.map(pos => [pos.id, team.locked[pos.id] ? team.members[pos.id] : null]))
    }))
    
    const availableEmployees = [...employees]
    
    // Remove locked members from available pool
    newTeams.forEach(team => {
      Object.values(team.members).forEach(member => {
        if (member) {
          const index = availableEmployees.findIndex(e => e.id === member.id)
          if (index !== -1) availableEmployees.splice(index, 1)
        }
      })
    })

    // Group positions by role
    const allPositionsByRole = {}
    newTeams.forEach(team => {
      team.positions.forEach(pos => {
        if (!team.locked[pos.id]) {
          if (!allPositionsByRole[pos.role]) {
            allPositionsByRole[pos.role] = []
          }
          allPositionsByRole[pos.role].push({ teamId: team.id, position: pos })
        }
      })
    })

    // Assign each role
    Object.keys(allPositionsByRole).forEach(role => {
      const skillRanking = employeeScores[role] || []
      const rolePositions = allPositionsByRole[role]
      


      rolePositions.forEach(({ teamId, position }) => {
        const team = newTeams.find(t => t.id === teamId)
        if (!team) return
        
        const bestEmployee = skillRanking.find(item => {
          const isAvailable = availableEmployees.some(emp => emp.id === item.employeeId)
          return isAvailable
        })
        
        if (bestEmployee) {
          team.members[position.id] = bestEmployee.employee
          const empIndex = availableEmployees.findIndex(emp => emp.id === bestEmployee.employeeId)
          if (empIndex !== -1) {
            availableEmployees.splice(empIndex, 1)
          }
        }
      })
    })
    
    setTeams(newTeams)
    setUnassigned(availableEmployees)
  }, [teams, employees, employeeScores])

  // Drag and drop handlers
  const handleDragStart = (e, employee, fromTeam, fromPosition) => {
    const dragData = { 
      employeeId: employee.id, 
      fromTeam, 
      fromPosition,
      employee: employee 
    }
    e.dataTransfer.setData('application/json', JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, toTeam, toPosition) => {
    e.preventDefault()
    
    try {
      const dragDataText = e.dataTransfer.getData('application/json')
      if (!dragDataText) return
      
      const dragData = JSON.parse(dragDataText)
      const employee = dragData.employee || employees.find(emp => emp.id === dragData.employeeId)
      
      if (!employee) return
      
      // Show alert if employee was in that team in last inspection
      if (toTeam) {
        showTeamHistoryAlert(employee, toTeam)
      }
      
      // Check if position is locked
      if (toTeam && toPosition) {
        const team = teams.find(t => t.id === toTeam)
        if (team?.locked[toPosition]) {
          alert('Posisi ini terkunci!')
          return
        }
      }
      
      // Handle swapping if there's already someone in the target position
      let existingMember = null
      if (toTeam && toPosition) {
        const targetTeam = teams.find(t => t.id === toTeam)
        existingMember = targetTeam?.members[toPosition]
      }
      
      // Update teams
      setTeams(prevTeams => {
        const newTeams = prevTeams.map(team => {
          const updatedTeam = { ...team, members: { ...team.members } }
          
          // Remove employee from source position
          if (team.id === dragData.fromTeam && dragData.fromPosition) {
            updatedTeam.members[dragData.fromPosition] = existingMember // If swapping, put existing member here
          }
          
          // Add employee to target position
          if (team.id === toTeam && toPosition) {
            updatedTeam.members[toPosition] = employee
          }
          
          return updatedTeam
        })
        
        return newTeams
      })
      
      // Update unassigned list
      setUnassigned(prevUnassigned => {
        let newUnassigned = [...prevUnassigned]
        
        // Remove the dropped employee from unassigned if it was there
        newUnassigned = newUnassigned.filter(emp => emp.id !== employee.id)
        
        // If dropping to unassigned pool
        if (!toTeam || !toPosition) {
          // Add the employee to unassigned
          if (!newUnassigned.some(emp => emp.id === employee.id)) {
            newUnassigned.push(employee)
          }
        }
        
        // Handle existing member in swap scenario
        if (existingMember && (!dragData.fromTeam || !dragData.fromPosition)) {
          // If there was someone in the target position and we're not swapping, move them to unassigned
          if (!newUnassigned.some(emp => emp.id === existingMember.id)) {
            newUnassigned.push(existingMember)
          }
        }
        
        return newUnassigned
      })
      
    } catch (error) {
      console.error('Drop error:', error)
    }
  }

  // Toggle lock
  const toggleLock = useCallback((teamId, positionId) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === teamId 
          ? { ...team, locked: { ...team.locked, [positionId]: !team.locked[positionId] } }
          : team
      )
    )
  }, [])

  // Shuffle teams
  const shuffleTeams = useCallback(() => {
    const newTeams = [...teams]
    
    for (let i = 0; i < 10; i++) {
      const team1Index = Math.floor(Math.random() * newTeams.length)
      const team2Index = Math.floor(Math.random() * newTeams.length)
      
      if (team1Index === team2Index) continue
      
      const team1 = newTeams[team1Index]
      const team2 = newTeams[team2Index]
      
      // Find positions with same role that aren't locked
      const team1Positions = team1.positions.filter(pos => !team1.locked[pos.id] && team1.members[pos.id])
      const team2Positions = team2.positions.filter(pos => !team2.locked[pos.id] && team2.members[pos.id])
      
      const commonRoles = team1Positions
        .map(p1 => ({ pos1: p1, pos2: team2Positions.find(p2 => p2.role === p1.role) }))
        .filter(pair => pair.pos2)
      
      if (commonRoles.length > 0) {
        const randomPair = commonRoles[Math.floor(Math.random() * commonRoles.length)]
        const member1 = team1.members[randomPair.pos1.id]
        const member2 = team2.members[randomPair.pos2.id]
        
        // Swap members
        newTeams[team1Index].members[randomPair.pos1.id] = member2
        newTeams[team2Index].members[randomPair.pos2.id] = member1
      }
    }
    
    setTeams(newTeams)
  }, [teams])

  // Reset teams
  const resetTeams = useCallback(() => {
    setTeams(teams.map(team => ({
      ...team,
      members: Object.fromEntries(team.positions.map(pos => [pos.id, null])),
      locked: Object.fromEntries(team.positions.map(pos => [pos.id, false]))
    })))
    setUnassigned(employees)
  }, [teams, employees])

  // Download results
  const downloadResults = useCallback(() => {
    const content = teams.map(team => {
      const members = team.positions.map(pos => {
        const member = team.members[pos.id]
        const lastTeam = member ? getLastTeam(member.id) : null
        const wasInTeam = lastTeam === team.id ? ' (⚠️ Pemeriksaan terakhir)' : ''
        return `  ${pos.name}: ${member ? member.name + wasInTeam : 'Tidak Terisi'}`
      }).join('\n')
      
      return `${team.name}\nTemplate: ${team.template === 'custom' ? 'Custom' : TEAM_TEMPLATES[team.template]?.name}\nBalance Score: ${calculateTeamBalance(team)}/100\nAnggota:\n${members}\n`
    }).join('\n' + '='.repeat(40) + '\n\n')
    
    const header = 'HASIL PEMBENTUKAN TIM\n' + '='.repeat(40) + '\n\n'
    const footer = '\n' + '='.repeat(40) + '\n⚠️ = Pernah di tim ini pada pemeriksaan terakhir'
    
    const blob = new Blob([header + content + footer], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `team-formation-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [teams, calculateTeamBalance])

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Navbar showSearchBar={false}/>
      <CustomAlert 
        show={showAlert}
        onClose={() => setShowAlert(false)}
        employee={alertData.employee}
        teamId={alertData.teamId}
      />
      
      {/* Custom Team Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Buat Tim Custom</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowCustomModal(false)
                  setCustomPositions([])
                  setCustomTeamName('')
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Nama Tim</Label>
                <Input 
                  value={customTeamName}
                  onChange={(e) => setCustomTeamName(e.target.value)}
                  placeholder="Masukkan nama tim"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Posisi dalam Tim</Label>
                  <Button size="sm" onClick={addCustomPosition}>
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Posisi
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {customPositions.map((pos, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={pos.name}
                        onChange={(e) => {
                          const updated = [...customPositions]
                          updated[idx].name = e.target.value
                          setCustomPositions(updated)
                        }}
                        placeholder="Nama posisi"
                      />
                      <Select
                        value={pos.role}
                        onValueChange={(value) => {
                          const updated = [...customPositions]
                          updated[idx].role = value
                          setCustomPositions(updated)
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCustomPositions(customPositions.filter((_, i) => i !== idx))
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  
                  {customPositions.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Belum ada posisi. Klik "Tambah Posisi" untuk memulai.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowCustomModal(false)
                  setCustomPositions([])
                  setCustomTeamName('')
                }}
              >
                Batal
              </Button>
              <Button onClick={createCustomTemplate}>
                Buat Tim
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto space-y-6 mt-3">
        {/* Header */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-blue-800">
              <Users className="w-8 h-8" />
              Pembentukan Tim Otomatis dengan Custom Composition
            </CardTitle>
            <CardDescription className="text-blue-600">
              Menggunakan Modified TOPSIS + Greedy Algorithm dengan template komposisi yang dapat disesuaikan
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Template Selection & Team Management */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Settings className="w-5 h-5" />
              Manajemen Tim & Template
            </CardTitle>
            <CardDescription>
              Atur jumlah tim dan pilih template komposisi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Team Count Management */}
            <div className="mb-6 p-4 bg-white rounded-lg border">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="font-medium">Jumlah Tim Saat Ini: {teams.length}</h4>
                  <p className="text-xs text-gray-500">Tambah atau kurangi jumlah tim sesuai kebutuhan</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={addTeam}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Tim
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-purple-500 text-purple-600 hover:bg-purple-50"
                    onClick={() => setShowCustomModal(true)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Tim Custom
                  </Button>
                </div>
              </div>
              
              {teams.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {teams.map(team => (
                    <div key={team.id} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                      <span className="text-sm">{team.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-0 h-5 w-5"
                        onClick={() => removeTeam(team.id)}
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Template Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              {Object.entries(TEAM_TEMPLATES).filter(([key]) => key !== 'custom').map(([key, template]) => (
                <div key={key} className="p-3 border rounded-lg hover:border-purple-300 transition-colors bg-white">
                  <div className="font-medium mb-2">{template.name}</div>
                  <div className="text-xs space-y-1 mb-3">
                    {template.positions.map(pos => {
                      const roleConfig = getRoleConfig(pos.role)
                      return (
                        <div key={pos.id} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${roleConfig.color}`}></div>
                          <span>{pos.name}</span>
                        </div>
                      )
                    })}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedTemplate(key)}
                    className={`w-full ${selectedTemplate === key ? 'border-purple-500 bg-purple-50' : ''}`}
                  >
                    {selectedTemplate === key ? 'Terpilih' : 'Pilih'}
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {teams.map(team => (
                <Button 
                  key={team.id} 
                  size="sm" 
                  variant="outline"
                  onClick={() => applyTemplate(team.id, selectedTemplate)}
                  className="hover:bg-purple-100"
                  disabled={team.template === 'custom'}
                >
                  Apply ke {team.name}
                </Button>
              ))}
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  teams.forEach(team => {
                    if (team.template !== 'custom') {
                      applyTemplate(team.id, selectedTemplate)
                    }
                  })
                }}
              >
                Apply ke Semua Tim (Non-Custom)
              </Button>
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

        {/* Team Cards - Dynamic Grid */}
        <div className={`grid gap-6 ${
          teams.length === 1 ? 'grid-cols-1' :
          teams.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
          teams.length === 3 ? 'grid-cols-1 lg:grid-cols-3' :
          teams.length === 4 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {teams.map(team => {
            const balance = calculateTeamBalance(team)
            const filledPositions = team.positions.filter(pos => team.members[pos.id]).length
            const completeness = (filledPositions / team.positions.length) * 100
            
            return (
              <Card key={team.id} className="border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {team.name}
                      {team.template === 'custom' && (
                        <Badge variant="outline" className="text-xs">Custom</Badge>
                      )}
                    </CardTitle>
                    <Badge variant={balance >= 75 ? "default" : balance >= 60 ? "secondary" : "destructive"}>
                      <BarChart3 className="w-3 h-3 mr-1" />
                      {balance}/100
                    </Badge>
                  </div>
                  
                  {team.template !== 'custom' && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-purple-600 font-medium">
                        Template: {TEAM_TEMPLATES[team.template]?.name}
                      </span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Kelengkapan Tim</span>
                      <span>{filledPositions}/{team.positions.length}</span>
                    </div>
                    <Progress value={completeness} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {team.positions.map(position => {
                    const member = team.members[position.id]
                    const isLocked = team.locked[position.id]
                    const roleConfig = getRoleConfig(position.role)
                    const lastTeam = member ? getLastTeam(member.id) : null
                    const wasInThisTeam = lastTeam === team.id
                    
                    return (
                      <div 
                        key={position.id}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          member 
                            ? wasInThisTeam 
                              ? 'border-solid border-orange-400 bg-orange-50' 
                              : 'border-solid border-gray-300 bg-white'
                            : 'border-dashed border-gray-300 bg-gray-50 hover:border-blue-400'
                        } ${isLocked ? 'opacity-75' : ''}`}
                        onDrop={(e) => handleDrop(e, team.id, position.id)}
                        onDragOver={handleDragOver}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${roleConfig.color}`}></div>
                            <span className="font-medium text-sm">{position.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleLock(team.id, position.id)}
                            className="p-1 h-6 w-6"
                          >
                            {isLocked ? (
                              <Lock className="w-3 h-3 text-red-500" />
                            ) : (
                              <Unlock className="w-3 h-3 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        
                        {member ? (
                          <div 
                            draggable={!isLocked}
                            onDragStart={(e) => handleDragStart(e, member, team.id, position.id)}
                            className={`${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-move'}`}
                          >
                            <div className="font-medium text-sm">{member.name}</div>
                            <div className="text-xs text-gray-500 mb-1">{member.unit}</div>
                            <div className="flex justify-between items-center text-xs">
                              <span>Skill: {member.skills[position.role]}/100</span>
                              <span>Load: {Math.round(member.workload * 100)}%</span>
                            </div>
                            {wasInThisTeam && (
                              <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Pemeriksaan terakhir</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 py-2">
                            <span className="text-xs">Drop {position.role} expert here</span>
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

        {/* Unassigned Pool */}
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Users className="w-5 h-5" />
              Pool Pegawai Tersedia ({unassigned.length})
            </CardTitle>
            <CardDescription>
              Drag pegawai ke posisi yang sesuai di tim manapun. Alert hanya muncul jika ditempatkan di tim pemeriksaan terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[100px] p-4 border-2 border-dashed border-orange-300 rounded-lg bg-white/50"
              onDrop={(e) => handleDrop(e, null, null)}
              onDragOver={handleDragOver}
            >
              {unassigned.map(employee => {
                const lastTeam = getLastTeam(employee.id)
                const allHistory = TEAM_HISTORY[employee.id] || []
                
                return (
                  <div
                    key={employee.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, employee, null, null)}
                    className="cursor-move bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  >
                    <div className="font-medium text-sm mb-1">{employee.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{employee.unit}</div>
                    
                    <div className="grid grid-cols-5 gap-1 text-xs mb-2">
                      {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                        <div key={key} className="text-center">
                          <div className={`font-medium ${
                            employee.skills[key] >= 80 ? 'text-green-600' :
                            employee.skills[key] >= 60 ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {employee.skills[key]}
                          </div>
                          <div className="text-gray-400 text-[10px]">{config.name.split(' ')[0]}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-500">Exp: {employee.experience}th</span>
                      <Badge variant={employee.workload < 0.5 ? "default" : employee.workload < 0.8 ? "secondary" : "destructive"} className="text-[10px] px-1 py-0">
                        Load: {Math.round(employee.workload * 100)}%
                      </Badge>
                    </div>
                    
                    {lastTeam && (
                      <div className="border-t pt-1 mt-1">
                        <div className="flex items-center gap-1 text-xs">
                          <AlertCircle className="w-3 h-3 text-orange-500" />
                          <span className="text-orange-600 font-medium">Tim terakhir: {lastTeam}</span>
                        </div>
                        {allHistory.length > 1 && (
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            Riwayat lengkap: Tim {allHistory.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              
              {unassigned.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Semua pegawai sudah ditempatkan di tim</p>
                  <p className="text-sm mt-1">Drag pegawai dari tim untuk mengembalikannya ke pool</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Balance Analysis */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              Analisis Balance Tim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-6 ${
              teams.length === 1 ? 'grid-cols-1' :
              teams.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              teams.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
              teams.length === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {teams.map(team => {
                const balance = calculateTeamBalance(team)
                const filledPositions = team.positions.filter(pos => team.members[pos.id]).length
                const status = balance >= 75 ? 'excellent' : balance >= 60 ? 'good' : 'needs-improvement'
                const teamMembers = team.positions.filter(pos => team.members[pos.id]).map(pos => team.members[pos.id])
                const hasHistoryConflict = teamMembers.some(member => {
                  const lastTeam = getLastTeam(member.id)
                  return lastTeam === team.id
                })
                
                return (
                  <div key={team.id} className="bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{team.name}</h4>
                      <div className="flex gap-1">
                        {hasHistoryConflict && (
                          <AlertCircle className="w-4 h-4 text-orange-500" title="Ada anggota dari pemeriksaan terakhir" />
                        )}
                        {status === 'excellent' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {status === 'good' && <Award className="w-5 h-5 text-yellow-500" />}
                        {status === 'needs-improvement' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Score</span>
                        <span className="font-medium">{balance}/100</span>
                      </div>
                      <Progress value={balance} />
                      <div className="text-xs text-gray-500">
                        {filledPositions}/{team.positions.length} posisi terisi
                      </div>
                      {team.template === 'custom' ? (
                        <div className="text-xs text-indigo-600">
                          Komposisi: Custom
                        </div>
                      ) : (
                        <div className="text-xs text-indigo-600">
                          Template: {TEAM_TEMPLATES[team.template]?.name}
                        </div>
                      )}
                      {hasHistoryConflict && (
                        <div className="text-xs text-orange-600 italic">
                          ⚠️ Ada anggota dari pemeriksaan terakhir
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-blue-800">Informasi Sistem</h4>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>• Buat tim custom dengan komposisi sesuai kebutuhan</li>
                <li>• Tambah/kurangi jumlah tim secara dinamis</li>
                <li>• Alert otomatis jika pegawai ditempatkan di tim pemeriksaan terakhir</li>
                <li>• Drag & drop untuk memindahkan pegawai antar posisi dan tim</li>
                <li>• Kunci posisi dengan ikon gembok untuk mencegah perubahan</li>
                <li>• Auto Assign mengisi posisi berdasarkan ranking skill TOPSIS</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}