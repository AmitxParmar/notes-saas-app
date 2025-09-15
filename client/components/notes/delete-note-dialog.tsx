"use client"

import { Button } from "@/components/ui/button"
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

interface DeleteNoteDialogProps {
  note: Note
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteNoteDialog({ note, open, onOpenChange }: DeleteNoteDialogProps) {
  const { deleteNote, isDeleting, deleteError } = useNotes()

  const handleDelete = async () => {
    try {
      await deleteNote(note._id)
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the hook
      console.log(error)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Note</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{note.title}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {deleteError && (
          <Alert variant="destructive">
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
