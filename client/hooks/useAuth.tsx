"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"
import type { User, Tenant, LoginCredentials, AuthResponse } from "@/types"

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
}

// Fetch current user and tenant data
export const useCurrentUser = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async (): Promise<AuthResponse> => {
      const data = await authService.getCurrentUser()
      return data
    },
    retry: 2,
      
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== undefined ? options.enabled : true,
    select: (data) => data,
    
  })
}

/**
 * Custom hook to access authentication state and user information.
 */
export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"
  const userQuery = useCurrentUser({ enabled: !isLoginPage })
  const isLoading = userQuery.isLoading
  const isAuthenticated = !!(userQuery.data?.user && userQuery.data?.tenant && !userQuery.error)

  // Check for authentication errors
  const error = userQuery.error as any
  const errorStatus = error?.response?.status
  const errorCode = error?.response?.data?.code

  const isUnauthenticated =
    errorStatus === 401 ||
    errorCode === "ACCESS_TOKEN_MISSING" ||
    errorCode === "ACCESS_TOKEN_INVALID" ||
    errorCode === "USER_NOT_FOUND" ||
    errorCode === "TENANT_NOT_FOUND" ||
    errorCode === "AUTH_ERROR" ||
    errorCode === "AUTHENTICATION_REQUIRED"

  // Redirect to login if unauthenticated and not loading
  useEffect(() => {
    if (isUnauthenticated && !isLoading && !isLoginPage) {
      // Clear any cached data to avoid showing stale state
      if (typeof window !== "undefined") {
        try {
          router.push("/login")
        } catch (error) {
          // Fallback to window.location if router fails
          window.location.href = "/login"
        }
      }
    }
  }, [isUnauthenticated, isLoading, isLoginPage, router])

  const user = userQuery.data?.user || null
  const tenant = userQuery.data?.tenant || null
  const isAdmin = user?.role === "admin"

  return {
    user,
    tenant,
    isAuthenticated,
    isUnauthenticated,
    isLoading,
    isAdmin,
    hasAuthError: !!error,
    error: userQuery.error ?? null,
  }
}
// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      return await authService.login(credentials)
    },
    onSuccess: (data) => {
      if (data.user && data.tenant) {
        // Server sets cookies automatically, just update the auth data
        queryClient.setQueryData(authKeys.user(), data)
      }
    },
    onError: (error) => {
      console.error("Login failed:", error)
    },
  })
}

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await authService.logout()
    },
    onSuccess: () => {
      // Server clears cookies automatically, just clear the cache
      queryClient.clear()
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    },
    onError: (error) => {
      console.error("Logout failed:", error)
      // Even if logout fails on server, clear local state
      queryClient.clear()
      // Still redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    },
  })
}

// Refresh user data from server
export const useRefreshUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return await authService.getCurrentUser()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data)
    },
    onError: (error: any) => {
      // If refresh fails, clear everything and redirect to login
      queryClient.clear()

      // Redirect to login page if in browser
      if (typeof window !== "undefined") {
        const errorCode = error?.response?.data?.code
        // Only redirect if it's actually an auth error
        if (errorCode === "REFRESH_TOKEN_MISSING" ||
          errorCode === "REFRESH_TOKEN_EXPIRED" ||
          errorCode === "REFRESH_TOKEN_INVALID") {
          window.location.href = "/login"
        }
      }
    },
  })
}
