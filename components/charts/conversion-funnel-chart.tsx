"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Import ApexCharts dynamically to avoid SSR issues
let ApexCharts: any = null
if (typeof window !== "undefined") {
  ApexCharts = require("apexcharts")
}

export default function ConversionFunnelChart() {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ApexCharts || !chartRef.current) return

    const options = {
      series: [
        {
          name: "Ad Impressions",
          data: [65, 80, 75, 85, 55, 75, 85, 80],
        },
        {
          name: "Website Session",
          data: [15, 18, 15, 12, 20, 15, 15, 18],
        },
        {
          name: "App Download",
          data: [8, 5, 8, 5, 3, 8, 8, 5],
        },
        {
          name: "New Users",
          data: [2, 2, 2, 3, 2, 2, 2, 2],
        },
      ],
      chart: {
        type: "bar",
        height: 400,
        stacked: true,
        toolbar: {
          show: false,
        },
        background: "transparent",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "60%",
          borderRadius: 8,
          borderRadiusApplication: "end",
          borderRadiusWhenStacked: "last",
        },
      },
      colors: ["#1e40af", "#3b82f6", "#60a5fa", "#bfdbfe"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: "#6b7280",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
          },
        },
      },
      yaxis: {
        min: 0,
        max: 120,
        tickAmount: 6,
        labels: {
          style: {
            colors: "#6b7280",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
          },
        },
      },
      grid: {
        show: false,
      },
      legend: {
        show: false, // We'll create custom legend
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => val.toString(),
        },
      },
    }

    const chart = new ApexCharts(chartRef.current, options)
    chart.render()

    return () => {
      chart.destroy()
    }
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">Conversion Funnel</CardTitle>

        {/* Custom Legend */}
        <div className="flex flex-wrap gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-800"></div>
            <span className="text-sm text-gray-600">Ad Impressions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-sm text-gray-600">Website Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-sm text-gray-600">App Download</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-200"></div>
            <span className="text-sm text-gray-600">New Users</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div ref={chartRef} className="w-full" />
      </CardContent>
    </Card>
  )
}
