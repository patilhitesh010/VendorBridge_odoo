"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const vendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  categories: z.string().min(1, "At least one category is required"),
  gstNumber: z.string().length(15, "GST must be exactly 15 characters"),
  stateCode: z.string().length(2, "State code must be 2 characters"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  contactPerson: z.string().optional().or(z.literal("")),
  panNumber: z.string().optional().or(z.literal("")),
  bankAccountNo: z.string().optional().or(z.literal("")),
  ifscCode: z.string().optional().or(z.literal("")),
})

type VendorFormValues = z.infer<typeof vendorSchema>

interface VendorFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function VendorForm({ initialData, onSubmit, isLoading }: VendorFormProps) {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialData ? {
      ...initialData,
      categories: initialData.categories.join(", ")
    } : {
      name: "",
      categories: "",
      gstNumber: "",
      stateCode: "",
      email: "",
      phone: "",
      contactPerson: "",
      panNumber: "",
      bankAccountNo: "",
      ifscCode: "",
    },
  })

  const handleSubmit = async (values: VendorFormValues) => {
    const data = {
      ...values,
      categories: values.categories.split(",").map(c => c.trim()).filter(Boolean)
    }
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name</FormLabel>
                <FormControl>
                  <Input placeholder="TechSupply Co." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gstNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST Number</FormLabel>
                <FormControl>
                  <Input placeholder="27AAAAA0000A1Z5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stateCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State Code</FormLabel>
                <FormControl>
                  <Input placeholder="27" {...field} maxLength={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="Electronics, Hardware" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="vendor@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Vendor" : "Add Vendor"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
