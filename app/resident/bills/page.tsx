
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, CreditCard, Eye, Calendar, DollarSign, AlertCircle, Loader2, QrCode, Banknote, Copy, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { IMaintenanceBill } from "@/backend/models/MaintenanceBill"
import Image from "next/image"

interface Bill extends IMaintenanceBill {
  _id: string
}

type PaymentStep = 'select_method' | 'show_qr' | 'show_cash_info' | 'card_details' | 'confirm_card';
type DialogState = {
    type: 'none' | 'pay' | 'view';
    bill: Bill | null;
};

export default function ResidentBillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogState, setDialogState] = useState<DialogState>({ type: 'none', bill: null });
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('select_method');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const { toast } = useToast()

  const fetchBills = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/resident/bills")
      if (response.ok) {
        const data = await response.json()
        setBills(data)
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
  
  const openPaymentDialog = (bill: Bill) => {
    setDialogState({ type: 'pay', bill });
    setPaymentStep('select_method'); 
    setCardDetails({ number: '', expiry: '', cvc: '' });
  }

   const openViewDialog = (bill: Bill) => {
    setDialogState({ type: 'view', bill });
  }

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      setDialogState({ type: 'none', bill: null });
    }
  }

  const handlePayment = async (method: "card" | "upi" | "cash") => {
    if (!dialogState.bill) return;

    try {
      const response = await fetch(`/api/bills/${dialogState.bill._id}/pay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: method }),
      })

      if (response.ok) {
        toast({
          title: "Payment Processing",
          description: `Your payment of ₹${dialogState.bill?.amount.toLocaleString()} has been submitted.`,
        })
        fetchBills()
        setDialogState({ type: 'none', bill: null });
      } else {
        toast({ variant: "destructive", title: "Payment Failed" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error during payment" })
    }
  }
  
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCardDetails(prev => ({ ...prev, [id]: value }));
  }

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard' });
    } else {
        toast({ variant: 'destructive', title: 'Clipboard not available' });
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
  
  const handleDownloadBill = (bill: Bill | null) => {
    if (!bill) return;
    toast({
        title: "Downloading Bill...",
        description: `Your bill for ${bill.month} ${bill.year} is being downloaded.`
    });
  }

  const totalPending = bills
    .filter((b) => ["pending", "overdue"].includes(b.status))
    .reduce((sum, b) => sum + b.amount, 0)
  const overdueCount = bills.filter((b) => b.status === "overdue").length

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bills</h1>
            <p className="text-gray-600 dark:text-gray-400">Maintenance bills and payments</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalPending.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {bills.filter((b) => ["pending", "overdue"].includes(b.status)).length} unpaid bills
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Bills</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <p className="text-xs text-muted-foreground">Requires immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Year</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹
                {bills
                  .filter((b) => b.year === new Date().getFullYear() && b.status === "paid")
                  .reduce((sum, b) => sum + b.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total paid for {new Date().getFullYear()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bills Table */}
        <Dialog open={dialogState.type !== 'none'} onOpenChange={handleDialogChange}>
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Details</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill._id}>
                      <TableCell className="font-medium">
                        {bill.month} {bill.year}
                      </TableCell>
                      <TableCell>₹{bill.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(bill.status)} text-white capitalize`}>
                          {bill.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString() : "-"}
                        {bill.paymentMethod && <p className="text-xs text-muted-foreground capitalize">Via {bill.paymentMethod}</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openViewDialog(bill)}>
                                <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDownloadBill(bill)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          {(bill.status === "pending" || bill.status === "overdue") && (
                             <DialogTrigger asChild>
                              <Button size="sm" onClick={() => openPaymentDialog(bill)}>
                                <CreditCard className="w-4 h-4 mr-1" />
                                Pay Now
                              </Button>
                            </DialogTrigger>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
           <DialogContent>
            {dialogState.type === 'pay' && dialogState.bill && (
                <>
                    <DialogHeader>
                      <DialogTitle>
                        Pay Bill: {dialogState.bill.month} {dialogState.bill.year}
                      </DialogTitle>
                      <DialogDescription>
                        Amount to pay: ₹{dialogState.bill.amount.toLocaleString()}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {paymentStep !== 'select_method' && (
                      <Button variant="ghost" size="sm" className="absolute left-4 top-4" onClick={() => setPaymentStep('select_method')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                    )}

                    {paymentStep === 'select_method' && (
                        <div className="py-4 space-y-4">
                          <h3 className="font-medium text-center">Select Payment Method</h3>
                          <Button className="w-full justify-start" onClick={() => setPaymentStep("card_details")}>
                              <CreditCard className="w-4 h-4 mr-2"/> Pay with Card
                          </Button>
                          <Button className="w-full justify-start" onClick={() => setPaymentStep("show_qr")}>
                              <QrCode className="w-4 h-4 mr-2"/> Pay with UPI
                          </Button>
                          <Button className="w-full justify-start" onClick={() => setPaymentStep("show_cash_info")}>
                              <Banknote className="w-4 h-4 mr-2"/> Pay with Cash
                          </Button>
                        </div>
                    )}
                    
                    {paymentStep === 'card_details' && (
                        <div className="py-4 space-y-4">
                            <h3 className="font-medium text-center">Enter Card Details</h3>
                            <div className="space-y-2">
                                <Label htmlFor="number">Card Number</Label>
                                <Input id="number" value={cardDetails.number} onChange={handleCardInputChange} placeholder="**** **** **** ****"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <Label htmlFor="expiry">Expiry Date</Label>
                                  <Input id="expiry" value={cardDetails.expiry} onChange={handleCardInputChange} placeholder="MM/YY"/>
                               </div>
                               <div className="space-y-2">
                                   <Label htmlFor="cvc">CVC</Label>
                                   <Input id="cvc" value={cardDetails.cvc} onChange={handleCardInputChange} placeholder="***"/>
                               </div>
                            </div>
                            <Button className="w-full" onClick={() => handlePayment("card")}>
                                Pay ₹{dialogState.bill.amount.toLocaleString()}
                            </Button>
                        </div>
                    )}

                    {paymentStep === 'show_qr' && (
                      <div className="py-4 space-y-4 text-center">
                          <h3 className="font-medium">Scan to Pay with UPI</h3>
                          <div className="flex justify-center">
                               <Image src="https://placehold.co/256x256.png" alt="UPI QR Code" width={256} height={256} data-ai-hint="QR code"/>
                          </div>
                          <div className="relative">
                            <Input readOnly value="society-upi-id@okhdfcbank" className="pr-10 text-center" />
                            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => copyToClipboard('society-upi-id@okhdfcbank')}>
                              <Copy className="w-4 h-4"/>
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">After completing the payment, click the button below.</p>
                          <Button className="w-full" onClick={() => handlePayment( "upi")}>I have paid</Button>
                      </div>
                    )}
                    
                     {paymentStep === 'show_cash_info' && (
                      <div className="py-4 space-y-4 text-center">
                          <h3 className="font-medium">Pay with Cash</h3>
                          <p className="text-sm text-muted-foreground">Please pay the amount at the society office and show this code to the accountant.</p>
                           <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Your Transaction Code</p>
                            <p className="text-2xl font-bold tracking-widest">CASH-{dialogState.bill.flatNumber?.replace('-', '')}-{dialogState.bill.month.slice(0,3).toUpperCase()}</p>
                          </div>
                          <Button className="w-full" onClick={() => handlePayment("cash")}>I will pay at the office</Button>
                      </div>
                    )}
                </>
            )}
             {dialogState.type === 'view' && dialogState.bill && (
                <>
                    <DialogHeader>
                        <DialogTitle>Bill Details</DialogTitle>
                        <DialogDescription>{dialogState.bill.month} {dialogState.bill.year}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                         <div className="border rounded-lg p-4 space-y-2">
                             <div className="flex justify-between items-center">
                                 <span className="text-muted-foreground">Maintenance Fee</span>
                                 <span>₹{dialogState.bill.amount.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-muted-foreground">Late Fee</span>
                                 <span>₹0.00</span>
                             </div>
                             <div className="border-t my-2"></div>
                             <div className="flex justify-between items-center font-bold text-lg">
                                 <span>Total</span>
                                 <span>₹{dialogState.bill.amount.toLocaleString()}</span>
                             </div>
                         </div>
                         <div className="text-xs text-muted-foreground space-y-1">
                             <p>Bill ID: {dialogState.bill._id}</p>
                             <p>Due Date: {new Date(dialogState.bill.dueDate).toLocaleDateString()}</p>
                             <div className="flex items-center gap-2">
                                <span>Status:</span>
                                <Badge className={`${getStatusColor(dialogState.bill.status)} text-white capitalize`}>{dialogState.bill.status.replace("_", " ")}</Badge>
                             </div>
                         </div>
                        <Button onClick={() => handleDownloadBill(dialogState.bill)} className="w-full">
                           <Download className="w-4 h-4 mr-2" /> Download Bill
                        </Button>
                    </div>
                </>
            )}
          </DialogContent>
        </Dialog>


        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bills
                .filter((b) => b.status === "paid")
                .slice(0, 3)
                .map((bill) => (
                  <div
                    key={bill._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {bill.month} {bill.year}
                        </p>
                        <p className="text-sm text-gray-500">Payment ID: {bill.paymentId || "N/A"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">₹{bill.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {bill.paymentDate && new Date(bill.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
