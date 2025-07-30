

"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  Heart,
  Send,
  Loader2,
  Paperclip,
  MoreHorizontal,
  ImageIcon,
  BarChart2,
  Video,
  Home,
  UserPlus,
  File as FileIcon,
  Link as LinkIcon,
  Plus,
  Trash2,
  Calendar,
  Users as UsersIcon,
  Search,
  Check
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ICommunityPost } from "@/backend/models/CommunityPost"
import { IChat, IMessage } from "@/backend/models/Chat"
import { User } from "@/backend/lib/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CommunityView = "feed" | "chat"

function CommunityPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [view, setView] = useState<CommunityView>("feed")
  const [posts, setPosts] = useState<any[]>([])
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false)

  const { toast } = useToast()

  const fetchCommunityData = async () => {
    setLoading(true)
    try {
      const [postsRes, userRes, chatsRes] = await Promise.all([
        fetch("/api/community/posts"),
        fetch("/api/auth/me"),
        fetch("/api/community/chats"),
      ])

      if (postsRes.ok) setPosts(await postsRes.json())
      if (userRes.ok) setCurrentUser((await userRes.json()).user)
      if (chatsRes.ok) {
        const chatData = await chatsRes.json()
        setChats(chatData)

        const viewParam = searchParams.get("view")
        const chatIdParam = searchParams.get("chatId")

        if (viewParam === "chat" && chatIdParam) {
          const chatToSelect = chatData.find((c: any) => c._id === chatIdParam)
          if (chatToSelect) {
            handleSelectChat(chatToSelect)
          }
        }
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to load community data" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunityData()
  }, [])

  const handleSelectChat = async (chat: any) => {
    setSelectedChat(chat);
    setView("chat");
    router.replace(`/resident/community?view=chat&chatId=${chat._id}`);
  }
  
  const handleSetView = (newView: CommunityView) => {
    setView(newView);
    if(newView === 'feed') {
      setSelectedChat(null);
      router.replace('/resident/community');
    }
  }

  const handleCreateNewChat = async (memberId: string) => {
    try {
      const res = await fetch("/api/community/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      })
      const newChat = await res.json()
      if (res.ok) {
        if (!chats.some((c) => c._id === newChat._id)) {
          setChats((prev) => [newChat, ...prev])
        }
        handleSelectChat(newChat)
        setIsNewChatOpen(false)
      } else {
        toast({ variant: "destructive", title: "Failed to create chat." })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error creating chat." })
    }
  }

  const handleCreateGroupChat = async (groupName: string, memberIds: string[]) => {
     try {
      const res = await fetch("/api/community/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, memberIds }),
      })
      const newChat = await res.json()
      if (res.ok) {
        setChats((prev) => [newChat, ...prev])
        handleSelectChat(newChat)
        setIsNewGroupOpen(false)
      } else {
        toast({ variant: "destructive", title: "Failed to create group." })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error creating group." })
    }
  }
  
  const renderCentralContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )
    }

    switch (view) {
      case "feed":
        return <FeedView posts={posts} currentUser={currentUser} refreshFeed={fetchCommunityData} />
      case "chat":
        return <MessageArea key={selectedChat?._id} selectedChat={selectedChat} currentUser={currentUser} />
      default:
        return <FeedView posts={posts} currentUser={currentUser} refreshFeed={fetchCommunityData} />
    }
  }


  return (
    <DashboardLayout userRole={currentUser?.role || "resident"} userName={currentUser?.name || "Resident"}>
      <div className="grid grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
        {/* Left Nav */}
        <div className="hidden lg:block lg:col-span-3 xl:col-span-2">
          <LeftNav view={view} setView={handleSetView} />
        </div>

        {/* Center Content */}
        <main className="col-span-12 lg:col-span-6 xl:col-span-7 h-full overflow-y-auto pr-4">
          {renderCentralContent()}
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 h-full">
            <RightSidebar 
                chats={chats} 
                onSelectChat={handleSelectChat}
                selectedChatId={selectedChat?._id}
                currentUser={currentUser}
                isNewChatOpen={isNewChatOpen}
                setIsNewChatOpen={setIsNewChatOpen}
                onCreateNewChat={handleCreateNewChat}
                isNewGroupOpen={isNewGroupOpen}
                setIsNewGroupOpen={setIsNewGroupOpen}
                onCreateGroupChat={handleCreateGroupChat}
            />
        </aside>
      </div>
    </DashboardLayout>
  )
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunityPageContent />
    </Suspense>
  )
}

