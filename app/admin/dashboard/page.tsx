"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { AdminStats } from "@/components/admin/admin-stats"
import { VisitorTable } from "@/components/admin/visitor-table"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/admin/check")
        if (!res.ok) {
          router.replace("/admin")
          return
        }
        setIsAuthed(true)
      } catch {
        router.replace("/admin")
      }
    }
    check()
  }, [router])

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage visitors, monitor check-ins, and control blacklist
            </p>
          </div>
          <AdminStats />
          <div className="mt-6">
            <VisitorTable />
          </div>
        </div>
      </main>
    </div>
  )
}
