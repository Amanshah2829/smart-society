
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Users, DollarSign, Activity, CheckCircle, Clock, AlertCircle, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Site } from "@/backend/models/Site"

interface SiteStats extends Site {
  totalResidents: number
  openComplaints: number
  collectionRate: number
  performance: number
}

interface SuperAdminDashboard {
  totalSites: number
  totalResidents: number
  totalRevenue: number
  sites: SiteStats[]
}

export default function SuperAdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<SuperAdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/superadmin/dashboard")
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        toast({ variant: "destructive", title: "Failed to fetch dashboard data" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching dashboard data" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const getSubscriptionStatusBadge = (status: 'trial' | 'active' | 'expired') => {
      switch (status) {
          case 'active': return <Badge className="bg-green-500 text-white">Active</Badge>
          case 'trial': return <Badge className="bg-yellow-500 text-white">Trial</Badge>
          case 'expired': return <Badge variant="destructive">Expired</Badge>
          default: return <Badge variant="secondary">Unknown</Badge>
      }
  }
  
  const getPerformanceIndicator = (score: number) => {
      if (score > 80) return <TrendingUp className="w-5 h-5 text-green-500" />
      if (score < 50) return <TrendingDown className="w-5 h-5 text-red-500" />
      return <Activity className="w-5 h-5 text-yellow-500" />
  }

  if (loading) {
    return (
      <DashboardLayout userRole="superadmin" userName="Super Admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="superadmin" userName="Super Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Platform-wide overview of all managed sites.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalSites || 0}</div>
              <p className="text-xs text-muted-foreground">+2 new this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalResidents.toLocaleString() || 0}</div>
               <p className="text-xs text-muted-foreground">Across all sites</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardData?.totalRevenue.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">This fiscal year</p>
            </CardContent>
          </Card>
        </div>

        {/* Sites Overview Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sites Overview</CardTitle>
            <CardDescription>Key performance indicators for each managed site.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="text-center">Residents</TableHead>
                  <TableHead className="text-center">Open Complaints</TableHead>
                   <TableHead className="text-center">Collection Rate</TableHead>
                   <TableHead className="text-center">Subscription</TableHead>
                  <TableHead className="text-center">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData?.sites.map((site) => (
                  <TableRow key={site._id}>
                    <TableCell>
                        <div className="font-medium">{site.name}</div>
                        <div className="text-xs text-muted-foreground">{site.address}</div>
                    </TableCell>
                    <TableCell>{site.adminName}</TableCell>
                    <TableCell className="text-center">{site.totalResidents}</TableCell>
                    <TableCell className="text-center">{site.openComplaints}</TableCell>
                    <TableCell className="text-center font-medium">{site.collectionRate}%</TableCell>
                    <TableCell className="text-center">{getSubscriptionStatusBadge(site.subscription.tier)}</TableCell>
                    <TableCell className="flex justify-center">
                        <div className="flex items-center gap-2">
                            {getPerformanceIndicator(site.performance)}
                            <span>{site.performance}%</span>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
