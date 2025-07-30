"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Bell, Building, Palette, CreditCard, Trash2, UserPlus, FileUp, Ban } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

const initialComplaintCategories = ["Plumbing", "Electrical", "Cleaning", "Security", "Maintenance", "Other"];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [complaintCategories, setComplaintCategories] = useState(initialComplaintCategories);
    const [newCategory, setNewCategory] = useState("");
    const { toast } = useToast();

    const handleAddCategory = () => {
        if (!newCategory.trim()) {
            toast({ variant: "destructive", title: "Category name cannot be empty" });
            return;
        }
        if (complaintCategories.find(c => c.toLowerCase() === newCategory.toLowerCase())) {
            toast({ variant: "destructive", title: "Category already exists" });
            return;
        }
        setComplaintCategories([...complaintCategories, newCategory.trim()]);
        setNewCategory("");
        toast({ title: "Category Added", description: `"${newCategory.trim()}" has been added.`});
    }

    const handleDeleteCategory = (categoryToDelete: string) => {
        setComplaintCategories(complaintCategories.filter(c => c !== categoryToDelete));
        toast({ variant: "destructive", title: "Category Removed", description: `"${categoryToDelete}" has been removed.`});
    }

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your society settings and preferences.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="general"><Building className="w-4 h-4 mr-2" />General</TabsTrigger>
                <TabsTrigger value="complaints"><CreditCard className="w-4 h-4 mr-2" />Complaints</TabsTrigger>
                <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
                <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
                <TabsTrigger value="blacklist"><Ban className="w-4 h-4 mr-2" />Blacklist</TabsTrigger>
                <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2" />Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Update society-wide settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="societyName">Society Name</Label>
                          <Input id="societyName" defaultValue="Smart Society" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="societyAddress">Society Address</Label>
                          <Input id="societyAddress" defaultValue="123 Main Street, Pune, India" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="societyCurrency">Currency Symbol</Label>
                            <Input id="societyCurrency" defaultValue="₹" className="w-24"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="societyTimezone">Timezone</Label>
                            <Select defaultValue="Asia/Kolkata">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                                    <SelectItem value="Europe/London">Greenwich Mean Time</SelectItem>
                                    <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <h4 className="font-medium">Maintenance Mode</h4>
                        <p className="text-sm text-muted-foreground">
                          Temporarily disable access for residents and staff.
                        </p>
                      </div>
                      <Switch id="maintenanceMode" />
                    </div>
                     <div className="pt-4">
                         <Button>Save General Settings</Button>
                    </div>
                  </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="complaints" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Complaint Categories</CardTitle>
                        <CardDescription>Manage the categories available for resident complaints.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {complaintCategories.map(cat => (
                                <div key={cat} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                    <span className="font-medium">{cat}</span>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteCategory(cat)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Input 
                                placeholder="Add new category" 
                                value={newCategory} 
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <Button onClick={handleAddCategory}>Add Category</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure system-wide notification preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <Label htmlFor="newComplaintNotif">New Complaint</Label>
                          <p className="text-sm text-muted-foreground">Notify admin on new complaint submission.</p>
                        </div>
                        <Switch id="newComplaintNotif" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                       <div>
                          <Label htmlFor="paymentSuccessNotif">Payment Success</Label>
                           <p className="text-sm text-muted-foreground">Notify resident on successful payment.</p>
                        </div>
                        <Switch id="paymentSuccessNotif" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                         <div>
                          <Label htmlFor="paymentReminderNotif">Payment Reminder</Label>
                           <p className="text-sm text-muted-foreground">Send reminders for pending bills.</p>
                        </div>
                        <Switch id="paymentReminderNotif" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                       <div>
                          <Label htmlFor="visitorNotif">Visitor Entry</Label>
                           <p className="text-sm text-muted-foreground">Notify resident on visitor entry.</p>
                        </div>
                        <Switch id="visitorNotif" />
                    </div>
                  </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Manage security policies for the application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                          <Input id="sessionTimeout" type="number" defaultValue="60" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="twoFactorAuth">Two-Factor Authentication (2FA)</Label>
                                <p className="text-sm text-muted-foreground">Require a second factor for all logins.</p>
                            </div>
                            <Switch id="twoFactorAuth"/>
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="passwordLength">Minimum Password Length</Label>
                          <Input id="passwordLength" type="number" defaultValue="8" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <Label htmlFor="requireUppercase">Require Uppercase Letter</Label>
                            <Switch id="requireUppercase" defaultChecked/>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <Label htmlFor="requireNumber">Require Number</Label>
                            <Switch id="requireNumber" defaultChecked/>
                        </div>
                        <div className="pt-4">
                            <Button>Save Security Settings</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="blacklist" className="mt-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Visitor Blacklist</CardTitle>
                                <CardDescription>Manage individuals who are barred from entry.</CardDescription>
                            </div>
                            <Button><Plus className="w-4 h-4 mr-2" /> Add to Blacklist</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Example Row - This would be populated from the database */}
                                <TableRow>
                                    <TableCell>Rogue Individual</TableCell>
                                    <TableCell>+91-8888888888</TableCell>
                                    <TableCell>Previous misconduct reported</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4"/></Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>


            <TabsContent value="appearance" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>Appearance & Branding</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primaryColor">Primary Color</Label>
                          <div className="flex items-center gap-2">
                              <Input id="primaryColor" defaultValue="#0f172a" className="w-24"/>
                              <div className="w-8 h-8 rounded-full border" style={{backgroundColor: '#0f172a'}}></div>
                          </div>
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="backgroundColor">Background Color</Label>
                          <div className="flex items-center gap-2">
                              <Input id="backgroundColor" defaultValue="#ffffff" className="w-24"/>
                              <div className="w-8 h-8 rounded-full border" style={{backgroundColor: '#ffffff'}}></div>
                          </div>
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="accentColor">Accent Color</Label>
                          <div className="flex items-center gap-2">
                              <Input id="accentColor" defaultValue="#f1f5f9" className="w-24"/>
                              <div className="w-8 h-8 rounded-full border" style={{backgroundColor: '#f1f5f9'}}></div>
                          </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Society Logo</Label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                                <Building className="w-10 h-10 text-muted-foreground"/>
                            </div>
                            <Button variant="outline"><FileUp className="w-4 h-4 mr-2" /> Upload Logo</Button>
                        </div>
                    </div>
                    <div className="pt-4">
                        <Button>Save Appearance</Button>
                    </div>
                  </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
