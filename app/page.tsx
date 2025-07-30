import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Users, Shield, CreditCard, MessageSquare, Megaphone, BarChart3 } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Different dashboards for Admin, Residents, Security, and Staff",
    },
    {
      icon: CreditCard,
      title: "Maintenance Billing",
      description: "Generate bills, track payments, and online payment integration",
    },
    {
      icon: MessageSquare,
      title: "Complaint Management",
      description: "Real-time complaint tracking with status updates and notifications",
    },
    {
      icon: Shield,
      title: "Visitor Management",
      description: "Log visitors with photos, track entry/exit, and notify residents",
    },
    {
      icon: Megaphone,
      title: "Announcements",
      description: "Society-wide notices and event updates with role-based targeting",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive reports and insights for better management",
    },
  ]

  const dashboards = [
    { role: "Admin", href: "/admin", color: "bg-red-500", description: "Full system access" },
    { role: "Resident", href: "/resident", color: "bg-blue-500", description: "Bills & complaints" },
    { role: "Security", href: "/security", color: "bg-green-500", description: "Visitor logs" },
    { role: "Receptionist", href: "/receptionist", color: "bg-purple-500", description: "Front desk" },
    { role: "Accountant", href: "/accountant", color: "bg-orange-500", description: "Billing & reports" },
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-grid-white/[0.05] bg-grid-black/[0.02] relative">
       <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">Smart Society</h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Complete Management System for Modern Residential Societies
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Streamline maintenance, complaints, visitor management, and payments with our comprehensive platform
            designed for residents, management, and staff.
          </p>

          <Link href="/login">
             <Button size="lg" className="text-lg px-8 py-6">Go to Login</Button>
          </Link>

          {/* Direct Dashboard Access */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Explore Role Dashboards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {dashboards.map((dashboard) => (
                <Link key={dashboard.role} href={dashboard.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-secondary hover:bg-muted/80">
                    <CardHeader className="items-center pb-2">
                      <Badge className={`${dashboard.color} text-white mb-2`}>{dashboard.role}</Badge>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-xs text-muted-foreground">{dashboard.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-lg hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border/50">
          <p className="text-muted-foreground">
            Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui
          </p>
        </div>
      </div>
    </div>
  )
}
