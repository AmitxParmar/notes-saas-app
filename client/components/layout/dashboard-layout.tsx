"use client"

import type React from "react"

import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { AdminPanel } from "../admin/admin-panel"
import { NotesList } from "../notes/notes-list"
import { useAuth } from "@/hooks"


export function DashboardLayout() {
   const { user } = useAuth()
    const isMember = user?.role === "member"
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <div className="container mx-auto px-4 py-8">         
        {isMember ? <NotesList /> : <AdminPanel />}
          </div>
        </main>
      </div>
    </div>
  )
}
