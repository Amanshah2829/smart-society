
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, FileText, Banknote, Receipt, Check, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MaintenanceBillModel } from "@/backend/models/MaintenanceBill"

type Transaction = {
  _id: string
  flatNumber: string
  residentName: string
  amount: number
  type: "maintenance_fee" | "late_fee" | "facility_booking" | "other"
  date: string
  status: "completed" | "pending" | "failed" | "pending_confirmation"
  paymentMethod?: "card" | "upi" | "cash"
}

export default function AccountantBillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bills")
      if (response.ok) {
        const data = await response.json()
        const formattedData = data.map((bill: any) => ({
          ...bill,
          id: bill._id,
          date: bill.createdAt,
          type: "maintenance_fee", // Assuming all bills are maintenance fees for now
        }))
        setTransactions(formattedData)
        setFilteredTransactions(formattedData)
      } else {
        toast({ variant: "destructive", title: "Failed to fetch transactions" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching transactions" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.residentName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, statusFilter])

  const approvePayment = async (id: string) => {
    try {
      const response = await fetch(`/api/bills/${id}/approve`, { method: "PUT" })
      if (response.ok) {
        toast({
          title: "Payment Approved",
          description: "The payment has been marked as completed.",
        })
        fetchTransactions()
      } else {
        toast({ variant: "destructive", title: "Failed to approve payment" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error approving payment" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600"
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "failed":
        return "bg-red-500 hover:bg-red-600"
      case "pending_confirmation":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="accountant" userName="Accountant">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="accountant" userName="Accountant">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
          <p className="text-gray-600 dark:text-gray-400">Track all financial transactions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue (This Month)</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹
                {transactions
                  .filter((t) => t.status === "completed" && new Date(t.date).getMonth() === new Date().getMonth())
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {transactions.filter((t) => t.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {transactions.filter((t) => t.status === "pending_confirmation").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="pending_confirmation">Pending Confirmation</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Transactions
            </Button>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-mono text-xs">TXN-{t._id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell>
                      <div className="font-medium">{t.residentName}</div>
                      <div className="text-xs text-muted-foreground">{t.flatNumber}</div>
                    </TableCell>
                    <TableCell className="capitalize">{t.type.replace("_", " ")}</TableCell>
                    <TableCell>₹{t.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(t.status)} text-white capitalize`}>
                        {t.status.replace("_", " ")}
                      </Badge>
                      {t.paymentMethod && (
                        <div className="text-xs text-muted-foreground capitalize mt-1">Via {t.paymentMethod}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {t.status === "pending_confirmation" && (
                        <Button size="sm" onClick={() => approvePayment(t._id)}>
                          <Check className="w-4 h-4 mr-2" />
                          Approve
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
