"use client"

import useSWR from "swr"
import { Users, UserCheck, AlertTriangle, CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statCards = [
  {
    key: "totalVisitors" as const,
    label: "Total Visitors",
    icon: Users,
    color: "bg-primary/10 text-primary",
  },
  {
    key: "todayVisitors" as const,
    label: "Today",
    icon: CalendarDays,
    color: "bg-accent/10 text-accent",
  },
  {
    key: "checkedIn" as const,
    label: "Checked In",
    icon: UserCheck,
    color: "bg-success/10 text-success",
  },
  {
    key: "blacklisted" as const,
    label: "Blacklisted",
    icon: AlertTriangle,
    color: "bg-destructive/10 text-destructive",
  },
]

type StatsData = {
  totalVisitors: number
  todayVisitors: number
  checkedIn: number
  blacklisted: number
}

export function AdminStats() {
  const { data } = useSWR<StatsData>("/api/visitors/stats", fetcher, {
    refreshInterval: 10000,
  })

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <Card key={card.key} className="border-border">
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${card.color}`}
            >
              <card.icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">
                {data ? data[card.key] : "-"}
              </span>
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
