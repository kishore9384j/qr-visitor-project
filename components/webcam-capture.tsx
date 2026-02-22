"use client"

import { useRef, useState, useCallback } from "react"
import Webcam from "react-webcam"
import { Camera, RotateCcw, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void
  capturedImage: string | null
}

const videoConstraints = {
  width: 480,
  height: 360,
  facingMode: "user",
}

export function WebcamCapture({ onCapture, capturedImage }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
      setShowCamera(false)
    }
  }, [onCapture])

  const retake = () => {
    onCapture("")
    setShowCamera(true)
    setIsCameraReady(false)
  }

  if (capturedImage) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative overflow-hidden rounded-lg border-2 border-success/30 bg-success/5">
          <img
            src={capturedImage}
            alt="Captured visitor photo"
            className="h-[270px] w-[360px] object-cover"
          />
          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-success">
            <CheckCircle className="h-4 w-4 text-success-foreground" />
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={retake} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Retake Photo
        </Button>
      </div>
    )
  }

  if (!showCamera) {
    return (
      <button
        type="button"
        onClick={() => setShowCamera(true)}
        className="flex h-[270px] w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary/40 hover:bg-muted"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Camera className="h-7 w-7 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Click to open camera</p>
          <p className="text-xs text-muted-foreground">Take a photo for identity verification</p>
        </div>
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative overflow-hidden rounded-lg border-2 border-primary/30 bg-foreground/5">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={() => setIsCameraReady(true)}
          className="h-[270px] w-[360px] object-cover"
        />
        {!isCameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <p className="text-sm text-muted-foreground">Loading camera...</p>
          </div>
        )}
      </div>
      <Button
        type="button"
        onClick={capture}
        disabled={!isCameraReady}
        className="gap-2"
      >
        <Camera className="h-4 w-4" />
        Capture Photo
      </Button>
    </div>
  )
}
