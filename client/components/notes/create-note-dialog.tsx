"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, AlertTriangle } from "lucide-react"
import { useNotes } from "@/hooks/useNotes"
import { useAuth } from "@/hooks/useAuth"
import { useTenantMutation } from "@/hooks/useTenantMutation"

interface CreateNoteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateNoteDialog({ open, onOpenChange }: CreateNoteDialogProps) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const { createNote, isCreating, createError, notes } = useNotes()
    const { user, tenant } = useAuth()
    const { upgradeTenant, isUpgrading } = useTenantMutation()

    const isNoteLimitExceeded = notes.length === 2 && tenant?.plan === "free"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim() || !content.trim()) {
            return
        }

        try {
            await createNote({ title: title.trim(), content: content.trim() })
            setTitle("")
            setContent("")
            onOpenChange(false)
        } catch (error) {
            // Error is handled by the hook
            console.log(error)
        }
    }

    const handleUpgrade = async () => {
        if (!tenant) return

        try {
            await upgradeTenant()
            // After successful upgrade, the note limit should be lifted
        } catch (error) {
            // Error is handled by the hook
            console.log(error)
        }
    }

    const handleClose = () => {
        if (!isCreating) {
            setTitle("")
            setContent("")
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                    <DialogDescription>Add a new note to your collection. Fill in the title and content below.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Enter note title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                placeholder="Enter note content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                required
                            />
                        </div>

                        {isNoteLimitExceeded && (
                            <Alert variant="destructive">
                                <Crown className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="space-y-3">
                                        <p>Free plan limit reached (3 notes). Upgrade to Pro to unlock unlimited notes.</p>

                                        {user?.role === "admin" ? (
                                            <Button onClick={handleUpgrade} disabled={isUpgrading} size="sm" className="w-full">
                                                {isUpgrading ? "Upgrading..." : "Upgrade to Pro"}
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                                                    Your tenant has reached the Free plan limit. Please contact an Admin to upgrade.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {createError && !isNoteLimitExceeded && (
                            <Alert variant="destructive">
                                <AlertDescription>{createError}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating || !title.trim() || !content.trim()}>
                            {isCreating ? "Creating..." : "Create Note"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
