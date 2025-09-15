import api from "@/lib/api"
import type { Note, CreateNoteData, UpdateNoteData, ApiResponse } from "@/types"

class NotesService {
  async getNotes(tenantSlug: string): Promise<Note[]> {
    const response = await api.get<ApiResponse<Note[]>>("/notes")
    return response.data.data
  }

  async getNote(id: string, tenantSlug: string): Promise<Note> {
    const response = await api.get<ApiResponse<Note>>(`/notes/${id}`)
    return response.data.data
  }

  async createNote(data: CreateNoteData, tenantSlug: string): Promise<Note> {
    const response = await api.post<ApiResponse<Note>>("/notes", data)
    return response.data.data
  }

  async updateNote(id: string, data: UpdateNoteData, tenantSlug: string): Promise<Note> {
    const response = await api.put<ApiResponse<Note>>(`/notes/${id}`, data)
    return response.data.data
  }

  async deleteNote(id: string, tenantSlug: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/notes/${id}`)
  }
}

export const notesService = new NotesService()