
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, MessageSquare, Clock, CheckCircle, AlertTriangle, Eye, Sparkles, Loader2 } from "lucide-react"
import { categorizeComplaint } from "@/ai/flows/categorize-complaint-flow"
import { useToast } from "@/components/ui/use-toast"
import type { Complaint as ComplaintType } from "@/backend/lib/types"

interface Complaint extends ComplaintType {
  _id: string
  response?: string
}

const initialComplaintState = {
  title: "",
  description: "",
  category: "other",
  priority: "low",
}

export default function ResidentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newComplaint, setNewComplaint] = useState(initialComplaintState)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/resident/complaints")
      if (response.ok) {
        const data = await response.json()
        setComplaints(data)
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

  const handleAISuggest = async () => {
    if (!newComplaint.title || !newComplaint.description) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter a title and description before using AI suggest.",
      })
      return
    }
    setIsSuggesting(true)
    try {
      const result = await categorizeComplaint({
        title: newComplaint.title,
        description: newComplaint.description,
      })
      setNewComplaint((prev) => ({
        ...prev,
        category: result.category,
        priority: result.priority,
      }))
      toast({
        title: "AI Suggestion Applied",
        description: `Category set to "${result.category}" and priority to "${result.priority}".`,
      })
    } catch (error) {
      console.error("AI suggestion failed", error)
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: "Could not get AI suggestion. Please select manually.",
      })
    } finally {
      setIsSuggesting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewComplaint((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewComplaint((prev) => ({ ...prev, [name]: value }))
  }

  const handleViewClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setIsViewOpen(true)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="w-4 h-4 text-blue-500" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  const handleCreateComplaint = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComplaint),
      })
      if (response.ok) {
        toast({
          title: "Complaint Submitted",
          description: "Your complaint has been successfully submitted.",
        })
        setIsCreateOpen(false)
        setNewComplaint(initialComplaintState)
        fetchComplaints()
      } else {
        toast({ variant: "destructive", title: "Submission Failed" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error submitting complaint" })
    } finally {
      setIsSubmitting(false)
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

  return (
    <DashboardLayout userRole="resident" userName="John Resident">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Complaints</h1>
            <p className="text-gray-600 dark:text-gray-400">Track and manage your complaints</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit New Complaint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newComplaint.title}
                    onChange={handleInputChange}
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newComplaint.description}
                    onChange={handleInputChange}
                    placeholder="Detailed description of the problem"
                    rows={4}
                  />
                </div>

                <Button variant="outline" onClick={handleAISuggest} disabled={isSuggesting}>
                  {isSuggesting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  AI Suggest Category & Priority
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={newComplaint.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={newComplaint.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateComplaint} className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Complaint
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaints.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {complaints.filter((c) => c.status === "open").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {complaints.filter((c) => c.status === "in-progress").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {complaints.filter((c) => c.status === "resolved").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <Card key={complaint._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(complaint.status)}
                    <div>
                      <h3 className="text-lg font-semibold">{complaint.title}</h3>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getPriorityColor(complaint.priority)} text-white capitalize`}>
                      {complaint.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(complaint.status)} text-white capitalize`}>
                      {complaint.status}
                    </Badge>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleViewClick(complaint)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{complaint.description}</p>
                <div className="text-sm text-gray-500 flex justify-between">
                  <span className="capitalize">Category: {complaint.category}</span>
                  <span>Last updated: {new Date(complaint.updatedAt).toLocaleDateString()}</span>
                </div>
                {complaint.response && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Management Response:</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{complaint.response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedComplaint?.title}</DialogTitle>
              <DialogDescription>Details for your complaint.</DialogDescription>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-4 py-4">
                <p className="text-gray-600 dark:text-gray-400">{selectedComplaint.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <p className="capitalize font-medium">{selectedComplaint.category}</p>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <p>
                      <Badge className={`${getPriorityColor(selectedComplaint.priority)} text-white capitalize`}>
                        {selectedComplaint.priority}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p>
                      <Badge className={`${getStatusColor(selectedComplaint.status)} text-white capitalize`}>
                        {selectedComplaint.status}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Created: {new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                  <p>Last Updated: {new Date(selectedComplaint.updatedAt).toLocaleString()}</p>
                </div>
                {selectedComplaint.response && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Management Response:</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{selectedComplaint.response}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
