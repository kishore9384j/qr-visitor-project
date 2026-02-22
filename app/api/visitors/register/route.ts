import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { visitorSchema } from "@/lib/validations"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = visitorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data.", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, phone, email, reason, host, notes, photo } = parsed.data
    const supabase = createAdminClient()

    // Check blacklist by phone
    const { data: blacklistedByPhone } = await supabase
      .from("visitors")
      .select("id, name")
      .eq("phone", phone)
      .eq("is_blacklisted", true)
      .limit(1)
      .single()

    if (blacklistedByPhone) {
      return NextResponse.json(
        {
          error: "This phone number is blacklisted. Entry denied.",
          blacklisted: true,
        },
        { status: 403 }
      )
    }

    // Check blacklist by email
    if (email) {
      const { data: blacklistedByEmail } = await supabase
        .from("visitors")
        .select("id, name")
        .eq("email", email)
        .eq("is_blacklisted", true)
        .limit(1)
        .single()

      if (blacklistedByEmail) {
        return NextResponse.json(
          {
            error: "This email is blacklisted. Entry denied.",
            blacklisted: true,
          },
          { status: 403 }
        )
      }
    }

    // Upload photo to Supabase Storage
    let photo_url: string | null = null
    if (photo) {
      const base64Data = photo.replace(/^data:image\/\w+;base64,/, "")
      const buffer = Buffer.from(base64Data, "base64")
      const fileName = `visitor_${Date.now()}_${randomUUID().slice(0, 8)}.jpg`

      const { error: uploadError } = await supabase.storage
        .from("visitor-photos")
        .upload(fileName, buffer, {
          contentType: "image/jpeg",
          upsert: false,
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("visitor-photos")
          .getPublicUrl(fileName)
        photo_url = urlData.publicUrl
      }
    }

    // Generate unique QR code
    const qr_code = `VIS-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`

    // Insert visitor
    const { data: visitor, error: insertError } = await supabase
      .from("visitors")
      .insert({
        name,
        phone,
        email: email || null,
        reason,
        host: host || null,
        notes: notes || null,
        photo_url,
        qr_code,
        status: "registered",
        is_blacklisted: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json(
        { error: "Failed to register visitor." },
        { status: 500 }
      )
    }

    return NextResponse.json({ visitor }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    )
  }
}
