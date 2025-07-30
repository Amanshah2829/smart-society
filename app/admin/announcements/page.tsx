
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Megaphone, Calendar, Users, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Announcement as AnnouncementType } from "@/backend/lib/types"

interface Announcement extends AnnouncementType {
  _id: string
}

const initialFormState = {
  title: "",
  content: "",
  category: "general" as Announcement["category"],
  targetRoles: ["resident"],
  isActive: true,
  expiryDate: "",
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/announcements")
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data)
      } else {
        toast({ variant: "destructive", title: "Failed to fetch announcements" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching announcements" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "emergency":
        return "bg-red-500 hover:bg-red-600"
      case "maintenance":
        return "bg-orange-500 hover:bg-orange-600"
      case "event":
        return "bg-purple-500 hover:bg-purple-600"
      case "general":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const handleFormSubmit = async () => {
    setIsSubmitting(true)
    try {
      const url = editingAnnouncement ? `/api/announcements/${editingAnnouncement._id}` : "/api/announcements"
      const method = editingAnnouncement ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: `Announcement ${editingAnnouncement ? "Updated" : "Created"}`,
          description: `The announcement has been successfully ${editingAnnouncement ? "updated" : "published"}.`,
        })
        setIsFormOpen(false)
        fetchAnnouncements() // Re-fetch to show the new/updated announcement
      } else {
        const errorData = await response.json()
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: errorData.message || "An error occurred.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreateForm = () => {
    setEditingAnnouncement(null)
    setFormData(initialFormState)
    setIsFormOpen(true)
  }

  const openEditForm = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      targetRoles: announcement.targetRoles,
      isActive: announcement.isActive,
      expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate).toISOString().slice(0, 16) : "",
    })
    setIsFormOpen(true)
  }

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return

    try {
      const response = await fetch(`/api/announcements/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({
          variant: "destructive",
          title: "Announcement Deleted",
          description: "The announcement has been removed.",
        })
        fetchAnnouncements()
      } else {
        toast({ variant: "destructive", title: "Deletion Failed" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error deleting announcement" })
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage society announcements and notices</p>
          </div>
          <Button onClick={openCreateForm}>
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? "Edit" : "Create"} Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={formData.title} onChange={handleInputChange} placeholder="Enter announcement title" />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" value={formData.content} onChange={handleInputChange} placeholder="Enter announcement content" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Audience</Label>
                   <Select
                    value={formData.targetRoles[0]}
                    onValueChange={(value) => handleSelectChange("targetRoles", [value])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resident">Residents</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                       <SelectItem value="accountant">Accountant</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input id="expiryDate" type="datetime-local" value={formData.expiryDate} onChange={handleInputChange} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))} />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <Button onClick={handleFormSubmit} className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAnnouncement ? "Update Announcement" : "Create Announcement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getCategoryColor(announcement.category)} text-white capitalize`}>
                      {announcement.category}
                    </Badge>
                    <h3 className="text-lg font-semibold">{announcement.title}</h3>
                    {!announcement.isActive && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditForm(announcement)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => deleteAnnouncement(announcement._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{announcement.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                    {announcement.expiryDate && (
                      <span className="ml-4">Expires: {new Date(announcement.expiryDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Author:</span> {announcement.authorId}
                  </div>
                  <div>
                    <span className="font-medium">Target:</span>{" "}
                    <span className="capitalize">{announcement.targetRoles.join(", ")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

    