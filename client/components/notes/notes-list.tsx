"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Plus, FileText, XCircle, PlusCircle, Loader } from "lucide-react"
import { useNotes } from "@/hooks/useNotes"
import { useAuth } from "@/hooks/useAuth"
import { NoteCard } from "./note-card"
import { CreateNoteDialog } from "./create-note-dialog"

export function NotesList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { notes, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotes()
  const { tenant } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const isFreePlan = tenant?.plan === "free"
  const noteCount = notes.length
  const noteLimit = tenant?.maxNotes || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Notes</h2>
          <p className="text-muted-foreground">
            {noteCount} of {isFreePlan ? noteLimit : "∞"} notes
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">No notes yet</CardTitle>
            <CardDescription className="text-center mb-4">
              Create your first note to get started with organizing your thoughts.
            </CardDescription>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}

        </div>
      )}
      <div className="w-full py-6 flex items-center justify-center ">
        <Button
          variant="ghost"
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          className="text-lg"
        >
          {isFetchingNextPage ? (
            <>
              <Loader size={20} className="mr-2" />
              Loading more...
            </>
          ) : hasNextPage ? (
            <>
              <PlusCircle size={20} className="mr-2" />
              Load More!!
            </>
          ) : (
            <>
              <XCircle size={20} className="mr-2" />
              Nothing more to load
            </>
          )}
        </Button>
      </div>
      <CreateNoteDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
