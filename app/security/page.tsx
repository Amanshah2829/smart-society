
"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Clock, CheckCircle, AlertTriangle, UserCheck, Loader2 } from "lucide-react"

interface SecurityDashboard {
  activeVisitors: number
  todayVisitors: number
  pendingApprovals: number
  recentVisitors: Array<{
    _id: string
    name: string
    flatNumber: string
    purpose: string
    checkInTime: string
    status: string
  }>
}

export default function SecurityDashboard() {
  const [data, setData] = useState<SecurityDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/security/dashboard")
        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        } else {
          console.error("Failed to fetch security dashboard data")
        }
      } catch (error) {
        console.error("Error fetching security dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked-in":
        return "bg-green-500"
      case "checked-out":
        return "bg-gray-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "checked-in":
        return <UserCheck className="w-4 h-4" />
      case "checked-out":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="security" userName="Security Guard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="security" userName="Security Guard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor visitor activity and manage security</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{data?.activeVisitors || 0}</div>
              <p className="text-xs text-muted-foreground">Currently in building</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.todayVisitors || 0}</div>
              <p className="text-xs text-muted-foreground">Total check-ins today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{data?.pendingApprovals || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Visitors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Visitor Activity
              <Button>
                <UserCheck className="w-4 h-4 mr-2" />
                Log New Visitor
              </Button>
            </CardTitle>
            <CardDescription>Latest visitor check-ins and check-outs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentVisitors.map((visitor) => (
                <div
                  key={visitor._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(visitor.status)}
                    <div>
                      <p className="font-medium">{visitor.name}</p>
                      <p className="text-sm text-gray-500">
                        {visitor.purpose} • Flat {visitor.flatNumber}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(visitor.checkInTime).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(visitor.status)} text-white`}>{visitor.status}</Badge>
                    {visitor.status === "checked-in" && (
                      <Button variant="outline" size="sm">
                        Check Out
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
