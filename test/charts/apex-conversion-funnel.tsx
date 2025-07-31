"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ApexConversionFunnel() {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const loadChart = async () => {
      const ApexCharts = (await import("apexcharts")).default

      if (!chartRef.current) return

      const options = {
        series: [
          {
            name: "Job Applications",
            data: [120, 135, 128, 142, 98, 125, 138, 130],
          },
          {
            name: "Interview Invites",
            data: [25, 28, 22, 30, 18, 25, 28, 26],
          },
          {
            name: "Final Interviews",
            data: [12, 15, 10, 18, 8, 12, 15, 13],
          },
          {
            name: "Job Offers",
            data: [5, 7, 4, 8, 3, 5, 7, 6],
          },
        ],
        chart: {
          type: "bar" as const,
          height: 400,
          stacked: true,
          toolbar: {
            show: false,
          },
          background: "transparent",
          fontFamily: "Inter, sans-serif",
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "65%",
            borderRadius: 8,
            borderRadiusApplication: "end" as const,
            borderRadiusWhenStacked: "last" as const,
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
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
            },
          },
        },
        yaxis: {
          min: 0,
          max: 200,
          tickAmount: 5,
          labels: {
            style: {
              colors: "#6b7280",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
            },
          },
        },
        grid: {
          show: false,
        },
        legend: {
          show: false,
        },
        tooltip: {
          shared: true,
          intersect: false,
          style: {
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
          },
          y: {
            formatter: (val: number) => val.toString(),
          },
        },
        responsive: [
          {
            breakpoint: 768,
            options: {
              plotOptions: {
                bar: {
                  columnWidth: "80%",
                },
              },
            },
          },
        ],
      }

      const chart = new ApexCharts(chartRef.current, options)
      await chart.render()

      return () => {
        chart.destroy()
      }
    }

    loadChart()
  }, [])

  return (
    <Card className="w-full bg-card shadow-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-semibold text-foreground mb-4">HR Recruitment Funnel</CardTitle>

        {/* Custom Legend with HR-relevant labels */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#1e40af" }}></div>
            <span className="text-sm text-muted-foreground font-medium">Job Applications</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3b82f6" }}></div>
            <span className="text-sm text-muted-foreground font-medium">Interview Invites</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#60a5fa" }}></div>
            <span className="text-sm text-muted-foreground font-medium">Final Interviews</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#bfdbfe" }}></div>
            <span className="text-sm text-muted-foreground font-medium">Job Offers</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-6">
        <div ref={chartRef} className="w-full" />
      </CardContent>
    </Card>
  )
}
