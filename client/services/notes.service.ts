import api from "@/lib/api"
import type { Note, CreateNoteData, UpdateNoteData, ApiResponse, GetNotesResponse } from "@/types"

class NotesService {
async getNotes(params?: { page?: number; limit?: number ; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<GetNotesResponse> {
    const response = await api.get<ApiResponse<GetNotesResponse>>("/notes", { params })
    return response.data.data
  }

  async getNote(id: string): Promise<Note> {
    const response = await api.get<ApiResponse<Note>>(`/notes/${id}`)
    return response.data.data
  }

  async createNote(data: CreateNoteData): Promise<Note> {
    const response = await api.post<ApiResponse<Note>>("/notes", data)
    return response.data.data
  }

  async updateNote(id: string, data: UpdateNoteData): Promise<Note> {
    const response = await api.put<ApiResponse<Note>>(`/notes/${id}`, data)
    return response.data.data
  }

  async deleteNote(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/notes/${id}`)
  }
}

export const notesService = new NotesService()