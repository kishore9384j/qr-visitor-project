"use client"

import { useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  CheckCircle,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { QRCodeDisplay } from "@/components/qr-code-display"

interface Visitor {
  id: string
  name: string
  phone: string
  email: string | null
  reason: string
  host: string | null
  notes: string | null
  photo_url: string | null
  qr_code: string
  status: string
  is_blacklisted: boolean
  created_at: string
  checked_in_at: string | null
  checked_out_at: string | null
}

interface VisitorPassCardProps {
  visitor: Visitor
  isNew?: boolean
}

export function VisitorPassCard({ visitor, isNew = false }: VisitorPassCardProps) {
  const [isSending, setIsSending] = useState(false)

  const handleSendSMS = async () => {
    setIsSending(true)
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: visitor.id,
          phone: visitor.phone,
          qrCode: visitor.qr_code,
          name: visitor.name,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to send SMS.")
        return
      }
      toast.success("QR code link sent via SMS!")
    } catch {
      toast.error("Failed to send SMS. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const statusColor = {
    registered: "bg-primary/10 text-primary border-primary/20",
    checked_in: "bg-success/10 text-success border-success/20",
    checked_out: "bg-muted text-muted-foreground border-border",
  }[visitor.status] || "bg-muted text-muted-foreground border-border"

  return (
    <div className="mx-auto w-full max-w-lg">
      {isNew && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-3">
          <CheckCircle className="h-5 w-5 shrink-0 text-success" />
          <p className="text-sm font-medium text-success">
            Registration successful! Your QR code has been generated.
          </p>
        </div>
      )}

      {visitor.is_blacklisted && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            This visitor has been blacklisted.
          </p>
        </div>
      )}

      <Card className="border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Visitor Pass</CardTitle>
          <CardDescription>
            Present this QR code at the gate for entry
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {/* Photo */}
          {visitor.photo_url && (
            <div className="overflow-hidden rounded-full border-2 border-border">
              <img
                src={visitor.photo_url}
                alt={`Photo of ${visitor.name}`}
                className="h-20 w-20 object-cover"
              />
            </div>
          )}

          {/* QR Code */}
          <QRCodeDisplay
            value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify/${visitor.qr_code}`}
          />

          <Separator />

          {/* Visitor Details */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="outline" className={statusColor}>
                {visitor.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium text-foreground">{visitor.name}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium text-foreground">{visitor.phone}</span>
            </div>

            {visitor.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{visitor.email}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Reason:</span>
              <span className="font-medium text-foreground">{visitor.reason}</span>
            </div>

            {visitor.host && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Host:</span>
                <span className="font-medium text-foreground">{visitor.host}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Registered:</span>
              <span className="font-medium text-foreground">
                {format(new Date(visitor.created_at), "PPpp")}
              </span>
            </div>

            {visitor.checked_in_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">Checked In:</span>
                <span className="font-medium text-foreground">
                  {format(new Date(visitor.checked_in_at), "PPpp")}
                </span>
              </div>
            )}

            {visitor.checked_out_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Checked Out:</span>
                <span className="font-medium text-foreground">
                  {format(new Date(visitor.checked_out_at), "PPpp")}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Send SMS Button */}
          <Button
            onClick={handleSendSMS}
            disabled={isSending}
            className="w-full gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send QR Code via SMS
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
