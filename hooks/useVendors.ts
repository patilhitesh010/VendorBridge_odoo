import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useVendors(filters: any = {}) {
  const queryParams = new URLSearchParams(filters).toString()
  return useQuery({
    queryKey: ["vendors", filters],
    queryFn: async () => {
      const res = await fetch(`/api/vendors?${queryParams}`)
      if (!res.ok) throw new Error("Failed to fetch vendors")
      return res.json()
    },
  })
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ["vendors", id],
    queryFn: async () => {
      const res = await fetch(`/api/vendors/${id}`)
      if (!res.ok) throw new Error("Failed to fetch vendor")
      return res.json()
    },
    enabled: !!id,
  })
}

export function useVendorVTS(id: string) {
  return useQuery({
    queryKey: ["vendors", id, "vts"],
    queryFn: async () => {
      const res = await fetch(`/api/vendors/${id}/vts`)
      if (!res.ok) throw new Error("Failed to fetch VTS")
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create vendor")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] })
      toast.success("Vendor created successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateVendor(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update vendor")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] })
      queryClient.invalidateQueries({ queryKey: ["vendors", id] })
      toast.success("Vendor updated successfully")
    },
  })
}
