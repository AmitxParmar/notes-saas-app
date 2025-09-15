"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Mail } from "lucide-react"
import { useTenantMutation } from "@/hooks/useTenantMutation"

export function InviteUserCard() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "member">("member")
  const [showSuccess, setShowSuccess] = useState(false)
  const { inviteUser, isInviting, inviteError } = useTenantMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      return
    }

    try {
      await inviteUser({ email: email.trim(), role })
      setEmail("")
      setRole("member")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (error) {
      // Error is handled by the hook
      console.log(error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite User
        </CardTitle>
        <CardDescription>Send an invitation to join your tenant</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={(value: "admin" | "member") => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member - Can manage notes</SelectItem>
                <SelectItem value="admin">Admin - Can manage notes and users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showSuccess && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Invitation sent successfully! The user will receive an email to join your tenant.
              </AlertDescription>
            </Alert>
          )}

          {inviteError && (
            <Alert variant="destructive">
              <AlertDescription>{inviteError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isInviting || !email.trim()} className="w-full">
            {isInviting ? "Sending Invitation..." : "Send Invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
