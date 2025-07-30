
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
import { Plus, Search, Download, Eye, Send, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MaintenanceBill {
  _id: string
  flatNumber: string
  residentName: string
  amount: number
  month: string
  year: number
  dueDate: string
  status: "pending" | "paid" | "overdue" | "pending_confirmation"
  paymentDate?: string
}

const currentYear = new Date().getFullYear()
const initialGenerateState = {
  month: new Date().toLocaleString("default", { month: "long" }),
  year: currentYear.toString(),
  amount: "2500",
  dueDate: `${currentYear}-${(new Date().getMonth() + 2).toString().padStart(2, '0')}-10`,
}

export default function MaintenancePage() {
  const [bills, setBills] = useState<MaintenanceBill[]>([])
  const [filteredBills, setFilteredBills] = useState<MaintenanceBill[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [generateState, setGenerateState] = useState(initialGenerateState)
  const { toast } = useToast()

  const fetchBills = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bills")
      if (response.ok) {
        const data = await response.json()
        setBills(data)
        setFilteredBills(data)
      } else {
        toast({ variant: "destructive", title: "Failed to fetch bills" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching bills" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBills()
  }, [])

  useEffect(() => {
    let filtered = bills

    if (searchTerm) {
      filtered = filtered.filter(
        (bill) =>
          bill.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.residentName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((bill) => bill.status === statusFilter)
    }

    setFilteredBills(filtered)
  }, [bills, searchTerm, statusFilter])

  const handleGenerateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setGenerateState((prev) => ({ ...prev, [id]: value }))
  }

  const handleGenerateSelectChange = (value: string) => {
    setGenerateState((prev) => ({ ...prev, month: value }))
  }

  const handleGenerateBills = async () => {
    try {
      const response = await fetch("/api/bills/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: generateState.month,
          year: parseInt(generateState.year),
          amount: parseFloat(generateState.amount),
          dueDate: generateState.dueDate,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Bills Generated",
          description: `${result.count} bills have been successfully generated for ${generateState.month}.`,
        })
        setIsGenerateOpen(false)
        setGenerateState(initialGenerateState)
        fetchBills()
      } else {
        const errorData = await response.json()
        toast({ variant: "destructive", title: "Generation Failed", description: errorData.message })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error generating bills" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500 hover:bg-green-600"
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "overdue":
        return "bg-red-500 hover:bg-red-600"
      case "pending_confirmation":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maintenance Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage maintenance bills and payments</p>
          </div>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Generate Bills
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Monthly Bills</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select value={generateState.month} onValueChange={handleGenerateSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("default", { month: "long" })).map(
                        (month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" value={generateState.year} onChange={handleGenerateInputChange} />
                </div>
                <div>
                  <Label htmlFor="amount">Default Amount</Label>
                  <Input id="amount" type="number" value={generateState.amount} onChange={handleGenerateInputChange} />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" value={generateState.dueDate} onChange={handleGenerateInputChange} />
                </div>
                <Button onClick={handleGenerateBills} className="w-full">
                  Generate Bills for All Flats
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by flat or resident..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                   <SelectItem value="pending_confirmation">Pending Confirmation</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Bills ({filteredBills.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flat Number</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill._id}>
                    <TableCell className="font-medium">{bill.flatNumber}</TableCell>
                    <TableCell>{bill.residentName}</TableCell>
                    <TableCell>
                      {bill.month} {bill.year}
                    </TableCell>
                    <TableCell>₹{bill.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(bill.status)} text-white capitalize`}>
                        {bill.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
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
