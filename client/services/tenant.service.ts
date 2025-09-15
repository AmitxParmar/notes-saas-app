import api from "@/lib/api"
import type { Tenant, ApiResponse } from "@/types"


class TenantService {
  async upgradePlan(tenantSlug: string|undefined): Promise<Tenant> {
    const response = await api.post<ApiResponse<Tenant>>(`/tenant/${tenantSlug}/upgrade`)
    return response.data.data
  }
}

export const tenantService = new TenantService()