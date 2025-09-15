"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/useAuth"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoginLoading, loginError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
      router.push("/dashboard")
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const testAccounts = [
    { email: "admin@acme.test", role: "Admin", tenant: "Acme" },
    { email: "user@acme.test", role: "Member", tenant: "Acme" },
    { email: "admin@globex.test", role: "Admin", tenant: "Globex" },
    { email: "user@globex.test", role: "Member", tenant: "Globex" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your notes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoginLoading}>
                {isLoginLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Accounts</CardTitle>
            <CardDescription>Use these accounts for testing (password: password)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testAccounts.map((account) => (
                <div
                  key={account.email}
                  className="flex items-center justify-between p-2 rounded-md border cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setEmail(account.email)
                    setPassword("password")
                  }}
                >
                  <div>
                    <div className="font-medium text-sm">{account.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {account.role} • {account.tenant}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
