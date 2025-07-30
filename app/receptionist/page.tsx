
"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, MessageSquare, Phone, Loader2 } from "lucide-react"

interface ReceptionistDashboard {
  activeVisitors: number
  totalToday: number
  openComplaints: number
  upcomingVisitors: Array<{
    _id: string
    name: string
    flatNumber: string
    eta: string
  }>
}

export default function ReceptionistDashboard() {
  const [data, setData] = useState<ReceptionistDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/receptionist/dashboard")
        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        } else {
          console.error("Failed to fetch receptionist dashboard data")
        }
      } catch (error) {
        console.error("Error fetching receptionist dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout userRole="receptionist" userName="Receptionist">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="receptionist" userName="Receptionist">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Receptionist Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Front desk operations at a glance</p>
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
              <p className="text-xs text-muted-foreground">Currently inside</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visitors Today</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalToday || 0}</div>
              <p className="text-xs text-muted-foreground">Check-ins today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.openComplaints || 0}</div>
              <p className="text-xs text-muted-foreground">Forwards to admin</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Visitors */}
        <Card>
          <CardHeader>
            <CardTitle>Pre-approved Visitors</CardTitle>
            <CardDescription>Upcoming guest entries for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.upcomingVisitors && data.upcomingVisitors.length > 0 ? (
                data.upcomingVisitors.map((visitor) => (
                  <div
                    key={visitor._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{visitor.name}</p>
                      <p className="text-sm text-gray-500">Visiting Flat {visitor.flatNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">ETA: {visitor.eta}</p>
                      <Button variant="outline" size="sm" className="mt-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Notify Resident
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No pre-approved visitors for today.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
