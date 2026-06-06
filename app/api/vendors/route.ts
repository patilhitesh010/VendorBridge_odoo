import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import { z } from "zod"

const vendorSchema = z.object({
  name: z.string().min(2),
  categories: z.array(z.string()).min(1),
  gstNumber: z.string().length(15),
  stateCode: z.string().length(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    const vendors = await prisma.vendor.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { gstNumber: { contains: search, mode: "insensitive" } },
            ],
          },
          category ? { categories: { has: category } } : {},
          status ? { status: status as any } : {},
        ],
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(vendors)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any).role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = vendorSchema.parse(body)

    const vendor = await prisma.vendor.create({
      data: validatedData,
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 })
  }
}
