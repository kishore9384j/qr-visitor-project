import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  if (session?.value !== "securegate_admin_authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { visitorId, blacklist } = await request.json()

    if (!visitorId || typeof blacklist !== "boolean") {
      return NextResponse.json(
        { error: "visitorId and blacklist flag are required." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from("visitors")
      .update({
        is_blacklisted: blacklist,
        blacklisted_at: blacklist ? new Date().toISOString() : null,
      })
      .eq("id", visitorId)

    if (error) {
      console.error("Blacklist update error:", error)
      return NextResponse.json(
        { error: "Failed to update blacklist status." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Blacklist error:", error)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    )
  }
}
