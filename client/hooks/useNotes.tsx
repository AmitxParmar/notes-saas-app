"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notesService } from "@/services/notes.service"
import { useAuth } from "./useAuth"
import type { Note, CreateNoteData, UpdateNoteData } from "@/types"

export function useNotes() {
  const queryClient = useQueryClient()
  const { tenant, isAuthenticated } = useAuth()

  // Get all notes
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ["notes", tenant?.slug],
    queryFn: () => notesService.getNotes(tenant!.slug),
    enabled: isAuthenticated && !!tenant?.slug,
  })

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (data: CreateNoteData) => notesService.createNote(data, tenant!.slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", tenant?.slug] })
    },
  })

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteData }) =>
      notesService.updateNote(id, data, tenant!.slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", tenant?.slug] })
    },
  })

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => notesService.deleteNote(id, tenant!.slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", tenant?.slug] })
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
    queryFn: () => notesService.getNote(id, tenant!.slug),
    enabled: isAuthenticated && !!tenant?.slug && !!id,
  })
}