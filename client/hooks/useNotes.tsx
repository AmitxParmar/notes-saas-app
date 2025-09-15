"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notesService } from "@/services/notes.service"
import { useAuth } from "./useAuth"
import type { Note, CreateNoteData, UpdateNoteData } from "@/types"

export function useNotes() {
  const queryClient = useQueryClient()
  const {  isAuthenticated,user } = useAuth()

  // Get all notes
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ["notes", user?._id],
    queryFn: () => notesService.getNotes(),
    retry:3,
    enabled: isAuthenticated && user?.role === "member",
  })

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (data: CreateNoteData) => notesService.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?._id] })
    },
  })

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteData }) =>
      notesService.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?._id] })
    },
  })

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => notesService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?._id] })
    },
  })

  return {
    notes: notes || [],
    isLoading,
    error: error?.message,
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
    createError: createNoteMutation.error?.message,
    updateError: updateNoteMutation.error?.message,
    deleteError: deleteNoteMutation.error?.message,
  }
}

export function useNote(id: string) {
  const { tenant, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["note", id, tenant?.slug],
    queryFn: () => notesService.getNote(id),
    enabled: isAuthenticated && !!tenant?.slug && !!id,
  })
}