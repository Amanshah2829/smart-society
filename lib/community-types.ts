

export interface CommunityUser {
  _id: string;
  name: string;
  avatar: string;
  role: string;
  points: number;
  badges: CommunityBadge[];
  skills: string[];
  interests: string[];
  joinDate: Date;
  isOnline: boolean;
  lastSeen: Date;
}

export interface CommunityBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
}

export interface CommunityPost {
  _id: string;
  authorId: string;
  authorName: string;
  authorImage: string;
  authorRole: string;
  content: string;
  type: 'success' | 'help' | 'announcement' | 'project' | 'resource' | 'discussion';
  createdAt: string; 
  timestamp: Date; 
  likes: any[]; 
  likedByCurrentUser: boolean;
  comments: any[]; 
  tags: string[];
  images?: string[];
  category: 'discussion' | 'event' | 'poll';
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  pollOptions?: { text: string; votes: number }[];
}

export interface CommunityEvent {
  _id: string;
  title: string;
  description: string;
  organizer: CommunityUser;
  date: Date;
  time: string;
  location: string;
  type: 'workshop' | 'meetup' | 'volunteer' | 'celebration';
  participants: CommunityUser[];
  maxParticipants: number;
  cost: number;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  recurring: boolean;
}

export interface Competition {
    _id: string;
    title: string;
    description: string;
    organizer: CommunityUser;
    type: 'hackathon' | 'ideathon' | 'design' | 'quiz';
    category: 'tech' | 'social' | 'arts' | 'sports';
    startDate: Date;
    endDate: Date;
    rules: string[];
    prizes: {
        position: number;
        reward: string;
        value?: number;
    }[];
    participants: CommunityUser[];
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    votingEnabled: boolean;
    submissions: any[];
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  lead: CommunityUser;
  members: CommunityUser[];
  category: 'environment' | 'education' | 'health' | 'social' | 'infrastructure';
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress: number;
  startDate: Date;
  endDate?: Date;
  tasks: any[];
  updates: any[];
}

export interface Resource {
    _id: string;
    name: string;
    description: string;
    owner: CommunityUser;
    type: 'item' | 'service' | 'skill' | 'information';
    availability: 'available' | 'in-use' | 'unavailable';
    condition?: 'new' | 'used' | 'fair';
    cost: 'free' | 'barter' | 'paid';
    price?: number;
}

export interface TalentProfile {
    _id: string;
    user: CommunityUser;
    title: string;
    bio: string;
    skills: string[];
    portfolio: string[];
    rating: number;
    reviews: any[];
    rate?: string;
}

export interface Chat {
  _id: string;
  name?: string; 
  isGroup: boolean;
  members: CommunityUser[];
  messages: Message[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
    _id: string;
    sender: CommunityUser;
    content: string;
    timestamp: Date;
    readBy: string[];
}
