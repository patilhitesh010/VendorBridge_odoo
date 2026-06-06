"use client"

import { useQuotations } from "@/hooks/useQuotations"
import { QuotationStatusBadge } from "@/components/quotations/QuotationStatusBadge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function QuotationsPage() {
  const { data: quotations, isLoading } = useQuotations()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Quotations</h1>
        <p className="text-muted-foreground">Track the status of your submitted quotations.</p>
      </div>

      <div className="border rounded-xl bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RFQ Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Grand Total</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations?.map((q: any) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">{q.rfq.rfqNumber}</TableCell>
                <TableCell>{q.rfq.title}</TableCell>
                <TableCell>{formatCurrency(q.grandTotal)}</TableCell>
                <TableCell>{format(new Date(q.deliveryDate), "dd MMM yyyy")}</TableCell>
                <TableCell>{q.submittedAt ? format(new Date(q.submittedAt), "dd MMM yyyy") : "N/A"}</TableCell>
                <TableCell>
                  <QuotationStatusBadge status={q.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/quotations/${q.id}`} className="text-primary hover:underline font-medium text-sm">
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {quotations?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  You haven't submitted any quotations yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
