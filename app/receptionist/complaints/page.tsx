
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Complaint as ComplaintType } from "@/backend/lib/types"

interface Complaint extends ComplaintType {
  _id: string
  residentName: string
}

export default function ReceptionistComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [searchTerm, setSearchTerm] = useState("")
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
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.flatNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredComplaints(filtered)
  }, [complaints, searchTerm])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500"
      case "in-progress":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">View Complaints</h1>
          <p className="text-gray-600 dark:text-gray-400">View all resident complaints</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by title or flat number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Complaints Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => (
                  <TableRow key={complaint._id}>
                    <TableCell className="font-medium">{complaint.title}</TableCell>
                    <TableCell>
                      {complaint.residentName} ({complaint.flatNumber})
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPriorityColor(complaint.priority)} text-white capitalize`}>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(complaint.status)} text-white capitalize`}>
                        {complaint.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
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
