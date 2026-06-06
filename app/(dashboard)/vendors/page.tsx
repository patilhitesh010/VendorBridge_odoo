"use client"

import { useState } from "react"
import { useVendors, useCreateVendor } from "@/hooks/useVendors"
import { VendorCard } from "@/components/vendors/VendorCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { VendorForm } from "@/components/vendors/VendorForm"
import { Plus, Search, Filter } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function VendorsPage() {
  const [search, setSearch] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const { data: vendors, isLoading } = useVendors({ search })
  const createVendor = useCreateVendor()

  const handleAddVendor = async (data: any) => {
    await createVendor.mutateAsync(data)
    setIsAddOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">Manage your suppliers and track their performance.</p>
        </div>
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Vendor
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>Add New Vendor</SheetTitle>
              <SheetDescription>
                Enter the vendor details to add them to the system.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <VendorForm 
                onSubmit={handleAddVendor} 
                isLoading={createVendor.isPending} 
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[180px] w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors?.map((vendor: any) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
          {vendors?.length === 0 && (
            <div className="col-span-full py-12 text-center border rounded-xl bg-muted/10">
              <p className="text-muted-foreground">No vendors found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
