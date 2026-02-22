import { Navbar } from "@/components/navbar"
import { RegistrationForm } from "@/components/registration-form"
import { Shield } from "lucide-react"

export const metadata = {
  title: "Register Visitor - SecureGate",
  description: "Register a new visitor and generate a QR code for gate entry.",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 py-8 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Visitor Registration
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Fill in the details below. A unique QR code will be generated and
              sent to you for gate entry verification.
            </p>
          </div>
          <RegistrationForm />
        </div>
      </main>
    </div>
  )
}
