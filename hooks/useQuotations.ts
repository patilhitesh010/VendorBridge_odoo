import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useQuotations(filters: any = {}) {
  const queryParams = new URLSearchParams(filters).toString()
  return useQuery({
    queryKey: ["quotations", filters],
    queryFn: async () => {
      const res = await fetch(`/api/quotations?${queryParams}`)
      if (!res.ok) throw new Error("Failed to fetch quotations")
      return res.json()
    },
  })
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ["quotations", id],
    queryFn: async () => {
      const res = await fetch(`/api/quotations/${id}`)
      if (!res.ok) throw new Error("Failed to fetch quotation")
      return res.json()
    },
    enabled: !!id,
  })
}

export function useSubmitQuotation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to submit quotation")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] })
      toast.success("Quotation submitted successfully")
    },
  })
}

export function useUpdateQuotation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update quotation")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations", id] })
      toast.success("Quotation updated successfully")
    },
  })
}
