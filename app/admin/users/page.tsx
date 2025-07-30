"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Loader2, UserPlus, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { User } from "@/backend/lib/types"

interface UserData extends User {
  _id: string
}

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  flatNumber: "",
  role: "resident",
  residencyType: "owner",
  dateOfBirth: "",
  aadhaar: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  password: ""
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState<any>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        setUsers(await response.json())
      } else {
        toast({ variant: "destructive", title: "Failed to fetch users" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching users" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev: any) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const openCreateForm = () => {
    setEditingUser(null)
    setFormData(initialFormState)
    setIsFormOpen(true)
  }
  
  const openEditForm = (user: UserData) => {
    setEditingUser(user);
    setFormData({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        flatNumber: user.flatNumber,
        residencyType: user.residencyType,
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        aadhaar: (user as any).aadhaar || "",
        emergencyContactName: (user as any).emergencyContactName || "",
        emergencyContactPhone: (user as any).emergencyContactPhone || "",
        password: "" // Clear password for edit form
    });
    setIsFormOpen(true);
  }

  const handleFormSubmit = async () => {
    setIsSubmitting(true)
    try {
      const url = editingUser ? `/api/admin/users/${editingUser._id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: `Resident ${editingUser ? "Updated" : "Added"}`, description: `${formData.name}'s details have been saved.` });
        setIsFormOpen(false);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({ variant: "destructive", title: "Operation Failed", description: errorData.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'An error occurred' });
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName="Admin User">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Add, view, and manage society residents and staff.</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateForm}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Resident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Edit User" : "Add New Resident"}</DialogTitle>
                <DialogDescription>
                  {editingUser ? "Update the resident's details below." : "Set an initial password for the new resident."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Enter full name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Enter 10-digit mobile number" />
                  </div>
                   <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
                  </div>
                   <div>
                    <Label htmlFor="aadhaar">Aadhaar Number (Optional)</Label>
                    <Input id="aadhaar" value={formData.aadhaar || ''} onChange={handleInputChange} placeholder="Enter 12-digit Aadhaar number" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Society & Contact Details</h3>
                  <div>
                    <Label htmlFor="flatNumber">Flat / House Number</Label>
                    <Input id="flatNumber" value={formData.flatNumber} onChange={handleInputChange} placeholder="e.g., A-101" />
                  </div>
                  <div>
                    <Label>Residency Type</Label>
                    <Select value={formData.residencyType} onValueChange={(value) => handleSelectChange("residencyType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="tenant">Tenant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div>
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder={editingUser ? "Enter new password (optional)" : "Set initial password"} />
                    </div>
                  <div>
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input id="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleInputChange} placeholder="Name of emergency contact" />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input id="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone || ''} onChange={handleInputChange} placeholder="Phone of emergency contact" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleFormSubmit} disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingUser ? 'Save Changes' : 'Add Resident'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User List ({users.length})</CardTitle>
            <CardDescription>Directory of all individuals with access to the system.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search by name, email, or flat..." className="pl-10" />
              </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.flatNumber || "N/A"}</div>
                    </TableCell>
                    <TableCell>
                      <div>{user.email}</div>
                      <div className="text-xs text-muted-foreground">{user.phone}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{user.role}</Badge></TableCell>
                    <TableCell>
                      <Badge className={'bg-green-500 text-white'}>
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditForm(user)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
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
