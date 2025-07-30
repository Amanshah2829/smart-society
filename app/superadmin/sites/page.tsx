
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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Site } from "@/backend/models/Site"

interface SiteData extends Site {
  _id: string
}

const initialFormState: Omit<SiteData, '_id' | 'createdAt' | 'updatedAt' | 'subscription'> & { subscriptionTier: 'trial' | 'active' | 'expired', subscriptionFee: number, subscriptionEndDate: string } = {
  name: "",
  address: "",
  totalBlocks: 1,
  floorsPerBlock: 10,
  unitsPerFloor: 4,
  adminName: "",
  adminEmail: "",
  subscriptionTier: 'trial',
  subscriptionFee: 0,
  subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0], // Default trial 3 months
};


export default function SuperAdminSitesPage() {
  const [sites, setSites] = useState<SiteData[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<SiteData | null>(null)
  const [formData, setFormData] = useState<any>(initialFormState)
  const { toast } = useToast()

  const fetchSites = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/superadmin/sites")
      if (response.ok) {
        setSites(await response.json())
      } else {
        toast({ variant: "destructive", title: "Failed to fetch sites" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching sites" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSites()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target
    setFormData((prev:any) => ({ ...prev, [id]: type === 'number' ? Number(value) : value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }
  
  const openCreateForm = () => {
    setEditingSite(null)
    setFormData(initialFormState)
    setIsFormOpen(true)
  }

  const openEditForm = (site: SiteData) => {
    setEditingSite(site)
    setFormData({
        name: site.name,
        address: site.address,
        totalBlocks: site.totalBlocks,
        floorsPerBlock: site.floorsPerBlock,
        unitsPerFloor: site.unitsPerFloor,
        adminName: site.adminName,
        adminEmail: site.adminEmail,
        subscriptionTier: site.subscription.tier,
        subscriptionFee: site.subscription.fee,
        subscriptionEndDate: new Date(site.subscription.endDate).toISOString().split('T')[0],
    })
    setIsFormOpen(true)
  }

  const handleFormSubmit = async () => {
    try {
      const url = editingSite ? `/api/superadmin/sites/${editingSite._id}` : '/api/superadmin/sites';
      const method = editingSite ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: `Site ${editingSite ? "Updated" : "Created"}`, description: `The site has been successfully ${editingSite ? "updated" : "created"}.` });
        setIsFormOpen(false);
        fetchSites();
      } else {
        const errorData = await response.json();
        toast({ variant: "destructive", title: "Operation Failed", description: errorData.message });
      }

    } catch (error) {
      toast({ variant: 'destructive', title: 'An error occurred' });
    }
  }
  
  const handleDelete = async (siteId: string) => {
    if (!confirm("Are you sure you want to delete this site? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch(`/api/superadmin/sites/${siteId}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ variant: 'destructive', title: 'Site Deleted', description: 'The site has been removed.' });
        fetchSites();
      } else {
        toast({ variant: 'destructive', title: 'Deletion Failed' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error deleting site' });
    }
  };
  
  const getSubscriptionStatusBadge = (status: 'trial' | 'active' | 'expired') => {
      switch (status) {
          case 'active': return <Badge className="bg-green-500 text-white">Active</Badge>
          case 'trial': return <Badge className="bg-yellow-500 text-white">Trial</Badge>
          case 'expired': return <Badge variant="destructive">Expired</Badge>
          default: return <Badge variant="secondary">Unknown</Badge>
      }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Site Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all society sites on the platform.</p>
          </div>
           <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
               <Button onClick={openCreateForm}>
                <Plus className="w-4 h-4 mr-2" />
                New Site
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingSite ? "Edit" : "Create New"} Site</DialogTitle>
                <DialogDescription>Fill in the details for the society site.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  {/* Site Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Site Information</h3>
                    <div>
                        <Label htmlFor="name">Site Name</Label>
                        <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Prestige Falcon City" />
                    </div>
                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={formData.address} onChange={handleInputChange} placeholder="Full address of the site" />
                    </div>
                     <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label htmlFor="totalBlocks">Blocks</Label>
                            <Input id="totalBlocks" type="number" value={formData.totalBlocks} onChange={handleInputChange} />
                        </div>
                         <div>
                            <Label htmlFor="floorsPerBlock">Floors/Block</Label>
                            <Input id="floorsPerBlock" type="number" value={formData.floorsPerBlock} onChange={handleInputChange} />
                        </div>
                         <div>
                            <Label htmlFor="unitsPerFloor">Units/Floor</Label>
                            <Input id="unitsPerFloor" type="number" value={formData.unitsPerFloor} onChange={handleInputChange} />
                        </div>
                    </div>
                  </div>
                  {/* Admin & Subscription */}
                  <div className="space-y-4">
                     <h3 className="font-semibold text-lg border-b pb-2">Admin & Subscription</h3>
                     <div>
                        <Label htmlFor="adminName">Admin Name</Label>
                        <Input id="adminName" value={formData.adminName} onChange={handleInputChange} placeholder="Name of the main admin" />
                    </div>
                     <div>
                        <Label htmlFor="adminEmail">Admin Email</Label>
                        <Input id="adminEmail" type="email" value={formData.adminEmail} onChange={handleInputChange} placeholder="Admin's login email" disabled={!!editingSite} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                            <Select value={formData.subscriptionTier} onValueChange={(value) => handleSelectChange('subscriptionTier', value)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="trial">Trial</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="subscriptionFee">Fee (Yearly)</Label>
                            <Input id="subscriptionFee" type="number" value={formData.subscriptionFee} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="subscriptionEndDate">Subscription End Date</Label>
                        <Input id="subscriptionEndDate" type="date" value={formData.subscriptionEndDate} onChange={handleInputChange} />
                    </div>
                  </div>
              </div>
              <div className="flex justify-end pt-4">
                 <Button onClick={handleFormSubmit}>
                    {editingSite ? 'Save Changes' : 'Create Site'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Managed Sites ({sites.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Expires On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site._id}>
                    <TableCell className="font-medium">{site.name}</TableCell>
                    <TableCell>{site.address}</TableCell>
                    <TableCell>{site.totalBlocks * site.floorsPerBlock * site.unitsPerFloor}</TableCell>
                    <TableCell>
                        <div>{site.adminName}</div>
                        <div className="text-xs text-muted-foreground">{site.adminEmail}</div>
                    </TableCell>
                    <TableCell>
                        {getSubscriptionStatusBadge(site.subscription.tier)}
                    </TableCell>
                    <TableCell>{new Date(site.subscription.endDate).toLocaleDateString()}</TableCell>
                    <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditForm(site)}><Edit className="h-4 w-4"/></Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(site._id)}><Trash2 className="h-4 w-4"/></Button>
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
