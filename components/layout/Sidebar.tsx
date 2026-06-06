"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  CheckCircle, 
  FileCheck, 
  Receipt, 
  History, 
  BarChart3,
  Package
} from "lucide-react"

const ALL_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "OFFICER", "MANAGER", "VENDOR"] },
  { name: "Vendors", href: "/dashboard/vendors", icon: Users, roles: ["ADMIN"] },
  { name: "RFQs", href: "/dashboard/rfqs", icon: FileText, roles: ["OFFICER"] },
  { name: "My Quotations", href: "/dashboard/quotations", icon: ClipboardList, roles: ["VENDOR"] },
  { name: "Approvals", href: "/dashboard/approvals", icon: CheckCircle, roles: ["MANAGER"] },
  { name: "Purchase Orders", href: "/dashboard/purchase-orders", icon: Package, roles: ["OFFICER", "VENDOR"] },
  { name: "Invoices", href: "/dashboard/invoices", icon: Receipt, roles: ["OFFICER"] },
  { name: "Activity Logs", href: "/dashboard/activity-logs", icon: History, roles: ["OFFICER"] },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role

  const filteredLinks = ALL_LINKS.filter(link => link.roles.includes(userRole))

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span className="">VendorBridge</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4 gap-1">
            {filteredLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    pathname === link.href ? "bg-accent text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
