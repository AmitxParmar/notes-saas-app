"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Calendar } from "lucide-react"
import type { Note } from "@/types"
import { useAuth } from "@/hooks/useAuth"
import { EditNoteDialog } from "./edit-note-dialog"
import { DeleteNoteDialog } from "./delete-note-dialog"

interface NoteCardProps {
  note: Note
}

export function NoteCard({ note }: NoteCardProps) {
  const { user } = useAuth()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const canEdit = user?.id === note.userId || user?.role === "member"
  const isOwner = user?.id === note.userId

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                {formatDate(note.updatedAt)}
              </CardDescription>
            </div>
            {!isOwner && (
              <Badge variant="secondary" className="ml-2 flex-shrink-0">
                Shared
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-4">{note.content}</p>
          </div>

          {canEdit && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EditNoteDialog note={note} open={isEditOpen} onOpenChange={setIsEditOpen} />

      <DeleteNoteDialog note={note} open={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
    </>
  )
}
