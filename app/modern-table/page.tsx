"use client"

import ModernDataTable from "@/components/modern-data-table"

export default function ModernTablePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Modern Data Table</h1>
          <p className="text-gray-600">Exact replica of the provided table design</p>
        </div>
        <ModernDataTable />
      </div>
    </div>
  )
}
