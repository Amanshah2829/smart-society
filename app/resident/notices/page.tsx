
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Megaphone, Calendar, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Announcement } from "@/backend/lib/types"

interface Notice extends Announcement {
  _id: string
}

export default function ResidentNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchNotices = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/resident/announcements")
      if (response.ok) {
        const data = await response.json()
        setNotices(data)
        setFilteredNotices(data)
      } else {
        toast({ variant: "destructive", title: "Failed to fetch notices" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching notices" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [])

  useEffect(() => {
    let filtered = notices

    if (searchTerm) {
      filtered = filtered.filter(
        (notice) =>
          notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((notice) => notice.category === categoryFilter)
    }

    setFilteredNotices(filtered)
  }, [notices, searchTerm, categoryFilter])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "emergency":
        return "bg-red-500"
      case "maintenance":
        return "bg-orange-500"
      case "event":
        return "bg-purple-500"
      case "general":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="resident" userName="John Resident">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  const urgentCount = notices.filter(n => n.category === 'emergency').length;

  return (
    <DashboardLayout userRole="resident" userName="John Resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notices & Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400">Stay updated with society announcements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notices.filter((n) => new Date(n.createdAt).getMonth() === new Date().getMonth()).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notices List */}
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <Card
              key={notice._id}
              className={notice.category === 'emergency' ? "border-red-200 bg-red-50 dark:bg-red-900/10" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {notice.category === 'emergency' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    <Badge className={`${getCategoryColor(notice.category)} text-white capitalize`}>
                      {notice.category}
                    </Badge>
                    <h3 className="text-lg font-semibold">{notice.title}</h3>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(notice.createdAt).toLocaleDateString()}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{notice.content}</p>
                {notice.expiryDate && (
                  <div className="text-sm text-gray-500">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Expires: {new Date(notice.expiryDate).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
