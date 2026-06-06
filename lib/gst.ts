interface GSTResult {
  cgst: number
  sgst: number
  igst: number
  grandTotal: number
}

export function calculateGST(
  subtotal: number,
  vendorStateCode: string,
  orgStateCode: string,
  gstRate: number = 18
): GSTResult {
  const isSameState = vendorStateCode === orgStateCode
  
  if (isSameState) {
    const cgst = (subtotal * (gstRate / 2)) / 100
    const sgst = (subtotal * (gstRate / 2)) / 100
    return {
      cgst,
      sgst,
      igst: 0,
      grandTotal: subtotal + cgst + sgst,
    }
  } else {
    const igst = (subtotal * gstRate) / 100
    return {
      cgst: 0,
      sgst: 0,
      igst,
      grandTotal: subtotal + igst,
    }
  }
}
