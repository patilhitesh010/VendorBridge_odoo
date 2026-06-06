import { prisma } from "@/lib/prisma"

export async function recalculateVTS(vendorId: string) {
  const completedPOs = await prisma.purchaseOrder.findMany({
    where: { 
      vendorId, 
      status: 'CLOSED' 
    },
    include: {
      invoices: true
    }
  })

  if (completedPOs.length < 3) return 50 // Neutral until enough data

  // Simplified VTS calculation for hackathon
  // PCI: Price Competitiveness Index (Lower is better, but here we represent score)
  // ODR: On-Time Delivery Rate
  // QRS: Quality Rating Score (Placeholder)
  // RR: Rejection Rate
  
  const pci = 0.8 // Placeholder
  const odr = 0.9 // Placeholder
  const qrs = 0.85 // Placeholder
  const rr = 0.05 // Placeholder

  const vts = (pci * 0.30) + (odr * 0.35) + (qrs * 0.20) + ((1 - rr) * 0.15)
  
  const score = Math.round(vts * 100)

  await prisma.vendor.update({
    where: { id: vendorId },
    data: { vtsScore: score }
  })

  return {
    pci: pci * 100,
    odr: odr * 100,
    qrs: qrs * 100,
    rr: rr * 100,
    total: score
  }
}

export function getVTSColor(score: number) {
  if (score >= 75) return "text-green-500"
  if (score >= 50) return "text-amber-500"
  return "text-red-500"
}
