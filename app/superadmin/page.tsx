
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function SuperAdminRootPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/superadmin/dashboard")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to Super Admin Dashboard...</p>
      </div>
    </div>
  )
}
