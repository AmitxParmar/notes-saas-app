"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Users, Building, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { UpgradePlanCard } from "./upgrade-plan-card"
import { InviteUserCard } from "./invite-user-card"

export function AdminPanel() {
  const { user, tenant } = useAuth()

  if (!user || !tenant) return null

  if (user.role !== "admin") {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Access denied. This page is only accessible to administrators.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Admin Panel
          </h2>
          <p className="text-muted-foreground">Manage your tenant settings and users</p>
        </div>
        <Badge variant="secondary">
          <Users className="h-4 w-4 mr-1" />
          Admin Access
        </Badge>
      </div>

      {/* Tenant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Tenant Information
          </CardTitle>
          <CardDescription>Current tenant details and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Tenant Name</div>
              <div className="text-lg font-semibold">{tenant.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Tenant Slug</div>
              <div className="text-lg font-semibold">{tenant.slug}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Plan</div>
              <div className="text-lg font-semibold capitalize flex items-center gap-2">
                {tenant.plan}
                {tenant.plan === "pro" && (
                  <Badge variant="default" className="text-xs">
                    Pro
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <UpgradePlanCard />
        <InviteUserCard />
      </div>
    </div>
  )
}
