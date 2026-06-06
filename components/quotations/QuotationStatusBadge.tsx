import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface QuotationStatusBadgeProps {
  status: string
  className?: string
}

export function QuotationStatusBadge({ status, className }: QuotationStatusBadgeProps) {
  const getVariant = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
      case "draft": return "secondary"
      case "submitted": return "outline"
      case "under_review": return "default"
      case "selected": return "default" // Would be success in a custom theme
      case "rejected": return "destructive"
      default: return "outline"
    }
  }

  return (
    <Badge variant={getVariant(status)} className={cn("capitalize", className)}>
      {status.replace("_", " ")}
    </Badge>
  )
}
