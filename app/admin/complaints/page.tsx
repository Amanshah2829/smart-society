
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Filter, Eye, MessageSquare } from "lucide-react"
import type { Complaint as ComplaintType } from "@/backend/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface Complaint extends ComplaintType {
  _id: string
  residentName?: string
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/complaints")
      if (response.ok) {
        const data = await response.json()
        setComplaints(data)
        setFilteredComplaints(data)
      } else {
        toast({ variant: "destructive", title: "Failed to fetch complaints" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching complaints" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  useEffect(() => {
    let filtered = complaints

    if (searchTerm) {
      filtered = filtered.filter(
        (complaint) =>
          complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.residentName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((complaint) => complaint.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((complaint) => complaint.priority === priorityFilter)
    }

    setFilteredComplaints(filtered)
  }, [complaints, searchTerm, statusFilter, priorityFilter])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 hover:bg-red-600"
      case "high":
        return "bg-orange-500 hover:bg-orange-600"
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "low":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500 hover:bg-blue-600"
      case "in-progress":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "resolved":
        return "bg-green-500 hover:bg-green-600"
      case "closed":
        return "bg-gray-500 hover:bg-gray-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const handleViewClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDialogOpen(true);
  }

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        toast({ title: "Status Updated", description: `Complaint status set to ${newStatus}.` })
        fetchComplaints() // Re-fetch to update the list
      } else {
        toast({ variant: "destructive", title: "Update Failed" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error updating status" })
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName="Admin User">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Complaints Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and track resident complaints</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search complaints..."
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Complaints ({filteredComplaints.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => (
                  <TableRow key={complaint._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{complaint.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{complaint.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{complaint.residentName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{complaint.flatNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {complaint.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPriorityColor(complaint.priority)} text-white capitalize`}>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <Select
                        value={complaint.status}
                        onValueChange={(value) => updateComplaintStatus(complaint._id, value)}
                      >
                         <SelectTrigger className={`w-36 border-0 ${getStatusColor(complaint.status)} text-white capitalize`}>
                           <SelectValue placeholder="Select Status" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="open">Open</SelectItem>
                           <SelectItem value="in-progress">In Progress</SelectItem>
                           <SelectItem value="resolved">Resolved</SelectItem>
                           <SelectItem value="closed">Closed</SelectItem>
                         </SelectContent>
                       </Select>
                    </TableCell>
                    <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleViewClick(complaint)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedComplaint?.title}</DialogTitle>
              <DialogDescription>Complaint details and management</DialogDescription>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Resident</Label>
                    <p className="font-medium">{selectedComplaint.residentName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{selectedComplaint.flatNumber}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p className="capitalize">{selectedComplaint.category}</p>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge
                      className={`${getPriorityColor(selectedComplaint.priority)} text-white capitalize`}
                    >
                      {selectedComplaint.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge
                      className={`${getStatusColor(selectedComplaint.status)} text-white capitalize`}
                    >
                      {selectedComplaint.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {selectedComplaint.description}
                  </p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p>{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p>{new Date(selectedComplaint.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}

    