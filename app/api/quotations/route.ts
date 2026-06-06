import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Role, QuotationStatus } from "@prisma/client"
import { z } from "zod"

const quotationSchema = z.object({
  rfqId: z.string(),
  lineItemPrices: z.array(z.object({
    itemName: z.string(),
    unitPrice: z.number(),
    total: z.number(),
  })),
  grandTotal: z.number(),
  deliveryDate: z.string().datetime(),
  terms: z.string().optional().nullable(),
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const rfqId = searchParams.get("rfqId")
    const user = session.user as any

    if (user.role === Role.VENDOR) {
      const quotations = await prisma.quotation.findMany({
        where: { vendorId: user.id },
        include: { rfq: true },
        orderBy: { submittedAt: "desc" },
      })
      return NextResponse.json(quotations)
    }

    if (user.role === Role.OFFICER || user.role === Role.ADMIN) {
      if (!rfqId) return NextResponse.json({ error: "rfqId required" }, { status: 400 })
      const quotations = await prisma.quotation.findMany({
        where: { rfqId },
        include: { vendor: true },
      })
      return NextResponse.json(quotations)
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const user = session?.user as any
    if (!session || user.role !== Role.VENDOR) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = quotationSchema.parse(body)

    const quotation = await prisma.quotation.create({
      data: {
        ...validatedData,
        vendorId: user.id,
        status: QuotationStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    })

    return NextResponse.json(quotation, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to submit quotation" }, { status: 500 })
  }
}
