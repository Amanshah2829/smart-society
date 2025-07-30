
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, ArrowUpCircle, ArrowDownCircle, BookOpen, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ILedgerEntry } from "@/backend/models/LedgerEntry"

interface LedgerEntry extends ILedgerEntry {
  _id: string
}

const initialEntryState = {
  date: new Date().toISOString().split("T")[0],
  description: "",
  category: "maintenance_fee",
  type: "credit" as "credit" | "debit",
  amount: "",
}

export default function AccountantLedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEntry, setNewEntry] = useState<any>(initialEntryState)
  const { toast } = useToast()

  const fetchLedgerEntries = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ledger")
      if (response.ok) {
        const data = await response.json()
        setEntries(data.sort((a: LedgerEntry, b: LedgerEntry) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      } else {
        toast({ variant: "destructive", title: "Failed to fetch ledger entries" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching ledger entries" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLedgerEntries()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setNewEntry((prev: any) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewEntry((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleAddEntry = async () => {
    if (!newEntry.description || !newEntry.amount) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill out all required fields.",
      })
      return
    }

    try {
      const response = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEntry,
          amount: parseFloat(newEntry.amount),
        }),
      })

      if (response.ok) {
        toast({
          title: "Entry Added",
          description: "The new ledger entry has been recorded.",
        })
        setIsDialogOpen(false)
        setNewEntry(initialEntryState)
        fetchLedgerEntries()
      } else {
        toast({ variant: "destructive", title: "Failed to add entry" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error adding entry" })
    }
  }

  const totalCredits = entries.filter((e) => e.type === "credit").reduce((sum, e) => sum + e.amount, 0)
  const totalDebits = entries.filter((e) => e.type === "debit").reduce((sum, e) => sum + e.amount, 0)
  const balance = totalCredits - totalDebits

  let runningBalance = 0
  const entriesWithBalance = [...entries]
    .reverse()
    .map((entry) => {
      if (entry.type === "credit") {
        runningBalance += entry.amount
      } else {
        runningBalance -= entry.amount
      }
      return { ...entry, balance: runningBalance }
    })
    .reverse()

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Ledger</h1>
            <p className="text-gray-600 dark:text-gray-400">Track all society credits and debits</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Ledger Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={newEntry.date} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newEntry.description}
                    onChange={handleInputChange}
                    placeholder="e.g. Staff salaries for Feb"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={newEntry.type} onValueChange={(value) => handleSelectChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">Credit (Income)</SelectItem>
                        <SelectItem value="debit">Debit (Expense)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={newEntry.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance_fee">Maintenance Fee</SelectItem>
                        <SelectItem value="facility_booking">Facility Booking</SelectItem>
                        <SelectItem value="salaries">Salaries</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="repairs">Repairs</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newEntry.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                  />
                </div>
                <Button onClick={handleAddEntry} className="w-full">
                  Add Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{totalCredits.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{totalDebits.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{balance.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Ledger Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ledger Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entriesWithBalance.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{entry.description}</TableCell>
                    <TableCell className="capitalize">{entry.category.replace("_", " ")}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {entry.type === "credit" ? `₹${entry.amount.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {entry.type === "debit" ? `₹${entry.amount.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold">₹{entry.balance.toLocaleString()}</TableCell>
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
