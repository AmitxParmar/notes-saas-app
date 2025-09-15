import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"


export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout/> 
    </AuthGuard>
  )
}
