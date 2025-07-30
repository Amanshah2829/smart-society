
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, UserCheck, Clock, Users, LogOut, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Visitor as VisitorType } from "@/backend/lib/types"

interface Visitor extends VisitorType {
  _id: string;
}

const initialVisitorState = {
  name: "",
  phone: "",
  purpose: "guest",
  flatNumber: "",
  vehicleNumber: "",
}

export default function SecurityVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [newVisitor, setNewVisitor] = useState(initialVisitorState)
  const { toast } = useToast()

  const fetchVisitors = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/visitors")
      if (response.ok) {
        const data = await response.json()
        setVisitors(data)
      } else {
        toast({ variant: "destructive", title: "Failed to fetch visitors" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching visitors" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisitors()
  }, [])

  useEffect(() => {
    let filtered = visitors

    if (searchTerm) {
      filtered = filtered.filter(
        (visitor) =>
          visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visitor.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visitor.phone.includes(searchTerm) ||
          (visitor.vehicleNumber && visitor.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((visitor) => visitor.status === statusFilter)
    }

    setFilteredVisitors(filtered)
  }, [visitors, searchTerm, statusFilter])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setNewVisitor((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string) => {
    setNewVisitor((prev) => ({ ...prev, purpose: value }))
  }

  const handleCheckOut = async (visitorId: string) => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/checkout`, { method: "PUT" })
      if (response.ok) {
        toast({ title: "Visitor Checked Out" })
        fetchVisitors()
      } else {
        toast({ variant: "destructive", title: "Checkout Failed" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error checking out visitor" })
    }
  }

  const handleLogVisitor = async () => {
    try {
      const response = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVisitor),
      })

      if (response.ok) {
        toast({ title: "Visitor Logged Successfully" })
        setIsLogOpen(false)
        setNewVisitor(initialVisitorState)
        fetchVisitors()
      } else {
        const errorData = await response.json()
        toast({ variant: "destructive", title: "Failed to log visitor", description: errorData.message })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error logging visitor" })
    }
  }

  const getStatusColor = (status: string) => {
    return status === "checked-in" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
  }

  const stats = {
    totalToday: visitors.filter(v => new Date(v.checkInTime).toDateString() === new Date().toDateString()).length,
    activeVisitors: visitors.filter((v) => v.status === "checked-in").length,
    checkedOutToday: visitors.filter(v => v.status === "checked-out" && v.checkOutTime && new Date(v.checkOutTime).toDateString() === new Date().toDateString()).length,
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visitor Log</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage visitor check-ins and check-outs</p>
          </div>
          <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Log New Visitor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log New Visitor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Visitor Name</Label>
                  <Input id="name" value={newVisitor.name} onChange={handleInputChange} placeholder="Enter visitor name" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={newVisitor.phone} onChange={handleInputChange} placeholder="Enter phone number" />
                </div>
                <div>
                  <Label>Purpose of Visit</Label>
                  <Select value={newVisitor.purpose} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest">Guest Visit</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="service">Service Provider</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="flatNumber">Flat Number</Label>
                  <Input id="flatNumber" value={newVisitor.flatNumber} onChange={handleInputChange} placeholder="e.g., A-101" />
                </div>
                <div>
                  <Label htmlFor="vehicleNumber">Vehicle Number (Optional)</Label>
                  <Input
                    id="vehicleNumber"
                    value={newVisitor.vehicleNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., MH01AB1234"
                  />
                </div>
                <Button onClick={handleLogVisitor} className="w-full">
                  Log Visitor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Inside</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeVisitors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checked Out Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.checkedOutToday}</div>
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
                  placeholder="Search by name, flat, phone, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="checked-in">Checked In</SelectItem>
                  <SelectItem value="checked-out">Checked Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Visitors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Log ({filteredVisitors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor Details</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <TableRow key={visitor._id}>
                    <TableCell className="font-medium">
                      <p>{visitor.name}</p>
                      <p className="text-xs text-muted-foreground">{visitor.phone}</p>
                      {visitor.vehicleNumber && (
                        <p className="text-xs text-muted-foreground">Vehicle: {visitor.vehicleNumber}</p>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{visitor.purpose}</TableCell>
                    <TableCell>{visitor.flatNumber}</TableCell>
                    <TableCell>{new Date(visitor.checkInTime).toLocaleString()}</TableCell>
                    <TableCell>
                      {visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(visitor.status)} text-white capitalize`}>
                        {visitor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {visitor.status === "checked-in" && (
                        <Button variant="outline" size="sm" onClick={() => handleCheckOut(visitor._id)}>
                          <LogOut className="w-4 h-4 mr-1" />
                          Check Out
                        </Button>
                      )}
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
