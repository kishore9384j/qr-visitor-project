import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { visitorId, qrCode } = await request.json()

    const supabase = createAdminClient()

    let query = supabase.from("visitors").select("*")

    if (visitorId) {
      query = query.eq("id", visitorId)
    } else if (qrCode) {
      query = query.eq("qr_code", qrCode)
    } else {
      return NextResponse.json(
        { error: "visitorId or qrCode is required." },
        { status: 400 }
      )
    }

    const { data: visitor, error: fetchError } = await query.single()

    if (fetchError || !visitor) {
      return NextResponse.json(
        { error: "Visitor not found.", notFound: true },
        { status: 404 }
      )
    }

    if (visitor.status !== "checked_in") {
      return NextResponse.json(
        { error: "Visitor is not currently checked in.", visitor },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from("visitors")
      .update({
        status: "checked_out",
        checked_out_at: new Date().toISOString(),
      })
      .eq("id", visitor.id)

    if (updateError) {
      console.error("Check-out update error:", updateError)
      return NextResponse.json(
        { error: "Failed to check out visitor." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      visitor: { ...visitor, status: "checked_out" },
    })
  } catch (error) {
    console.error("Check-out error:", error)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    )
  }
}
