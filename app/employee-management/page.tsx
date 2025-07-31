"use client"

import Navbar from "@/components/employee-management/navbar"
import MultiTableView from "@/components/employee-management/multi-table-view"

export default function EmployeeManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MultiTableView />
      </div>
    </div>
  )
}
