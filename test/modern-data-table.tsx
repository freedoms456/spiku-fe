"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronUp, ChevronDown } from "lucide-react"

interface Employee {
  id: number
  name: string
  position: string
  office: string
  age: number
  startDate: string
  salary: number
  avatar: string
}

const employeeData: Employee[] = [
  {
    id: 1,
    name: "Abram Schleifer",
    position: "Sales Assistant",
    office: "Edinburgh",
    age: 57,
    startDate: "25 Apr, 2027",
    salary: 89500,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Charlotte Anderson",
    position: "Marketing Manager",
    office: "London",
    age: 42,
    startDate: "12 Mar, 2025",
    salary: 105000,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Ethan Brown",
    position: "Software Engineer",
    office: "San Francisco",
    age: 30,
    startDate: "01 Jan, 2024",
    salary: 120000,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Isabella Davis",
    position: "UI/UX Designer",
    office: "Austin",
    age: 29,
    startDate: "18 Jul, 2025",
    salary: 92000,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "James Wilson",
    position: "Data Analyst",
    office: "Chicago",
    age: 28,
    startDate: "20 Sep, 2025",
    salary: 80000,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Liam Moore",
    position: "DevOps Engineer",
    office: "Boston",
    age: 33,
    startDate: "30 Oct, 2024",
    salary: 115000,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

type SortField = keyof Employee
type SortDirection = "asc" | "desc"

export default function ModernDataTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("10")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const filteredAndSortedData = useMemo(() => {
    const filtered = employeeData.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.office.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered.slice(0, Number.parseInt(entriesPerPage))
  }, [searchTerm, entriesPerPage, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const formatSalary = (salary: number) => {
    return `$${salary.toLocaleString()}`
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col ml-1 opacity-30">
          <ChevronUp className="h-3 w-3 -mb-1" />
          <ChevronDown className="h-3 w-3" />
        </div>
      )
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-1 opacity-60" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1 opacity-60" />
    )
  }

  return (
    <Card className="w-full bg-white shadow-sm border border-gray-200">
      <CardContent className="p-0">
        {/* Header Controls */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
              <SelectTrigger className="w-16 h-8 text-sm border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>entries</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th
                  className="text-left py-4 px-6 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    User
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSort("position")}
                >
                  <div className="flex items-center">
                    Position
                    <SortIcon field="position" />
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSort("office")}
                >
                  <div className="flex items-center">
                    Office
                    <SortIcon field="office" />
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSort("age")}
                >
                  <div className="flex items-center">
                    Age
                    <SortIcon field="age" />
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSort("startDate")}
                >
                  <div className="flex items-center">
                    Start Date
                    <SortIcon field="startDate" />
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSort("salary")}
                >
                  <div className="flex items-center">
                    Salary
                    <SortIcon field="salary" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((employee, index) => (
                <tr
                  key={employee.id}
                  className={`border-b border-gray-50 hover:bg-gray-25 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={employee.avatar || "/placeholder.svg"}
                        alt={employee.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <span className="font-medium text-gray-900">{employee.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                      {employee.position}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700">{employee.office}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700">{employee.age}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700">{employee.startDate}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">{formatSalary(employee.salary)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
