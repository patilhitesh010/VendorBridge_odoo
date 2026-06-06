import { NextResponse } from "next/server"
import { recalculateVTS } from "@/lib/vts"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vtsBreakdown = await recalculateVTS(params.id)
    return NextResponse.json(vtsBreakdown)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch VTS breakdown" }, { status: 500 })
  }
}
