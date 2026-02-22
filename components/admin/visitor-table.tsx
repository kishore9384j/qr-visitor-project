"use client"

import { useState } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"
import {
  Search,
  Eye,
  Ban,
  CheckCircle,
  Send,
  Loader2,
  UserX,
  QrCode,
  LogIn,
  LogOut,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

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

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function VisitorTable() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [blacklistFilter, setBlacklistFilter] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [detailVisitor, setDetailVisitor] = useState<Visitor | null>(null)

  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (statusFilter) params.set("status", statusFilter)
  if (blacklistFilter) params.set("blacklisted", blacklistFilter)

  const { data, mutate } = useSWR<{ visitors: Visitor[] }>(
    `/api/visitors?${params.toString()}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const visitors = data?.visitors || []

  const toggleBlacklist = async (visitor: Visitor) => {
    setActionLoading(`bl-${visitor.id}`)
    try {
      const res = await fetch("/api/visitors/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: visitor.id,
          blacklist: !visitor.is_blacklisted,
        }),
      })
      if (!res.ok) {
        toast.error("Failed to update blacklist status.")
        return
      }
      toast.success(
        visitor.is_blacklisted
          ? `${visitor.name} removed from blacklist.`
          : `${visitor.name} added to blacklist.`
      )
      mutate()
    } catch {
      toast.error("Failed to update blacklist status.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCheckin = async (visitor: Visitor) => {
    setActionLoading(`ci-${visitor.id}`)
    try {
      const res = await fetch("/api/visitors/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: visitor.id }),
      })
      if (!res.ok) {
        toast.error("Check-in failed.")
        return
      }
      toast.success(`${visitor.name} checked in.`)
      mutate()
    } catch {
      toast.error("Check-in failed.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCheckout = async (visitor: Visitor) => {
    setActionLoading(`co-${visitor.id}`)
    try {
      const res = await fetch("/api/visitors/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: visitor.id }),
      })
      if (!res.ok) {
        toast.error("Check-out failed.")
        return
      }
      toast.success(`${visitor.name} checked out.`)
      mutate()
    } catch {
      toast.error("Check-out failed.")
    } finally {
      setActionLoading(null)
    }
  }

  const sendSMS = async (visitor: Visitor) => {
    setActionLoading(`sms-${visitor.id}`)
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
      if (data.simulated) {
        toast.info("SMS service not configured. Set Twilio env vars to enable.")
      } else if (!res.ok) {
        toast.error("Failed to send SMS.")
      } else {
        toast.success("SMS sent successfully!")
      }
    } catch {
      toast.error("Failed to send SMS.")
    } finally {
      setActionLoading(null)
    }
  }

  const statusBadge = (status: string, blacklisted: boolean) => {
    if (blacklisted) {
      return (
        <Badge variant="destructive" className="gap-1 text-xs">
          <UserX className="h-3 w-3" />
          Blacklisted
        </Badge>
      )
    }
    switch (status) {
      case "checked_in":
        return (
          <Badge className="gap-1 border-success/20 bg-success/10 text-xs text-success">
            <CheckCircle className="h-3 w-3" />
            Checked In
          </Badge>
        )
      case "checked_out":
        return (
          <Badge variant="secondary" className="gap-1 text-xs">
            <LogOut className="h-3 w-3" />
            Checked Out
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1 text-xs">
            <QrCode className="h-3 w-3" />
            Registered
          </Badge>
        )
    }
  }

  return (
    <TooltipProvider>
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Visitors</CardTitle>
              <CardDescription>
                {visitors.length} visitor{visitors.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
              </SelectContent>
            </Select>
            <Select value={blacklistFilter} onValueChange={setBlacklistFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Visitors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visitors</SelectItem>
                <SelectItem value="true">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No visitors found.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  visitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell>
                        {visitor.photo_url ? (
                          <img
                            src={visitor.photo_url}
                            alt={visitor.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                            {visitor.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {visitor.name}
                          </span>
                          <span className="text-xs text-muted-foreground md:hidden">
                            {visitor.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {visitor.phone}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {visitor.reason}
                      </TableCell>
                      <TableCell>
                        {statusBadge(visitor.status, visitor.is_blacklisted)}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {format(new Date(visitor.created_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setDetailVisitor(visitor)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                asChild
                              >
                                <Link href={`/verify/${visitor.qr_code}`} target="_blank">
                                  <QrCode className="h-4 w-4" />
                                  <span className="sr-only">View QR</span>
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View QR Pass</TooltipContent>
                          </Tooltip>

                          {visitor.status === "registered" && !visitor.is_blacklisted && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-success"
                                  onClick={() => handleCheckin(visitor)}
                                  disabled={actionLoading === `ci-${visitor.id}`}
                                >
                                  {actionLoading === `ci-${visitor.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <LogIn className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Check in</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Check In</TooltipContent>
                            </Tooltip>
                          )}

                          {visitor.status === "checked_in" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleCheckout(visitor)}
                                  disabled={actionLoading === `co-${visitor.id}`}
                                >
                                  {actionLoading === `co-${visitor.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <LogOut className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Check out</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Check Out</TooltipContent>
                            </Tooltip>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => sendSMS(visitor)}
                                disabled={actionLoading === `sms-${visitor.id}`}
                              >
                                {actionLoading === `sms-${visitor.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                                <span className="sr-only">Send SMS</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Send QR via SMS</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${
                                  visitor.is_blacklisted
                                    ? "text-success"
                                    : "text-destructive"
                                }`}
                                onClick={() => toggleBlacklist(visitor)}
                                disabled={actionLoading === `bl-${visitor.id}`}
                              >
                                {actionLoading === `bl-${visitor.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : visitor.is_blacklisted ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}
                                <span className="sr-only">Toggle blacklist</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {visitor.is_blacklisted
                                ? "Remove from Blacklist"
                                : "Add to Blacklist"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!detailVisitor}
        onOpenChange={(open) => !open && setDetailVisitor(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Visitor Details</DialogTitle>
            <DialogDescription>
              Full information about this visitor
            </DialogDescription>
          </DialogHeader>
          {detailVisitor && (
            <div className="flex flex-col gap-4">
              {detailVisitor.photo_url && (
                <div className="flex justify-center">
                  <img
                    src={detailVisitor.photo_url}
                    alt={detailVisitor.name}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-foreground">
                    {detailVisitor.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium text-foreground">
                    {detailVisitor.phone}
                  </span>
                </div>
                {detailVisitor.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground">
                      {detailVisitor.email}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="font-medium text-foreground">
                    {detailVisitor.reason}
                  </span>
                </div>
                {detailVisitor.host && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Host</span>
                    <span className="font-medium text-foreground">
                      {detailVisitor.host}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {statusBadge(
                    detailVisitor.status,
                    detailVisitor.is_blacklisted
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">QR Code</span>
                  <span className="font-mono text-xs text-foreground">
                    {detailVisitor.qr_code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(detailVisitor.created_at), "PPpp")}
                  </span>
                </div>
                {detailVisitor.checked_in_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Checked In</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(detailVisitor.checked_in_at), "PPpp")}
                    </span>
                  </div>
                )}
                {detailVisitor.checked_out_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Checked Out</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(detailVisitor.checked_out_at), "PPpp")}
                    </span>
                  </div>
                )}
              </div>
              <Button asChild className="w-full gap-2">
                <Link href={`/verify/${detailVisitor.qr_code}`} target="_blank">
                  <QrCode className="h-4 w-4" />
                  View Full Pass
                </Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
