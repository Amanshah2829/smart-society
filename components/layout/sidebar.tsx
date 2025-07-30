
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  FileText,
  MessageSquare,
  Users,
  Megaphone,
  BarChart3,
  Settings,
  Menu,
  X,
  CreditCard,
  Shield,
  UserCheck,
  Receipt,
  Building2,
  BookOpen,
  Server,
  LayoutGrid,
  Heart,
  Book,
  HeartPulse,
  Leaf,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  userRole: string
}

const roleMenus = {
  admin: [
    { icon: Home, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: FileText, label: "Maintenance", href: "/admin/maintenance" },
    { icon: MessageSquare, label: "Complaints", href: "/admin/complaints" },
    { icon: Users, label: "Visitors", href: "/admin/visitors" },
    { icon: Megaphone, label: "Announcements", href: "/admin/announcements" },
    { icon: Users, label: "Community", href: "/admin/community" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Server, label: "Server", href: "/admin/server" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ],
  resident: [
    { icon: Home, label: "Dashboard", href: "/resident" },
    { icon: CreditCard, label: "Bills", href: "/resident/bills" },
    { icon: MessageSquare, label: "Complaints", href: "/resident/complaints" },
    { icon: Users, label: "Visitors", href: "/resident/visitors" },
    { icon: Megaphone, label: "Notices", href: "/resident/notices" },
    { icon: Book, label: "Digital Literacy", href: "/resident/digital-literacy" },
    { icon: HeartPulse, label: "Healthcare", href: "/resident/healthcare" },
    { icon: Leaf, label: "Environment", href: "/resident/environment" },
    { icon: Briefcase, label: "Economic Hub", href: "/resident/economic-hub" },
    { icon: Heart, label: "Community", href: "/resident/community" },
    { icon: Settings, label: "Settings", href: "/resident/settings" },
  ],
  security: [
    { icon: Home, label: "Dashboard", href: "/security" },
    { icon: Shield, label: "Visitor Log", href: "/security/visitors" },
  ],
  receptionist: [
    { icon: Home, label: "Dashboard", href: "/receptionist" },
    { icon: UserCheck, label: "Visitors", href: "/receptionist/visitors" },
    { icon: MessageSquare, label: "Complaints", href: "/receptionist/complaints" },
  ],
  accountant: [
    { icon: Home, label: "Dashboard", href: "/accountant" },
    { icon: Receipt, label: "Billing", href: "/accountant/billing" },
    { icon: BookOpen, label: "Ledger", href: "/accountant/ledger" },
    { icon: BarChart3, label: "Reports", href: "/accountant/reports" },
    { icon: Settings, label: "Settings", href: "/accountant/settings" },
  ],
  superadmin: [
    { icon: LayoutGrid, label: "Dashboard", href: "/superadmin/dashboard" },
    { icon: Building2, label: "Sites", href: "/superadmin/sites" },
  ],
}

export function Sidebar({ userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const menuItems = roleMenus[userRole as keyof typeof roleMenus] || []

  const getHref = (baseHref: string) => {
    if (userRole === 'admin') return baseHref.replace('/resident', '/admin');
    if (userRole === 'accountant') return baseHref.replace('/resident', '/accountant');
    return baseHref;
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-border">
            <Building2 className="w-6 h-6 mr-2 text-primary"/>
            <h1 className="text-xl font-bold text-foreground">Smart Society</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const href = getHref(item.href)
              const isActive = pathname === href

              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Role indicator */}
          <div className="p-4 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Logged in as</p>
              <p className="font-medium text-foreground capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
