"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { employeeData } from "@/lib/employee-data"

interface EmployeeDataTableProps {
  searchTerm: string
  selectedGrade: string
  selectedEducation: string
}

export default function EmployeeDataTable({ searchTerm, selectedGrade, selectedEducation }: EmployeeDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredData = useMemo(() => {
    return employeeData.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGrade = selectedGrade === "all" || employee.grade === selectedGrade
      const matchesEducation = selectedEducation === "all" || employee.educationLevel === selectedEducation

      return matchesSearch && matchesGrade && matchesEducation
    })
  }, [searchTerm, selectedGrade, selectedEducation])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const getJobTypeBadgeVariant = (jobType: string) => {
    return jobType === "Permanent" ? "default" : "secondary"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Data Table</CardTitle>
        <CardDescription>
          Filterable table showing employee positions, grades, and education levels ({filteredData.length} of{" "}
          {employeeData.length} employees)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Education Level</TableHead>
                <TableHead>Major</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Grade {employee.grade}</Badge>
                  </TableCell>
                  <TableCell>{employee.educationLevel}</TableCell>
                  <TableCell>{employee.major}</TableCell>
                  <TableCell>
                    <Badge variant={getJobTypeBadgeVariant(employee.jobType)}>{employee.jobType}</Badge>
                  </TableCell>
                  <TableCell>{employee.age}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
