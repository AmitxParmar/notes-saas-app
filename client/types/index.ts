// Core types for the multi-tenant SaaS Notes Application

export interface User {
  id: string
  email: string
  role: "admin" | "member"
  tenantId: string
  tenantSlug: string
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: "free" | "pro"
  noteLimit: number
  noteCount: number
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  userId: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
  tenant: Tenant
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateNoteData {
  title: string
  content: string
}

export interface UpdateNoteData {
  title?: string
  content?: string
}

export interface ApiError {
  message: string
  status: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}
