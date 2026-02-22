"use client"

import { useEffect, useState, useRef } from "react"
import QRCode from "qrcode"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QRCodeDisplayProps {
  value: string
  size?: number
}

export function QRCodeDisplay({ value, size = 280 }: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function generate() {
      try {
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: "#1a2744",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H",
        })
        setDataUrl(url)
      } catch (err) {
        console.error("QR generation error:", err)
      }
    }
    generate()
  }, [value, size])

  const handleExport = async () => {
    if (!dataUrl) return

    // Create a high-res canvas for export
    const canvas = document.createElement("canvas")
    const exportSize = 600
    const padding = 40
    const totalSize = exportSize + padding * 2
    canvas.width = totalSize
    canvas.height = totalSize + 60
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw border
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)

    // Draw QR code
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.drawImage(img, padding, padding, exportSize, exportSize)

      // Add label
      ctx.fillStyle = "#1a2744"
      ctx.font = "bold 16px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("SecureGate Visitor Pass", canvas.width / 2, exportSize + padding + 30)
      ctx.font = "12px Inter, sans-serif"
      ctx.fillStyle = "#64748b"
      ctx.fillText(value, canvas.width / 2, exportSize + padding + 50)

      // Download
      const link = document.createElement("a")
      link.download = `QR-${value}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
    img.src = dataUrl
  }

  if (!dataUrl) {
    return (
      <div className="flex h-[280px] w-[280px] items-center justify-center rounded-lg border border-border bg-muted/50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="overflow-hidden rounded-xl border-2 border-primary/20 bg-card p-3 shadow-sm">
        <img
          src={dataUrl}
          alt={`QR Code for ${value}`}
          width={size}
          height={size}
          className="block"
        />
      </div>
      <p className="text-center font-mono text-xs text-muted-foreground">{value}</p>
      <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
        <Download className="h-4 w-4" />
        Export QR Code as PNG
      </Button>
    </div>
  )
}
