"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import type { User, Tenant, LoginCredentials, AuthResponse } from "@/types"

// Dummy data for testing - matches assignment requirements
const DUMMY_USERS = [
  {
    id: "1",
    email: "admin@acme.test",
    password: "password",
    role: "admin" as const,
    tenantId: "acme-1",
    tenantSlug: "acme",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "user@acme.test",
    password: "password",
    role: "member" as const,
    tenantId: "acme-1",
    tenantSlug: "acme",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    email: "admin@globex.test",
    password: "password",
    role: "admin" as const,
    tenantId: "globex-1",
    tenantSlug: "globex",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    email: "user@globex.test",
    password: "password",
    role: "member" as const,
    tenantId: "globex-1",
    tenantSlug: "globex",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

const DUMMY_TENANTS = [
  {
    id: "acme-1",
    name: "Acme Corporation",
    slug: "acme",
    plan: "free" as const,
    noteLimit: 3,
    noteCount: 0,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "globex-1",
    name: "Globex Corporation",
    slug: "globex",
    plan: "free" as const,
    noteLimit: 3,
    noteCount: 0,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useAuth() {
  const queryClient = useQueryClient()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")
    const tenantData = localStorage.getItem("tenant_data")

    if (token && userData && tenantData) {
      try {
        const user = JSON.parse(userData)
        const tenant = JSON.parse(tenantData)
        queryClient.setQueryData(["auth", "user"], user)
        queryClient.setQueryData(["auth", "tenant"], tenant)
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        localStorage.removeItem("tenant_data")
      }
    }
    setIsInitialized(true)
  }, [queryClient])

  // Get current user query
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async (): Promise<User | null> => {
      const token = localStorage.getItem("auth_token")
      if (!token) return null

      const userData = localStorage.getItem("user_data")
      return userData ? JSON.parse(userData) : null
    },
    enabled: isInitialized,
  })

  // Get current tenant query
  const { data: tenant, isLoading: isTenantLoading } = useQuery({
    queryKey: ["auth", "tenant"],
    queryFn: async (): Promise<Tenant | null> => {
      const token = localStorage.getItem("auth_token")
      if (!token) return null

      const tenantData = localStorage.getItem("tenant_data")
      return tenantData ? JSON.parse(tenantData) : null
    },
    enabled: isInitialized,
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      await delay(1000) // Simulate API delay

      const user = DUMMY_USERS.find((u) => u.email === credentials.email && u.password === credentials.password)

      if (!user) {
        throw new Error("Invalid email or password")
      }

      const tenant = DUMMY_TENANTS.find((t) => t.id === user.tenantId)
      if (!tenant) {
        throw new Error("Tenant not found")
      }

      const token = `dummy-jwt-token-${user.id}`
      const { password, ...userWithoutPassword } = user

      return {
        user: userWithoutPassword,
        token,
        tenant,
      }
    },
    onSuccess: (data) => {
      // Store auth data
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user_data", JSON.stringify(data.user))
      localStorage.setItem("tenant_data", JSON.stringify(data.tenant))

      // Update query cache
      queryClient.setQueryData(["auth", "user"], data.user)
      queryClient.setQueryData(["auth", "tenant"], data.tenant)
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await delay(500) // Simulate API delay
    },
    onSuccess: () => {
      // Clear auth data
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
      localStorage.removeItem("tenant_data")

      // Clear query cache
      queryClient.clear()
    },
  })

  const isLoading = isUserLoading || isTenantLoading || !isInitialized
  const isAuthenticated = !!user && !!tenant
  const isAdmin = user?.role === "admin"

  return {
    user,
    tenant,
    isLoading,
    isAuthenticated,
    isAdmin,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    loginError: loginMutation.error?.message,
  }
}
