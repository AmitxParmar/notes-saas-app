"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Tenant } from "@/types"
import { useAuth } from "./useAuth"
import { tenantService } from "@/services"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useTenantMutation() {
    const queryClient = useQueryClient()
    const { user, tenant } = useAuth()

    // Upgrade tenant to pro plan (admin only)
    const upgradeTenantMutation = useMutation({
        mutationFn: () => tenantService.upgradePlan(tenant?.slug),
        onSuccess: (upgradedTenant) => {
            // Update query cache
            queryClient.setQueryData(["auth", "tenant"], upgradedTenant)
            queryClient.invalidateQueries({ queryKey: ["auth", "user"] })
        },
    })

    // Invite user to tenant (admin only)
    const inviteUserMutation = useMutation({
        mutationFn: async ({ email, role }: { email: string; role: "admin" | "member" }): Promise<void> => {
            await delay(1000)

            if (!user || user.role !== "admin") {
                throw new Error("Only admins can invite users")
            }

            if (!tenant) {
                throw new Error("Tenant not found")
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                throw new Error("Please enter a valid email address")
            }

            // Check if email already exists (dummy validation)
            const existingEmails = ["admin@acme.test", "user@acme.test", "admin@globex.test", "user@globex.test"]

            if (existingEmails.includes(email)) {
                throw new Error("User with this email already exists")
            }

            // Simulate sending invitation
            console.log(`Invitation sent to ${email} with role ${role} for tenant ${tenant.slug}`)
        },
    })

    return {
        upgradeTenant: upgradeTenantMutation.mutateAsync,
        inviteUser: inviteUserMutation.mutateAsync,
        isUpgrading: upgradeTenantMutation.isPending,
        isInviting: inviteUserMutation.isPending,
        upgradeError: upgradeTenantMutation.error?.message,
        inviteError: inviteUserMutation.error?.message,
    }
}
