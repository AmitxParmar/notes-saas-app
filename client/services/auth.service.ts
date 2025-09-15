import api from "@/lib/api"
import type { LoginCredentials, AuthResponse, ApiResponse } from "@/types"

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", credentials)
    return response.data.data
  }

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<ApiResponse<AuthResponse>>("/auth/me")
    return response.data.data
  }

  async refreshToken(): Promise<void> {
    await api.post<ApiResponse<void>>("/auth/refreshToken")
  }

  async logout(): Promise<void> {
    await api.post<ApiResponse<void>>("/auth/logout")
  }
}

export const authService = new AuthService()