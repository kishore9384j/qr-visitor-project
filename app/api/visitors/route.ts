import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  // Check admin session
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  if (session?.value !== "securegate_admin_authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status") || ""
  const blacklisted = searchParams.get("blacklisted") || ""

  const supabase = createAdminClient()

  let query = supabase
    .from("visitors")
    .select("*")
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  if (blacklisted && blacklisted === "true") {
    query = query.eq("is_blacklisted", true)
  }

  const { data: visitors, error } = await query

  if (error) {
    console.error("Visitors fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch visitors." }, { status: 500 })
  }

  return NextResponse.json({ visitors })
}
