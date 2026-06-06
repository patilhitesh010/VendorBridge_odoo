import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import { z } from "zod"

const updateSchema = z.object({
  lineItemPrices: z.array(z.object({
    itemName: z.string(),
    unitPrice: z.number(),
    total: z.number(),
  })).optional(),
  grandTotal: z.number().optional(),
  deliveryDate: z.string().datetime().optional(),
  terms: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "SELECTED", "REJECTED"]).optional(),
})

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: { 
        rfq: true,
        vendor: true
      }
    })

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    return NextResponse.json(quotation)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quotation" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const validatedData = updateSchema.parse(body)

    const quotation = await prisma.quotation.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(quotation)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 })
  }
}
