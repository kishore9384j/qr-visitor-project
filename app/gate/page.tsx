"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  ScanLine,
  Camera,
  Keyboard,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Phone,
  FileText,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"

interface Visitor {
  id: string
  name: string
  phone: string
  email: string | null
  reason: string
  host: string | null
  photo_url: string | null
  qr_code: string
  status: string
  is_blacklisted: boolean
  created_at: string
  checked_in_at: string | null
  checked_out_at: string | null
}

type ScanResult = {
  type: "success" | "blacklisted" | "error" | "not_found"
  message: string
  visitor?: Visitor
}

export default function GateScannerPage() {
  const [manualCode, setManualCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])

  const processQRCode = useCallback(async (qrValue: string) => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      const res = await fetch("/api/visitors/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: qrValue }),
      })

      const data = await res.json()

      if (data.blacklisted) {
        setScanResult({
          type: "blacklisted",
          message: "BLACKLISTED VISITOR - ENTRY DENIED",
          visitor: data.visitor,
        })
        toast.error("ALERT: Blacklisted visitor detected!", { duration: 8000 })
      } else if (data.notFound) {
        setScanResult({
          type: "not_found",
          message: "Invalid QR code - Visitor not found",
        })
        toast.error("Invalid QR code.")
      } else if (data.error) {
        setScanResult({
          type: "error",
          message: data.error,
        })
      } else {
        setScanResult({
          type: "success",
          message: "Visitor verified successfully",
          visitor: data.visitor,
        })
        toast.success(`Visitor ${data.visitor.name} verified!`)
      }
    } catch {
      setScanResult({
        type: "error",
        message: "Failed to verify QR code",
      })
      toast.error("Verification failed.")
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing])

  const startCamera = async () => {
    setScanResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsScanning(true)

      // Use BarcodeDetector API if available, otherwise fallback
      if ("BarcodeDetector" in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detector = new (window as any).BarcodeDetector({
          formats: ["qr_code"],
        })

        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await detector.detect(videoRef.current)
              if (barcodes.length > 0) {
                const value = barcodes[0].rawValue
                stopCamera()
                processQRCode(value)
              }
            } catch {
              // Detection failed, continue scanning
            }
          }
        }, 300)
      } else {
        toast.info(
          "Camera QR scanning requires BarcodeDetector API. Use manual entry or a modern browser.",
          { duration: 5000 }
        )
      }
    } catch (err) {
      console.error("Camera error:", err)
      toast.error("Could not access camera. Please use manual entry.")
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) {
      toast.error("Please enter a QR code value.")
      return
    }
    await processQRCode(manualCode.trim())
  }

  const handleCheckin = async () => {
    if (!scanResult?.visitor) return
    setActionLoading("checkin")
    try {
      const res = await fetch("/api/visitors/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: scanResult.visitor.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Check-in failed.")
        return
      }
      toast.success(`${scanResult.visitor.name} checked in successfully!`)
      setScanResult({
        ...scanResult,
        visitor: { ...scanResult.visitor, status: "checked_in" },
      })
    } catch {
      toast.error("Check-in failed.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCheckout = async () => {
    if (!scanResult?.visitor) return
    setActionLoading("checkout")
    try {
      const res = await fetch("/api/visitors/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: scanResult.visitor.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Check-out failed.")
        return
      }
      toast.success(`${scanResult.visitor.name} checked out successfully!`)
      setScanResult({
        ...scanResult,
        visitor: { ...scanResult.visitor, status: "checked_out" },
      })
    } catch {
      toast.error("Check-out failed.")
    } finally {
      setActionLoading(null)
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setManualCode("")
    stopCamera()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 py-8 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <ScanLine className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Gate Scanner
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Scan a visitor&apos;s QR code or enter the code manually to verify
              identity and check them in.
            </p>
          </div>

          {!scanResult ? (
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="gap-2">
                  <Keyboard className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="camera" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Camera Scan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Enter QR Code</CardTitle>
                    <CardDescription>
                      Type or paste the visitor&apos;s QR code value (e.g.
                      VIS-1234567890-ABCD1234)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleManualSubmit}
                      className="flex flex-col gap-4"
                    >
                      <Input
                        placeholder="VIS-XXXX-XXXXXXXX"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="font-mono"
                      />
                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" />
                            Verify Visitor
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="camera">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Camera Scanner</CardTitle>
                    <CardDescription>
                      Point the camera at the visitor&apos;s QR code to scan it
                      automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-foreground/5">
                      <video
                        ref={videoRef}
                        className="aspect-video w-full object-cover"
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-48 w-48 rounded-lg border-2 border-primary/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
                        </div>
                      )}
                      {!isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <p className="text-sm text-muted-foreground">
                            Camera not active
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={isScanning ? stopCamera : startCamera}
                      variant={isScanning ? "destructive" : "default"}
                      className="w-full gap-2"
                    >
                      {isScanning ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          Stop Camera
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Start Camera
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Result Banner */}
              <Card
                className={`border-2 ${
                  scanResult.type === "blacklisted"
                    ? "border-destructive bg-destructive/5"
                    : scanResult.type === "success"
                    ? "border-success bg-success/5"
                    : scanResult.type === "not_found"
                    ? "border-warning bg-warning/5"
                    : "border-destructive bg-destructive/5"
                }`}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  {scanResult.type === "blacklisted" ? (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive">
                      <AlertTriangle className="h-6 w-6 text-destructive-foreground" />
                    </div>
                  ) : scanResult.type === "success" ? (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success">
                      <CheckCircle className="h-6 w-6 text-success-foreground" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive">
                      <XCircle className="h-6 w-6 text-destructive-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      {scanResult.message}
                    </p>
                    {scanResult.visitor && (
                      <p className="text-sm text-muted-foreground">
                        {scanResult.visitor.name} - {scanResult.visitor.phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Visitor Details */}
              {scanResult.visitor && (
                <Card className="border-border">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {scanResult.visitor.photo_url && (
                        <img
                          src={scanResult.visitor.photo_url}
                          alt={scanResult.visitor.name}
                          className="h-24 w-24 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {scanResult.visitor.name}
                          </h3>
                          {scanResult.visitor.is_blacklisted ? (
                            <Badge variant="destructive">Blacklisted</Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className={
                                scanResult.visitor.status === "checked_in"
                                  ? "border-success/20 bg-success/10 text-success"
                                  : scanResult.visitor.status === "checked_out"
                                  ? "border-border bg-muted text-muted-foreground"
                                  : "border-primary/20 bg-primary/10 text-primary"
                              }
                            >
                              {scanResult.visitor.status
                                .replace("_", " ")
                                .toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            {scanResult.visitor.phone}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" />
                            {scanResult.visitor.reason}
                          </div>
                          {scanResult.visitor.host && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-3.5 w-3.5" />
                              Host: {scanResult.visitor.host}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            Registered:{" "}
                            {format(
                              new Date(scanResult.visitor.created_at),
                              "PPpp"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!scanResult.visitor.is_blacklisted && (
                      <>
                        <Separator className="my-4" />
                        <div className="flex flex-col gap-2 sm:flex-row">
                          {scanResult.visitor.status === "registered" && (
                            <Button
                              onClick={handleCheckin}
                              disabled={actionLoading === "checkin"}
                              className="flex-1 gap-2 bg-success text-success-foreground hover:bg-success/90"
                            >
                              {actionLoading === "checkin" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <LogIn className="h-4 w-4" />
                              )}
                              Check In Visitor
                            </Button>
                          )}
                          {scanResult.visitor.status === "checked_in" && (
                            <Button
                              onClick={handleCheckout}
                              disabled={actionLoading === "checkout"}
                              variant="outline"
                              className="flex-1 gap-2"
                            >
                              {actionLoading === "checkout" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <LogOut className="h-4 w-4" />
                              )}
                              Check Out Visitor
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Scan Again Button */}
              <Button
                variant="outline"
                onClick={resetScanner}
                className="w-full gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Scan Another QR Code
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
