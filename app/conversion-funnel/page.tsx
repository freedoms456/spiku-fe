"use client"

import ConversionFunnelChart from "@/components/charts/conversion-funnel-chart"

export default function ConversionFunnelPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <ConversionFunnelChart />
      </div>
    </div>
  )
}
