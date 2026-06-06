import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes("active") || s.includes("published") || s.includes("approved") || s.includes("paid")) {
      return "default" // Using default as "success" placeholder or theme primary
    }
    if (s.includes("draft") || s.includes("pending")) {
      return "secondary"
    }
    if (s.includes("inactive") || s.includes("rejected") || s.includes("closed")) {
      return "destructive"
    }
    return "outline"
  }

  return (
    <Badge variant={getVariant(status)} className={cn("capitalize", className)}>
      {status.replace("_", " ")}
    </Badge>
  )
}
