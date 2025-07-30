
"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  MessageSquare,
  Users,
  Megaphone,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  QrCode,
  Banknote,
  Copy,
  ArrowLeft,
  Eye,
  UserCheck,
  UserX
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { IMaintenanceBill } from "@/backend/models/MaintenanceBill"
import Link from "next/link"
import { ICommunityPost } from "@/backend/models/CommunityPost"
import { Visitor } from "@/backend/lib/types"

interface Bill extends IMaintenanceBill {
  _id: string;
}

interface CommunityEvent extends ICommunityPost {
  _id: string;
  authorName: string;
}

interface ResidentDashboard {
  pendingBills: Bill[]
  myComplaints: Array<{
    _id: string
    title: string
    status: string
    priority: string
    createdAt: string
  }>
  recentVisitors: Visitor[]
  announcements: Array<{
    _id: string
    title: string
    category: string
    createdAt: string
  }>
  communityEvents: CommunityEvent[]
  pendingVisitorApprovals: Visitor[]
}

type PaymentStep = 'select_method' | 'show_qr' | 'show_cash_info' | 'card_details';
type DialogState = {
    type: 'none' | 'pay' | 'view';
    bill: Bill | null;
};

function CommunityEvents({ events }: { events: CommunityEvent[] }) {
    if (!events || events.length === 0) {
        return null;
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Community Events</CardTitle>
                <CardDescription>Get involved in society activities!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {events.map(event => (
                    <div key={event._id} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                        <div>
                            <p className="font-semibold text-purple-800 dark:text-purple-200">{event.content}</p>
                            <p className="text-sm text-purple-600 dark:text-purple-400">
                                {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'Date TBD'} &bull; by {event.authorName}
                            </p>
                        </div>
                        <Link href="/resident/community">
                            <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function ResidentDashboard() {
  const [data, setData] = useState<ResidentDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogState, setDialogState] = useState<DialogState>({ type: 'none', bill: null });
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('select_method')
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' })
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/resident/dashboard")
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      } else {
        console.error("Failed to fetch resident dashboard data")
      }
    } catch (error) {
      console.error("Error fetching resident dashboard data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
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
  
  const handleVisitorApproval = async (visitorId: string, action: 'approve' | 'reject') => {
    try {
        const response = await fetch(`/api/visitors/${visitorId}/${action}`, { method: 'PUT' });
        if (response.ok) {
            toast({ title: `Visitor ${action}d`, description: `The visitor has been ${action}d.`});
            fetchDashboardData();
        } else {
            toast({ variant: 'destructive', title: 'Action Failed' });
        }
    } catch (error) {
         toast({ variant: 'destructive', title: 'Error performing action' });
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
        fetchDashboardData() // Refetch data to update dashboard
        setDialogState({ type: 'none', bill: null }); // Close dialog
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

  const handleDownloadBill = (bill: Bill | null) => {
    if (!bill) return;
    toast({
        title: "Downloading Bill...",
        description: `Your bill for ${bill.month} ${bill.year} is being downloaded.`
    });
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
      case "in-progress":
        return "bg-blue-500 hover:bg-blue-600"
      case "resolved":
        return "bg-green-500 hover:bg-green-600"
      case "open":
        return "bg-orange-500 hover:bg-orange-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />
      case "overdue": return <AlertCircle className="w-4 h-4" />
      case "resolved": return <CheckCircle className="w-4 h-4" />
      case "in-progress": return <Clock className="w-4 h-4" />
      case "open": return <AlertCircle className="w-4 h-4 text-orange-500" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (loading || !data) {
    return (
      <DashboardLayout userRole="resident" userName="Resident">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="resident" userName="Resident">
      <Dialog open={dialogState.type !== 'none'} onOpenChange={handleDialogChange}>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back!</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.pendingBills.length}</div>
                <p className="text-xs text-muted-foreground">
                  ₹{data.pendingBills.reduce((sum, bill) => sum + bill.amount, 0).toLocaleString()} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Complaints</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.myComplaints.length}</div>
                <p className="text-xs text-muted-foreground">
                  {data.myComplaints.filter((c) => c.status !== "resolved" && c.status !== 'closed').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visitor Approvals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{data.pendingVisitorApprovals?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Waiting at gate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Notices</CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.announcements.length}</div>
                <p className="text-xs text-muted-foreground">Unread</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

             {data.pendingVisitorApprovals && data.pendingVisitorApprovals.length > 0 && (
              <Card className="lg:col-span-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <AlertCircle />
                    Visitor Approvals
                  </CardTitle>
                  <CardDescription>The following visitors are waiting for your approval at the gate.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                     {data.pendingVisitorApprovals.map((visitor) => (
                      <div key={visitor._id} className="flex items-center justify-between p-4 bg-background rounded-lg shadow-sm">
                        <div>
                          <p className="font-bold">{visitor.name}</p>
                          <p className="text-sm text-muted-foreground">Purpose: {visitor.purpose}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleVisitorApproval(visitor._id, 'reject')}>
                            <UserX className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                           <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleVisitorApproval(visitor._id, 'approve')}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                     ))}
                   </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Bills */}
            <Card>
              <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Pending Bills</CardTitle>
                        <CardDescription>Your outstanding maintenance bills</CardDescription>
                    </div>
                     <Link href="/resident/bills">
                        <Button variant="outline" size="sm">View All</Button>
                    </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.pendingBills.length > 0 ? data.pendingBills.map((bill) => (
                    <div
                      key={bill._id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{bill.month} {bill.year}</p>
                        <p className="text-sm text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-bold text-lg">₹{bill.amount.toLocaleString()}</p>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(bill.status)} text-white capitalize`}>{bill.status.replace("_", " ")}</Badge>
                           <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openViewDialog(bill)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                           </DialogTrigger>
                           <DialogTrigger asChild>
                              <Button size="sm" onClick={() => openPaymentDialog(bill)}>Pay Now</Button>
                           </DialogTrigger>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No pending bills. Great job!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Complaints */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>My Complaints</CardTitle>
                        <CardDescription>Track your complaint status</CardDescription>
                    </div>
                     <Link href="/resident/complaints">
                        <Button variant="outline" size="sm">New Complaint</Button>
                    </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                   {data.myComplaints.length > 0 ? data.myComplaints.map((complaint) => (
                    <div
                      key={complaint._id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(complaint.status)}
                        <div>
                          <p className="font-medium">{complaint.title}</p>
                          <p className="text-sm text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">{complaint.priority}</Badge>
                        <Badge className={`${getStatusColor(complaint.status)} text-white capitalize`}>{complaint.status.replace('-', ' ')}</Badge>
                      </div>
                    </div>
                  )) : (
                     <p className="text-sm text-muted-foreground text-center py-4">You have not raised any complaints yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
             {data.communityEvents && data.communityEvents.length > 0 && (
              <div className="lg:col-span-2">
                <CommunityEvents events={data.communityEvents} />
              </div>
            )}
          </div>
        </div>

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
    </DashboardLayout>
  )
}
