import Link from "next/link"
import {
  Shield,
  QrCode,
  UserCheck,
  AlertTriangle,
  Camera,
  ArrowRight,
  ClipboardList,
  ScanLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"

const features = [
  {
    icon: ClipboardList,
    title: "Online Registration",
    description:
      "Visitors fill out a simple form with name, phone, email, reason, and a webcam photo.",
  },
  {
    icon: QrCode,
    title: "QR Code Generation",
    description:
      "A unique QR code is generated for each visitor and sent via SMS or WhatsApp.",
  },
  {
    icon: ScanLine,
    title: "Gate Scanning",
    description:
      "Security scans the QR code at the gate for instant identity verification and check-in.",
  },
  {
    icon: Camera,
    title: "Photo Verification",
    description:
      "Stored visitor photos allow manual visual verification by security personnel.",
  },
  {
    icon: AlertTriangle,
    title: "Blacklist Protection",
    description:
      "Automatically blocks blacklisted visitors from re-registering using phone or email.",
  },
  {
    icon: UserCheck,
    title: "Admin Dashboard",
    description:
      "Manage visitors, view check-in history, toggle blacklist, and export QR codes.",
  },
]

const steps = [
  {
    step: "01",
    title: "Register",
    description: "Visitor fills out the form and captures a photo.",
  },
  {
    step: "02",
    title: "Get QR Code",
    description: "System generates a QR code and sends it via SMS.",
  },
  {
    step: "03",
    title: "Scan at Gate",
    description: "Security scans the QR code for instant verification.",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-card">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.35_0.1_250/0.08),transparent_70%)]" />
          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center lg:px-8 lg:py-28">
            <div className="mb-6 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Enterprise Security Solution
              </span>
            </div>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Smart Visitor Entry Management
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Automate visitor registration, generate unique QR codes, and
              verify identities at the gate in seconds. Built for modern office
              security.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2 text-base">
                <Link href="/register">
                  Register a Visitor
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 text-base"
              >
                <Link href="/gate">Open Gate Scanner</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-b border-border bg-background px-4 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                How It Works
              </h2>
              <p className="mt-3 text-muted-foreground">
                Three simple steps to secure visitor management
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Key Features
              </h2>
              <p className="mt-3 text-muted-foreground">
                Everything you need for secure visitor management
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feat, i) => (
                <Card
                  key={i}
                  className="border-border bg-card transition-shadow hover:shadow-md"
                >
                  <CardContent className="flex flex-col gap-3 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <feat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {feat.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              SecureGate
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Visitor Entry Management System
          </p>
        </div>
      </footer>
    </div>
  )
}
