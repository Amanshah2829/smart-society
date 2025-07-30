

"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Shield, Bell, Loader2, Camera } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    flatNumber: string;
    avatar?: string;
}

export default function ResidentSettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
    const [error, setError] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/users/profile');
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                    if (data.avatar) {
                        setPreview(data.avatar);
                    }
                } else {
                    toast({ variant: 'destructive', title: 'Failed to fetch profile' });
                }
            } catch (err) {
                 toast({ variant: 'destructive', title: 'An error occurred while fetching profile' });
            }
        };
        fetchProfile();
    }, [toast]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setIsProfileSubmitting(true);

        // In a real app, you'd upload the file to a storage service (e.g., S3, Cloudinary)
        // and get back a URL. For this demo, we'll simulate it by using the preview URL.
        const avatarUrl = preview && selectedFile ? preview : profile.avatar;

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile.name,
                    phone: profile.phone,
                    avatar: avatarUrl
                }),
            });
            const data = await response.json();
            if (response.ok) {
                toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
            } else {
                toast({ variant: 'destructive', title: 'Update failed', description: data.message });
            }
        } catch (err) {
             toast({ variant: 'destructive', title: 'An error occurred' });
        } finally {
            setIsProfileSubmitting(false);
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        setIsPasswordSubmitting(true);
        try {
            const response = await fetch("/api/users/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await response.json();
            if (response.ok) {
                toast({ title: "Password Changed", description: "Your password has been updated successfully." });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setError(data.message || "An error occurred.");
            }
        } catch (err) {
            setError("Failed to change password. Please try again.");
        } finally {
            setIsPasswordSubmitting(false);
        }
    };

    if (!profile) {
        return (
            <DashboardLayout userRole="resident" userName="Resident">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin" />
                </div>
            </DashboardLayout>
        )
    }


  return (
    <DashboardLayout userRole="resident" userName={profile.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
                <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Password</TabsTrigger>
                <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={preview || ''} alt={profile.name}/>
                                <AvatarFallback className="text-3xl">
                                    {profile.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <Label htmlFor="picture">Profile Picture</Label>
                                <Input id="picture" type="file" onChange={handleFileChange} accept="image/*" />
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="residentName">Name</Label>
                              <Input id="residentName" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                            </div>
                             <div className="space-y-2">
                              <Label htmlFor="residentEmail">Email</Label>
                              <Input id="residentEmail" type="email" value={profile.email} disabled />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="residentPhone">Phone</Label>
                              <Input id="residentPhone" type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="residentFlat">Flat Number</Label>
                              <Input id="residentFlat" value={profile.flatNumber} disabled />
                            </div>
                        </div>
                        <Button type="submit" disabled={isProfileSubmitting}>
                           {isProfileSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                           Update Profile
                        </Button>
                    </form>
                  </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                             {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required/>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required/>
                            </div>
                             <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
                            </div>
                            <Button type="submit" disabled={isPasswordSubmitting}>
                                {isPasswordSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Update Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you receive notifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                           <Label htmlFor="billNotif">New Bill Notifications</Label>
                           <p className="text-sm text-muted-foreground">Get notified when a new bill is generated.</p>
                        </div>
                        <Switch id="billNotif" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                           <Label htmlFor="announcementNotif">Society Announcements</Label>
                            <p className="text-sm text-muted-foreground">Receive important society-wide notices.</p>
                        </div>
                        <Switch id="announcementNotif" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                       <div>
                           <Label htmlFor="visitorNotif">Visitor Entry Notifications</Label>
                            <p className="text-sm text-muted-foreground">Get an alert when a visitor checks in for you.</p>
                        </div>
                        <Switch id="visitorNotif" />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                       <div>
                           <Label htmlFor="complaintNotif">Complaint Status Updates</Label>
                            <p className="text-sm text-muted-foreground">Receive updates on your submitted complaints.</p>
                        </div>
                        <Switch id="complaintNotif" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
