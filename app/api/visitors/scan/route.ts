import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code value is required." },
        { status: 400 }
      )
    }

    // Extract the QR code identifier from the URL or raw value
    let codeValue = qrCode
    // If it's a full URL like /verify/VIS-xxx, extract the code
    const urlMatch = qrCode.match(/\/verify\/([A-Z0-9-]+)/i)
    if (urlMatch) {
      codeValue = urlMatch[1]
    }

    const supabase = createAdminClient()

    const { data: visitor, error } = await supabase
      .from("visitors")
      .select("*")
      .eq("qr_code", codeValue)
      .single()

    if (error || !visitor) {
      return NextResponse.json(
        { error: "Invalid QR code. Visitor not found.", notFound: true },
        { status: 404 }
      )
    }

    if (visitor.is_blacklisted) {
      return NextResponse.json(
        {
          error: "ALERT: This visitor is BLACKLISTED. Entry DENIED.",
          blacklisted: true,
          visitor,
        },
        { status: 403 }
      )
    }

    return NextResponse.json({ visitor })
  } catch (error) {
    console.error("Scan verify error:", error)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    )
  }
}
