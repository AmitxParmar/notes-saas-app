"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import type { Note } from "@/types"
import { useNotes } from "@/hooks/useNotes"

interface EditNoteDialogProps {
  note: Note
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditNoteDialog({ note, open, onOpenChange }: EditNoteDialogProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const { updateNote, isUpdating, updateError } = useNotes()

  useEffect(() => {
    if (open) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [note, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      return
    }
    
    try {
      await updateNote({
        id: note._id,
        data: { title: title.trim(), content: content.trim() },
      })
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the hook
      console.log(error)
    }
  }

  const handleClose = () => {
    if (!isUpdating) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>Make changes to your note. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                placeholder="Enter note content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                required
              />
            </div>

            {updateError && (
              <Alert variant="destructive">
                <AlertDescription>{updateError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || !title.trim() || !content.trim()}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
