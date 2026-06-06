"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VTSRing } from "./VTSRing"
import { StatusBadge } from "../shared/StatusBadge"
import Link from "next/link"

interface VendorCardProps {
  vendor: {
    id: string
    name: string
    categories: string[]
    status: string
    vtsScore: number
    gstNumber: string
  }
}

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Link href={`/dashboard/vendors/${vendor.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-muted-foreground/10">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {vendor.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold leading-none">{vendor.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{vendor.gstNumber}</p>
            </div>
          </div>
          <VTSRing score={vendor.vtsScore} size={40} strokeWidth={4} />
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex flex-wrap gap-1 mb-3">
            {vendor.categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="text-[10px] px-1.5 py-0">
                {cat}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between mt-auto">
            <StatusBadge status={vendor.status} />
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">VTS Score</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
