import { z } from "zod"

export const visitorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  reason: z.string().min(1, "Please provide a reason for your visit"),
  host: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  photo: z.string().optional(),
})

export type VisitorInput = z.infer<typeof visitorSchema>

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

export type AdminLoginInput = z.infer<typeof adminLoginSchema>

export interface Visitor {
  id: string
  name: string
  email: string | null
  phone: string
  reason: string
  host: string | null
  notes: string | null
  photo_url: string | null
  qr_code: string
  status: "registered" | "checked_in" | "checked_out"
  is_blacklisted: boolean
  blacklisted_at: string | null
  created_at: string
  checked_in_at: string | null
  checked_out_at: string | null
}
