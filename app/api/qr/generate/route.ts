import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

export async function POST(request: NextRequest) {
  try {
    const { value } = await request.json()

    if (!value) {
      return NextResponse.json(
        { error: "QR code value is required." },
        { status: 400 }
      )
    }

    const qrDataUrl = await QRCode.toDataURL(value, {
      width: 600,
      margin: 2,
      color: {
        dark: "#1a2744",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })

    return NextResponse.json({ qrDataUrl })
  } catch (error) {
    console.error("QR generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate QR code." },
      { status: 500 }
    )
  }
}
