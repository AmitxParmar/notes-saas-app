"use client"

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notesService } from "@/services/notes.service"
import { useAuth } from "./useAuth"
import type {  CreateNoteData, UpdateNoteData } from "@/types"

export function useNotes() {
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()

  // Get all notes with infinite query
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["notes", user?._id],
    queryFn: async ({ pageParam = 1 }) => {
      return notesService.getNotes({ page: pageParam, limit: 10 })
    },
    enabled: isAuthenticated && user?.role === "member",
    getNextPageParam: (lastPage) => {
      if (
        lastPage?.pagination &&
        lastPage.pagination.hasMore &&
        lastPage.pagination.currentPage < lastPage.pagination.totalPages
      ) {
        return lastPage.pagination.currentPage + 1
      }
      return undefined
    },
    initialPageParam: 1,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  })

  // Flatten notes from all pages
  const notes = data?.pages?.flatMap(page => page.notes || []) || []

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
    notes,
    isLoading,
    error: error?.message,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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