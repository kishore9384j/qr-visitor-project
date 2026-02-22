import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { VisitorPassCard } from "@/components/visitor-pass-card"

export async function generateMetadata({ params }: { params: Promise<{ qrCode: string }> }) {
  const { qrCode } = await params
  return {
    title: `Visitor Pass ${qrCode} - SecureGate`,
    description: "View and export your visitor QR code pass.",
  }
}

export default async function VerifyPage({ params, searchParams }: { params: Promise<{ qrCode: string }>; searchParams: Promise<{ new?: string }> }) {
  const { qrCode } = await params
  const search = await searchParams
  const isNew = search.new === "true"

  const supabase = createAdminClient()

  const { data: visitor, error } = await supabase
    .from("visitors")
    .select("*")
    .eq("qr_code", qrCode)
    .single()

  if (error || !visitor) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-start justify-center px-4 py-8 lg:py-12">
        <VisitorPassCard visitor={visitor} isNew={isNew} />
      </main>
    </div>
  )
}
