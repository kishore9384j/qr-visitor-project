import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone, qrCode, name } = await request.json()

    if (!phone || !qrCode || !name) {
      return NextResponse.json(
        { error: "Phone, QR code, and name are required." },
        { status: 400 }
      )
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromPhone = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromPhone) {
      // If Twilio is not configured, return a helpful message
      return NextResponse.json(
        {
          success: false,
          error:
            "SMS service not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.",
          simulated: true,
        },
        { status: 200 }
      )
    }

    const baseUrl = request.headers.get("origin") || request.headers.get("host") || "http://localhost:3000"
    const verifyUrl = `${baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`}/verify/${qrCode}`

    const messageBody = `Hi ${name}, your SecureGate visitor pass is ready! Show this QR code at the gate for entry: ${verifyUrl}`

    // Use Twilio REST API directly
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phone,
        From: fromPhone,
        Body: messageBody,
      }),
    })

    const twilioData = await twilioRes.json()

    if (!twilioRes.ok) {
      console.error("Twilio error:", twilioData)
      return NextResponse.json(
        { error: "Failed to send SMS. Check Twilio configuration." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sid: twilioData.sid,
    })
  } catch (error) {
    console.error("SMS send error:", error)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    )
  }
}
