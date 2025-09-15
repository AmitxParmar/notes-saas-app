"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Check, Zap, Loader } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useTenantMutation } from "@/hooks/useTenantMutation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function UpgradePlanCard() {
  const { tenant } = useAuth()
  const { upgradeTenant, isUpgrading, upgradeError } = useTenantMutation()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  if (!tenant) return null

  const isPro = tenant.plan === "pro"

  const handleUpgrade = async () => {
    try {
      await upgradeTenant()
      setShowConfirmDialog(false)
    } catch (error) {
      // Error is handled by the hook
      console.log(error)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Subscription Plan
              </CardTitle>
              <CardDescription>Manage your tenant's subscription</CardDescription>
            </div>
            <Badge variant={isPro ? "default" : "secondary"} className="text-sm">
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid min-h-56 w-full gap-4 md:grid-cols-2">
            {/* /* Free Plan */}
            {!isUpgrading ?
              <>
                <Button
                  variant={"ghost"}
                  onClick={() => handleUpgrade()}
                  className={`p-4 size-full flex flex-col rounded-lg border ${!isPro ? "border-primary bg-primary/5" : "border-border"}`}
                  disabled={tenant.plan === "free" || isUpgrading}
                >
                  <h3 className="font-semibold mb-2">Free Plan</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Up to 3 notes
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Basic features
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Multi-tenant isolation
                    </li>
                  </ul>

                </Button>
                <Button
                  variant={"ghost"}
                  onClick={() => handleUpgrade()}
                  className={`p-4 size-full flex flex-col rounded-lg border ${isPro ? "border-primary bg-primary/5" : "border-border"}`}
                  disabled={tenant.plan === "pro" || isUpgrading}
                >
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    Pro Plan
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Unlimited notes
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Advanced features
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Priority support
                    </li>
                  </ul>

                </Button>
              </> : 
              <div className="col-span-full flex items-center justify-center">
                <Loader className="animate-spin" />
              </div>
            }
          </div>

          {!isPro && (
            <div className="pt-4 border-t">
              <Button onClick={() => setShowConfirmDialog(true)} className="w-full" size="lg">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          )}

          {isPro && (
            <Alert>
              <Crown className="h-4 w-4" />
              <AlertDescription>
                Your tenant is currently on the Pro plan with unlimited notes and advanced features.
              </AlertDescription>
            </Alert>
          )}

          {upgradeError && (
            <Alert variant="destructive">
              <AlertDescription>{upgradeError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Pro Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to upgrade {tenant.name} to the Pro plan? This will immediately unlock unlimited
              notes and advanced features.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isUpgrading}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade} disabled={isUpgrading}>
              {isUpgrading ? "Upgrading..." : "Upgrade Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
