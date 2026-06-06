"use client"

import { useVendor, useUpdateVendor, useVendorVTS } from "@/hooks/useVendors"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VendorForm } from "@/components/vendors/VendorForm"
import { VTSBreakdown } from "@/components/vendors/VTSBreakdown"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === Role.ADMIN
  
  const { data: vendor, isLoading } = useVendor(params.id)
  const { data: vtsData, isLoading: isVtsLoading } = useVendorVTS(params.id)
  const updateVendor = useUpdateVendor(params.id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!vendor) {
    return <div>Vendor not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{vendor.name}</h1>
            <StatusBadge status={vendor.status} />
          </div>
          <p className="text-muted-foreground">{vendor.gstNumber} • {vendor.categories.join(", ")}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="vts">VTS Breakdown</TabsTrigger>
          <TabsTrigger value="procurement">History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
              <CardDescription>
                {isAdmin ? "Manage vendor details and contact information." : "View vendor details and contact information."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAdmin ? (
                <VendorForm 
                  initialData={vendor} 
                  onSubmit={async (data) => { await updateVendor.mutateAsync(data) }} 
                  isLoading={updateVendor.isPending}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact Person</h4>
                    <p className="mt-1">{vendor.contactPerson || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email</h4>
                    <p className="mt-1">{vendor.email || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Phone</h4>
                    <p className="mt-1">{vendor.phone || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">GST Number</h4>
                    <p className="mt-1">{vendor.gstNumber}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed breakdown of Vendor Trust Score components.</CardDescription>
            </CardHeader>
            <CardContent>
              {isVtsLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <VTSBreakdown data={vtsData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procurement" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Procurement History</CardTitle>
              <CardDescription>List of past purchase orders and performance.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                No procurement history found for this vendor.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Documents</CardTitle>
              <CardDescription>Verification documents, GST certificates, and bank details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                No documents uploaded.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
