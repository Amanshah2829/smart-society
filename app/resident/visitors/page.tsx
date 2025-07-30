
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Users, Clock, CheckCircle, Loader2, Plus, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Visitor as VisitorType } from "@/backend/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface Visitor extends VisitorType {
  _id: string;
}

const initialVisitorState = {
  name: "",
  phone: "",
  purpose: "guest",
  flatNumber: "",
  vehicleNumber: "",
};


export default function ResidentVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [isPreApproveOpen, setIsPreApproveOpen] = useState(false);
  const [newVisitor, setNewVisitor] = useState(initialVisitorState);


  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/resident/visitors');
      if (response.ok) {
        const data = await response.json();
        setVisitors(data);
        setFilteredVisitors(data);
      } else {
        toast({ variant: 'destructive', title: 'Failed to fetch visitors' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error fetching visitors' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVisitors()
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewVisitor(prev => ({ ...prev, [id]: value }));
  }

  const handlePreApproveVisitor = async () => {
    if (!newVisitor.name || !newVisitor.phone || !newVisitor.purpose) {
        toast({ variant: 'destructive', title: 'Please fill all required fields.'});
        return;
    }
    try {
        const response = await fetch('/api/visitors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newVisitor),
        });
        if (response.ok) {
            toast({ title: 'Visitor Pre-approved', description: `${newVisitor.name} has been added to the pre-approved list.` });
            setIsPreApproveOpen(false);
            setNewVisitor(initialVisitorState);
            fetchVisitors();
        } else {
             toast({ variant: 'destructive', title: 'Failed to pre-approve visitor' });
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error pre-approving visitor' });
    }
  }


  useEffect(() => {
    let filtered = visitors

    if (searchTerm) {
      filtered = filtered.filter(
        (visitor) =>
          visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visitor.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredVisitors(filtered)
  }, [visitors, searchTerm])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in': return 'bg-green-500';
      case 'pre-approved': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  const stats = {
    totalVisitors: visitors.length,
    activeVisitors: visitors.filter((v) => v.status === "checked-in").length,
    checkedOut: visitors.filter((v) => v.status === "checked-out").length,
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Visitors</h1>
              <p className="text-gray-600 dark:text-gray-400">View your visitor history and pre-approve guests.</p>
            </div>
            <Dialog open={isPreApproveOpen} onOpenChange={setIsPreApproveOpen}>
                <DialogTrigger asChild>
                    <Button><UserPlus className="w-4 h-4 mr-2" /> Pre-approve Visitor</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pre-approve a Visitor</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="name">Visitor Name</Label>
                            <Input id="name" value={newVisitor.name} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={newVisitor.phone} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="purpose">Purpose of Visit</Label>
                            <Input id="purpose" value={newVisitor.purpose} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="vehicleNumber">Vehicle Number (Optional)</Label>
                            <Input id="vehicleNumber" value={newVisitor.vehicleNumber} onChange={handleInputChange} />
                        </div>
                        <Button onClick={handlePreApproveVisitor} className="w-full">Add to Pre-approved List</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVisitors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Inside</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeVisitors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.checkedOut}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
                  <TableHead>Visitor Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <TableRow key={visitor._id}>
                    <TableCell className="font-medium">{visitor.name}</TableCell>
                    <TableCell>{visitor.purpose}</TableCell>
                    <TableCell>{new Date(visitor.checkInTime).toLocaleString()}</TableCell>
                    <TableCell>
                      {visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(visitor.status)} text-white capitalize`}>
                        {visitor.status.replace('_', ' ')}
                      </Badge>
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
