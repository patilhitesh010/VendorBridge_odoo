"use client"

import { useRFQ } from "@/hooks/useRFQs"
import { useSubmitQuotation } from "@/hooks/useQuotations"
import { QuotationForm } from "@/components/quotations/QuotationForm"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

export default function SubmitQuotationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: rfq, isLoading } = useRFQ(params.id)
  const submitQuotation = useSubmitQuotation()

  const handleSubmit = async (data: any) => {
    await submitQuotation.mutateAsync(data)
    router.push("/dashboard/quotations")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (!rfq) return <div>RFQ not found</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submit Quotation</h1>
        <p className="text-muted-foreground mt-2">
          RFQ #{rfq.rfqNumber}: {rfq.title}
        </p>
      </div>

      <div className="bg-background border rounded-xl p-6 shadow-sm">
        <QuotationForm rfq={rfq} onSubmit={handleSubmit} isLoading={submitQuotation.isPending} />
      </div>
    </div>
  )
}
