
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, MoreHorizontal, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ICommunityPost } from "@/backend/models/CommunityPost"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Post extends ICommunityPost {
  _id: string
  authorName: string
  authorImage?: string
}

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/community/posts")
      if (response.ok) {
        setPosts(await response.json())
      } else {
        toast({ variant: "destructive", title: "Failed to fetch posts" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching posts" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])
  
  const handleDeletePost = async (postId: string) => {
    // In a real app, you would have a DELETE API endpoint
    // For now, we'll just filter it from the state
    setPosts(posts.filter(p => p._id !== postId));
    toast({ variant: 'destructive', title: "Post Deleted", description: "The post has been removed." });
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Moderation</h1>
        <p className="text-muted-foreground">Review and manage posts from the community hub.</p>
        
        {loading ? (
           <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={post.authorImage} alt={post.authorName} />
                        <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{post.authorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString()} &bull; <span className="capitalize">{post.category}</span>
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="icon">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the post from the community hub.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePost(post._id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                {post.mediaUrl && (
                  <div className="mt-4">
                    <img src={post.mediaUrl} alt="Post media" className="rounded-lg max-h-96 w-full object-cover" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-start gap-8 border-t pt-4">
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Heart className="h-5 w-5" />
                   <span>{post.likes.length}</span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <MessageCircle className="h-5 w-5" />
                   <span>{post.comments.length}</span>
                 </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