// -- Navigation & Sidebar Components --

const LeftNav = ({ view, setView }: { view: CommunityView; setView: (view: CommunityView) => void }) => {
  const NavButton = ({
    targetView,
    icon: Icon,
    label,
  }: {
    targetView: CommunityView
    icon: React.ElementType
    label: string
  }) => (
    <Button
      variant={view === targetView ? "secondary" : "ghost"}
      className="w-full justify-start text-md gap-3 px-4 py-3"
      onClick={() => setView(targetView)}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Button>
  )

  return (
    <Card className="sticky top-0 h-full">
      <CardContent className="p-2">
        <NavButton targetView="feed" icon={Home} label="Feed" />
        <NavButton targetView="chat" icon={MessageSquare} label="Chats" />
      </CardContent>
    </Card>
  )
}

const RightSidebar = ({ 
    chats, onSelectChat, selectedChatId, currentUser, 
    isNewChatOpen, setIsNewChatOpen, onCreateNewChat,
    isNewGroupOpen, setIsNewGroupOpen, onCreateGroupChat
}: any) => {

    const ChatAvatar = ({ chat }: { chat: any }) => {
        if (chat.isGroup) {
            return (
                <Avatar>
                    <AvatarFallback>
                        <UsersIcon className="w-5 h-5"/>
                    </AvatarFallback>
                </Avatar>
            )
        }
        const otherMember = chat.members.find((m: any) => m._id !== currentUser?.id)
        return (
            <Avatar>
                <AvatarImage src={otherMember?.avatar} />
                <AvatarFallback>{otherMember?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
        )
    }

    const ChatName = ({ chat }: { chat: any }) => {
        if (chat.isGroup) {
            return chat.name || "Group Chat";
        }
        const otherMember = chat.members.find((m: any) => m._id !== currentUser?.id)
        return otherMember?.name || "Unknown User";
    }

  return (
     <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="text-xl font-bold">Chats</div>
          <div className="flex items-center gap-1">
             <Dialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UsersIcon className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <NewGroupDialog onCreateGroup={onCreateGroupChat} />
              </Dialog>
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserPlus className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <NewChatDialog onCreateChat={onCreateNewChat} />
              </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-2 flex-1 overflow-y-auto">
          {chats.map((chat: any) => {
            return (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted",
                  selectedChatId === chat._id && "bg-muted"
                )}
              >
                <ChatAvatar chat={chat} />
                <div className="overflow-hidden">
                  <p className="font-semibold truncate"><ChatName chat={chat} /></p>
                  <p className="text-xs text-muted-foreground truncate">
                    {chat.messages[chat.messages.length - 1]?.content || "No messages yet"}
                  </p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
  )
}

// -- Main Content Views --

const FeedView = ({ posts, currentUser, refreshFeed }: { posts: any[]; currentUser: User | null; refreshFeed: () => void }) => {
  return (
    <div className="max-w-full mx-auto space-y-4">
      <CreatePost currentUser={currentUser} refreshFeed={refreshFeed} />
      {posts.map((post) => (
        <PostCard key={post._id} post={post} currentUser={currentUser} refreshFeed={refreshFeed} />
      ))}
    </div>
  )
}

const MessageArea = ({ selectedChat, currentUser }: { selectedChat: any; currentUser: any }) => {
  const [messages, setMessages] = useState<IMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async () => {
    if (!selectedChat?._id) return
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/community/chats/${selectedChat._id}`)
      if (res.ok) {
        const chatDetails = await res.json()
        setMessages(chatDetails.messages || [])
      } else {
        toast({ variant: "destructive", title: "Failed to fetch messages" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching messages" })
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [selectedChat])

  const handleSendMessage = async (messageData: Partial<IMessage>) => {
    if (!selectedChat) return
    setIsSending(true)
    try {
      const res = await fetch(`/api/community/chats/${selectedChat._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      })
      if (res.ok) {
        const newMsgData = await res.json()
        setMessages((prev) => [...prev, newMsgData])
        setNewMessage("")
      } else {
        toast({ variant: "destructive", title: "Failed to send message" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error sending message" })
    } finally {
      setIsSending(false)
    }
  }

  const handleTextSend = () => {
    if (!newMessage.trim()) return
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const isLink = urlRegex.test(newMessage)
    handleSendMessage({ content: newMessage, type: isLink ? "link" : "text" })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")
    const mediaUrl = URL.createObjectURL(file)

    handleSendMessage({
      content: file.name,
      type: isImage ? "image" : isVideo ? "video" : "file",
      mediaUrl: mediaUrl,
      fileSize: file.size,
    })
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  const MessageContent = ({ msg }: { msg: IMessage }) => {
    switch (msg.type) {
      case "image":
        return <Image src={msg.mediaUrl!} alt={msg.content} width={200} height={200} className="rounded-lg object-cover" />
      case "video":
        return (
          <video src={msg.mediaUrl!} controls className="rounded-lg max-w-xs">
            Your browser does not support the video tag.
          </video>
        )
      case "file":
        return (
          <a
            href={msg.mediaUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-background/50 p-3 rounded-lg hover:bg-background/80"
          >
            <FileIcon className="w-8 h-8" />
            <div>
              <p className="font-medium">{msg.content}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(msg.fileSize || 0)}</p>
            </div>
          </a>
        )
      case "link":
        return (
          <a href={msg.content} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
            {msg.content}
          </a>
        )
      default:
        return <p>{msg.content}</p>
    }
  }

  if (!selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <MessageSquare className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold">Your Messages</h3>
        <p>Select a chat to start a conversation.</p>
      </div>
    )
  }

  const otherMember = !selectedChat.isGroup ? selectedChat.members.find((m: any) => m._id !== currentUser?.id) : null;
  const chatName = selectedChat.isGroup ? selectedChat.name : otherMember?.name;
  const chatAvatar = selectedChat.isGroup ? (
    <Avatar>
      <AvatarFallback><UsersIcon className="w-5 h-5"/></AvatarFallback>
    </Avatar>
  ) : (
    <Avatar>
      <AvatarImage src={otherMember?.avatar} />
      <AvatarFallback>{otherMember?.name.charAt(0) || "U"}</AvatarFallback>
    </Avatar>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {chatAvatar}
          <p className="font-semibold">{chatName}</p>
        </div>
        <Button variant="ghost" size="icon">
          <Video className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          messages.map((msg: any, index) => (
            <div
              key={msg._id || index}
              className={cn("flex items-end gap-2", msg.senderId?._id === currentUser.id ? "justify-end" : "justify-start")}
            >
              {msg.senderId?._id !== currentUser.id && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={msg.senderId.avatar} />
                  <AvatarFallback>{msg.senderId.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "p-3 rounded-lg max-w-md",
                  msg.senderId?._id === currentUser.id ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {selectedChat.isGroup && msg.senderId?._id !== currentUser.id && (
                    <p className="text-xs font-bold mb-1">{msg.senderId.name}</p>
                )}
                <MessageContent msg={msg} />
                <p className="text-xs opacity-70 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-4 border-t bg-background">
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleTextSend()}
          />
          <Button onClick={handleTextSend} disabled={isSending}>
            {isSending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </div>
    </Card>
  )
}

const NewChatDialog = ({ onCreateChat }: { onCreateChat: (memberId: string) => void }) => {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/users/search?q=${search}`)
        if (res.ok) {
          setResults(await res.json())
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Failed to search users" })
      } finally {
        setLoading(false)
      }
    }
    const handler = setTimeout(() => {
        fetchUsers()
    }, 300)
    return () => clearTimeout(handler)
  }, [search, toast])

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Chat</DialogTitle>
        <DialogDescription>Start a one-on-one conversation with anyone in the society.</DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Input placeholder="Search residents, admin, or staff..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-center p-4">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            results.map((user: any) => (
              <div key={user._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role} {user.flatNumber && `(${user.flatNumber})`}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => onCreateChat(user._id)}>
                  Message
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </DialogContent>
  )
}

const NewGroupDialog = ({ onCreateGroup }: { onCreateGroup: (groupName: string, memberIds: string[]) => void }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${search}`);
        if (res.ok) {
          setResults(await res.json());
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Failed to search users" });
      } finally {
        setLoading(false);
      }
    };
    const handler = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(handler);
  }, [search, toast]);

  const toggleMember = (user: any) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m._id === user._id)
        ? prev.filter((m) => m._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      toast({ variant: "destructive", title: "Group name is required." });
      return;
    }
    if (selectedMembers.length < 2) {
      toast({ variant: "destructive", title: "A group needs at least 2 other members." });
      return;
    }
    onCreateGroup(groupName, selectedMembers.map(m => m._id));
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogDescription>Create a group chat with multiple members.</DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div>
          <Label htmlFor="groupName">Group Name</Label>
          <Input id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Enter group name" />
        </div>
        <div>
          <Label>Add Members</Label>
          <Input placeholder="Search users to add..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
            {loading ? (
              <div className="text-center p-4"><Loader2 className="animate-spin" /></div>
            ) : (
              results.map((user: any) => {
                const isSelected = selectedMembers.some((m) => m._id === user._id);
                return (
                  <div key={user._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer" onClick={() => toggleMember(user)}>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-primary" />}
                  </div>
                );
              })
            )}
          </div>
          {selectedMembers.length > 0 && (
             <div className="pt-2">
                <p className="text-sm font-medium">Selected:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMembers.map(m => <Badge key={m._id} variant="secondary">{m.name}</Badge>)}
                </div>
            </div>
          )}
        </div>
        <Button className="w-full" onClick={handleCreate}>Create Group</Button>
      </div>
    </DialogContent>
  );
};


// -- UI Components --

const CreatePost = ({ currentUser, refreshFeed }: { currentUser: User | null; refreshFeed: () => void }) => {
  const [content, setContent] = useState("")
  const [pollOptions, setPollOptions] = useState([{ text: "" }, { text: "" }])
  const [eventDetails, setEventDetails] = useState({ date: "", time: "", location: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleCreatePost = async (category: "discussion" | "poll" | "event") => {
    if (!content.trim()) return
    setIsSubmitting(true)

    let postData: any = { content, category, hashtags: [] }

    if (category === "poll") {
      const validOptions = pollOptions.filter((opt) => opt.text.trim() !== "")
      if (validOptions.length < 2) {
        toast({ variant: "destructive", title: "Polls require at least two options." })
        setIsSubmitting(false)
        return
      }
      postData.pollOptions = validOptions
    }

    if (category === "event") {
      postData = {
        ...postData,
        eventDate: eventDetails.date,
        eventTime: eventDetails.time,
        eventLocation: eventDetails.location,
      }
    }

    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })
      if (response.ok) {
        toast({ title: "Post published" })
        setContent("")
        setPollOptions([{ text: "" }, { text: "" }])
        setEventDetails({ date: "", time: "", location: "" })
        refreshFeed()
      } else {
        toast({ variant: "destructive", title: "Failed to create post" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error creating post" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index].text = value
    setPollOptions(newOptions)
  }

  const addPollOption = () => {
    setPollOptions([...pollOptions, { text: "" }])
  }

  const removePollOption = (index: number) => {
    setPollOptions(pollOptions.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="discussion" className="w-full">
          <div className="p-4">
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src={(currentUser as any)?.avatar} />
                <AvatarFallback>{currentUser?.name?.charAt(0) || "R"}</AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="What's happening in the community?"
                className="bg-muted border-none focus-visible:ring-1 focus-visible:ring-ring"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          <TabsContent value="discussion" className="px-4 pb-4">
            <div className="flex justify-end">
              <Button onClick={() => handleCreatePost("discussion")} disabled={isSubmitting || !content.trim()}>
                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                Post
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="poll" className="px-4 pb-4 space-y-2">
            <Label>Poll Options</Label>
            {pollOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handlePollOptionChange(index, e.target.value)}
                />
                {pollOptions.length > 2 && (
                  <Button variant="ghost" size="icon" onClick={() => removePollOption(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addPollOption} disabled={pollOptions.length >= 5}>
              <Plus className="w-4 h-4 mr-2" /> Add Option
            </Button>
            <div className="flex justify-end pt-2">
              <Button onClick={() => handleCreatePost("poll")} disabled={isSubmitting || !content.trim()}>
                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                Post Poll
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="event" className="px-4 pb-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={eventDetails.date}
                  onChange={(e) => setEventDetails({ ...eventDetails, date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="event-time">Time</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={eventDetails.time}
                  onChange={(e) => setEventDetails({ ...eventDetails, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                placeholder="e.g. Clubhouse"
                value={eventDetails.location}
                onChange={(e) => setEventDetails({ ...eventDetails, location: e.target.value })}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => handleCreatePost("event")} disabled={isSubmitting || !content.trim()}>
                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                Post Event
              </Button>
            </div>
          </TabsContent>
          <CardFooter className="bg-muted p-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              <TabsTrigger value="poll">
                <BarChart2 className="w-4 h-4 mr-2" /> Poll
              </TabsTrigger>
              <TabsTrigger value="event">
                <Calendar className="w-4 h-4 mr-2" /> Event
              </TabsTrigger>
            </TabsList>
          </CardFooter>
        </Tabs>
      </CardContent>
    </Card>
  )
}

const PostCard = ({ post, currentUser, refreshFeed }: { post: any; currentUser: User | null; refreshFeed: () => void }) => {
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [isCommenting, setIsCommenting] = useState(false)

  const toggleLike = async () => {
    try {
      await fetch(`/api/community/posts/${post._id}/like`, { method: "POST" })
      refreshFeed()
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to update like status" })
    }
  }

  const handleComment = async () => {
    if (!comment.trim()) return
    setIsCommenting(true)
    try {
      await fetch(`/api/community/posts/${post._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      })
      setComment("")
      refreshFeed()
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to post comment" })
    } finally {
      setIsCommenting(false)
    }
  }

  const renderPostContent = () => {
    switch (post.category) {
      case "event":
        return <EventPostContent event={post} />
      case "poll":
        return <PollPostContent poll={post} refreshPoll={refreshFeed} />
      default:
        return <p className="whitespace-pre-wrap mb-4">{post.content}</p>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.authorImage} alt={post.authorName} />
              <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.authorName}</p>
              <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderPostContent()}
        <div className="flex justify-between text-muted-foreground text-sm mb-2">
          <span>{post.likes.length} Likes</span>
          <span>{post.comments.length} Comments</span>
        </div>
        <Separator />
        <div className="flex justify-around pt-2">
          <Button variant="ghost" onClick={toggleLike} className={cn("w-full", post.likedByCurrentUser && "text-red-500")}>
            <Heart className="mr-2" /> Like
          </Button>
          <Button variant="ghost" className="w-full">
            <MessageSquare className="mr-2" /> Comment
          </Button>
        </div>
        <Separator className="my-2" />
        <div className="space-y-4">
          {post.comments.slice(0, 2).map((c: any) => (
            <div key={c._id} className="flex gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={c.authorImage} alt={c.authorName} />
                <AvatarFallback>{c.authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-2 text-sm w-full">
                <p className="font-semibold">{c.authorName}</p>
                <p>{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={(currentUser as any)?.avatar} />
              <AvatarFallback>{currentUser?.name?.charAt(0) || "R"}</AvatarFallback>
            </Avatar>
            <div className="relative w-full">
              <Input
                placeholder="Write a comment..."
                className="bg-muted border-none pr-12"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleComment}
                disabled={isCommenting}
              >
                {isCommenting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const EventPostContent = ({ event }: { event: any }) => {
  return (
    <div className="mb-4">
      <p className="whitespace-pre-wrap mb-4 font-semibold text-lg">{event.content}</p>
      <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at {event.eventTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <span>{event.eventLocation}</span>
        </div>
      </div>
      <Button className="mt-4 w-full">RSVP</Button>
    </div>
  )
}

const PollPostContent = ({ poll, refreshPoll }: { poll: any; refreshPoll: () => void }) => {
  const totalVotes = poll.pollOptions.reduce((acc: number, option: any) => acc + option.voters.length, 0);

  const handleVote = async (optionIndex: number) => {
    console.log(`Voted for option ${optionIndex}`);
    // await fetch(`/api/community/posts/${poll._id}/vote`, { method: "POST", body: JSON.stringify({ optionIndex }) });
    refreshPoll();
  };

  return (
    <div className="mb-4">
      <p className="whitespace-pre-wrap mb-4 font-semibold text-lg">{poll.content}</p>
      <div className="space-y-2">
        {poll.pollOptions.map((option: any, index: number) => {
          const percentage = totalVotes > 0 ? (option.voters.length / totalVotes) * 100 : 0;
          return (
             <div key={index} className="relative">
                <Button variant="outline" className="w-full justify-start" onClick={() => handleVote(index)}>
                  {option.text}
                </Button>
                <div className="absolute top-0 left-0 h-full bg-primary/20 rounded-md" style={{ width: `${percentage}%` }} />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold">{Math.round(percentage)}%</span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-2">{totalVotes} votes</p>
    </div>
  )
}
