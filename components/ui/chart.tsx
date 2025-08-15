import * as React from "react"

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div className="space-y-2" {...props} ref={ref}></div>
))
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className="rounded-md border" {...props} ref={ref} />,
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className="bg-white border rounded-md shadow-md p-2" {...props} ref={ref} />,
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className="text-sm text-muted-foreground" {...props} ref={ref} />,
)
ChartLegend.displayName = "ChartLegend"

export { Chart, ChartContainer, ChartTooltipContent, ChartLegend }
