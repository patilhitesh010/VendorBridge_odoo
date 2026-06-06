import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useRFQs(filters: any = {}) {
  const queryParams = new URLSearchParams(filters).toString()
  return useQuery({
    queryKey: ["rfqs", filters],
    queryFn: async () => {
      const res = await fetch(`/api/rfqs?${queryParams}`)
      if (!res.ok) throw new Error("Failed to fetch RFQs")
      return res.json()
    },
  })
}

export function useRFQ(id: string) {
  return useQuery({
    queryKey: ["rfqs", id],
    queryFn: async () => {
      const res = await fetch(`/api/rfqs/${id}`)
      if (!res.ok) throw new Error("Failed to fetch RFQ")
      return res.json()
    },
    enabled: !!id,
  })
}
