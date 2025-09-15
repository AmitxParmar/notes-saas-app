"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Crown } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter, usePathname } from "next/navigation"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
]


export function Sidebar() {
  const { user, tenant } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  if (!user || !tenant) return null

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
      <div className="flex flex-col flex-grow pt-5 bg-background border-r overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="w-full">
            <div className="text-sm font-medium text-muted-foreground mb-1">Current Tenant</div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{tenant.name}</span>
              {tenant.plan === "pro" && (
                <Badge variant="default" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
            {/* <div className="text-xs text-muted-foreground mt-1">
              {tenant.plan === "free" ? `${tenant.noteCount}/${tenant.noteLimit} notes` : "Unlimited notes"}
            </div> */}
            <div className="text-xs text-muted-foreground mt-1">
              Role: <span className="capitalize font-medium">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", isActive && "bg-secondary")}
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                  {user.role === "admin" && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      Admin
                    </Badge>
                  )}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
