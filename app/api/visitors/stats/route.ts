import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  if (session?.value !== "securegate_admin_authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  const [
    { count: totalVisitors },
    { count: checkedIn },
    { count: blacklisted },
    { count: todayVisitors },
  ] = await Promise.all([
    supabase.from("visitors").select("*", { count: "exact", head: true }),
    supabase
      .from("visitors")
      .select("*", { count: "exact", head: true })
      .eq("status", "checked_in"),
    supabase
      .from("visitors")
      .select("*", { count: "exact", head: true })
      .eq("is_blacklisted", true),
    supabase
      .from("visitors")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date().toISOString().split("T")[0]),
  ])

  return NextResponse.json({
    totalVisitors: totalVisitors ?? 0,
    checkedIn: checkedIn ?? 0,
    blacklisted: blacklisted ?? 0,
    todayVisitors: todayVisitors ?? 0,
  })
}
