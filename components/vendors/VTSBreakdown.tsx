"use client"

import { Progress } from "@/components/ui/progress"

interface VTSBreakdownProps {
  data: {
    pci: number
    odr: number
    qrs: number
    rr: number
    total: number
  }
}

export function VTSBreakdown({ data }: VTSBreakdownProps) {
  const metrics = [
    { label: "Price Competitiveness Index (PCI)", value: data.pci, color: "bg-blue-500" },
    { label: "On-Time Delivery Rate (ODR)", value: data.odr, color: "bg-green-500" },
    { label: "Quality Rating Score (QRS)", value: data.qrs, color: "bg-purple-500" },
    { label: "Rejection Rate (RR)", value: 100 - data.rr, labelValue: data.rr, color: "bg-orange-500" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">Vendor Trust Score (VTS)</h3>
        <span className="text-3xl font-bold">{Math.round(data.total)}</span>
      </div>
      
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>{metric.label}</span>
              <span>{metric.labelValue ?? metric.value}%</span>
            </div>
            <Progress value={metric.value} className="h-2" />
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground italic">
        * VTS is calculated based on historical procurement data, delivery performance, and quality audits.
      </p>
    </div>
  )
}
