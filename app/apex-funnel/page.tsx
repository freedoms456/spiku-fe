"use client"

import ApexConversionFunnel from "@/components/charts/apex-conversion-funnel"

export default function ApexFunnelPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ApexCharts Conversion Funnel</h1>
          <p className="text-gray-600">Exact replica of the provided design using ApexCharts</p>
        </div>
        <ApexConversionFunnel />
      </div>
    </div>
  )
}
