"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createUser } from "@/lib/api"
import type { UserRole } from "@/types/auth"
import { toast } from "sonner"
import {
  UserPlusIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircle2Icon,
  ShieldIcon,
  WrenchIcon,
  MonitorIcon,
  BarChart3Icon,
} from "lucide-react"

// ── Role definitions ────────────────────────────────────────────────
const ROLES: {
  value: UserRole
  label: string
  description: string
  icon: React.ReactNode
  lightColor: string
  darkColor: string
  lightBg: string
  darkBg: string
  lightBorder: string
  darkBorder: string
}[] = [
  {
    value: "OPER",
    label: "Operator",
    description: "Day-to-day device monitoring and operations",
    icon: <MonitorIcon className="size-4" />,
    lightColor: "text-sky-700",
    darkColor: "dark:text-sky-300",
    lightBg: "bg-sky-50",
    darkBg: "dark:bg-sky-900/30",
    lightBorder: "border-sky-200",
    darkBorder: "dark:border-sky-700/60",
  },
  {
    value: "ENGR",
    label: "Engineer",
    description: "Device configuration and technical management",
    icon: <WrenchIcon className="size-4" />,
    lightColor: "text-violet-700",
    darkColor: "dark:text-violet-300",
    lightBg: "bg-violet-50",
    darkBg: "dark:bg-violet-900/30",
    lightBorder: "border-violet-200",
    darkBorder: "dark:border-violet-700/60",
  },
  {
    value: "MNGR",
    label: "Manager",
    description: "Analytics, reports and team oversight",
    icon: <BarChart3Icon className="size-4" />,
    lightColor: "text-amber-700",
    darkColor: "dark:text-amber-300",
    lightBg: "bg-amber-50",
    darkBg: "dark:bg-amber-900/30",
    lightBorder: "border-amber-200",
    darkBorder: "dark:border-amber-700/60",
  },
  {
    value: "SUPER",
    label: "Super Admin",
    description: "Full system access including user management",
    icon: <ShieldIcon className="size-4" />,
    lightColor: "text-rose-700",
    darkColor: "dark:text-rose-300",
    lightBg: "bg-rose-50",
    darkBg: "dark:bg-rose-900/30",
    lightBorder: "border-rose-200",
    darkBorder: "dark:border-rose-700/60",
  },
]

export default function CreateUserPage() {
  const router = useRouter()

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "OPER" as UserRole,
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState<Partial<Record<keyof typeof form, string>>>({})

  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {}
    if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email"
    if (!/^\+?[0-9]{10,15}$/.test(form.mobile)) e.mobile = "Enter a valid mobile number (10–15 digits)"
    if (form.password.length < 8) e.password = "Password must be at least 8 characters"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSuccess(null)
    try {
      const res = await createUser(form)
      setSuccess(res.name)
      toast.success(`User "${res.name}" created successfully!`)
      setForm({ name: "", email: "", mobile: "", password: "", role: "OPER" })
      setErrors({})
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to create user. You may not have permission."
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const field = (
    id: keyof typeof form,
    label: string,
    type: string,
    placeholder: string,
    hint?: string
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-foreground dark:text-zinc-200">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={id === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          value={form[id]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [id]: e.target.value }))
            if (errors[id]) setErrors((prev) => ({ ...prev, [id]: undefined }))
          }}
          autoComplete={id === "password" ? "new-password" : undefined}
          className={`w-full h-10 px-3 text-sm rounded-lg border outline-none transition-all
            bg-white dark:bg-white/[0.05]
            text-foreground placeholder:text-muted-foreground/40
            focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400/70
            dark:focus:ring-teal-500/20 dark:focus:border-teal-500/50
            ${errors[id]
              ? "border-red-300 bg-red-50/30 dark:border-red-700/60 dark:bg-red-900/10"
              : "border-black/[0.08] dark:border-white/[0.10]"
            }
            ${id === "password" ? "pr-10" : ""}
          `}
        />
        {id === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        )}
      </div>
      {errors[id] && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{errors[id]}</p>
      )}
      {hint && !errors[id] && (
        <p className="text-xs text-muted-foreground/50">{hint}</p>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-8 py-6 md:py-8 px-4 lg:px-6 w-full">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserPlusIcon className="size-4" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Create User</h1>
        </div>
        <p className="text-sm text-muted-foreground/70 ml-12">
          Add a new user account. They can log in immediately with these credentials.
        </p>
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3">
          <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            <span className="font-semibold">{success}</span> was created and can now log in.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal details card */}
          <div className="flex flex-col h-full rounded-xl border border-black/[0.06] dark:border-white/[0.07] bg-white dark:bg-card shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden">
            <div className="px-5 py-3.5 border-b border-black/[0.05] dark:border-white/[0.06] bg-[#f8faf9] dark:bg-white/[0.03]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/90 dark:text-zinc-200">
                Account Details
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-4 flex-1">
              {field("name", "Full Name", "text", "e.g. Ravi Sharma")}
              {field("email", "Email Address", "email", "e.g. ravi@company.com")}
              {field("mobile", "Mobile Number", "tel", "e.g. +919876543210", "Include country code, 10–15 digits")}
              {field("password", "Password", "password", "Min. 8 characters")}
            </div>
          </div>

          {/* Role picker card */}
          <div className="flex flex-col h-full rounded-xl border border-black/[0.06] dark:border-white/[0.07] bg-white dark:bg-card shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden">
            <div className="px-5 py-3.5 border-b border-black/[0.05] dark:border-white/[0.06] bg-[#f8faf9] dark:bg-white/[0.03]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/90 dark:text-zinc-200">
                User Role
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 flex-1 content-start">
              {ROLES.map((role) => {
                const isSelected = form.role === role.value
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: role.value }))}
                    className={`relative flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? `${role.lightBorder} ${role.darkBorder} ${role.lightBg} ${role.darkBg} shadow-sm`
                        : "border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] hover:bg-black/[0.015] dark:hover:bg-white/[0.06] hover:border-black/[0.10] dark:hover:border-white/[0.14]"
                    }`}
                  >
                    <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${
                      isSelected
                        ? `${role.lightBg} ${role.darkBg} ${role.lightColor} ${role.darkColor}`
                        : "bg-black/[0.04] dark:bg-white/[0.07] text-muted-foreground/60"
                    }`}>
                      {role.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${
                        isSelected ? `${role.lightColor} ${role.darkColor}` : "text-foreground"
                      }`}>
                        {role.label}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className={`absolute top-2.5 right-2.5 size-2.5 rounded-full ${role.lightBg} ${role.darkBg} border-2 ${role.lightBorder} ${role.darkBorder}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold
              hover:bg-primary/90 active:scale-[0.98] transition-all duration-150
              disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <>
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating…
              </>
            ) : (
              <>
                <UserPlusIcon className="size-4" />
                Create User
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm({ name: "", email: "", mobile: "", password: "", role: "OPER" })
              setErrors({})
              setSuccess(null)
            }}
            className="px-4 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.10] bg-white dark:bg-white/[0.04] text-sm font-medium text-muted-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
