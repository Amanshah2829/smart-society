

export interface User {
  _id: string
  email: string
  password: string
  name: string
  role: "admin" | "resident" | "security" | "receptionist" | "accountant" | "superadmin"
  flatNumber?: string
  phone: string
  residencyType?: "owner" | "tenant"
  dateOfBirth?: Date
  createdAt: Date
  updatedAt: Date
  siteId?: string;
  avatar?: string;
}

export interface MaintenanceBill {
  _id: string
  flatNumber: string
  residentId: string
  amount: number
  month: string
  year: number
  dueDate: Date
  status: "pending" | "paid" | "overdue"
  paymentDate?: Date
  paymentId?: string
  createdAt: Date
  siteId?: string;
}

export interface Complaint {
  _id: string
  title: string
  description: string
  category: "plumbing" | "electrical" | "cleaning" | "security" | "other"
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in-progress" | "resolved" | "closed"
  residentId: string
  flatNumber: string
  assignedTo?: string
  images?: string[]
  createdAt: Date
  updatedAt: Date
  siteId?: string;
}

export interface Visitor {
  _id: string
  name: string
  phone: string
  purpose: string
  flatNumber: string
  checkInTime: Date
  checkOutTime?: Date
  photo?: string
  vehicleNumber?: string
  securityId: string
  status: "checked-in" | "checked-out"
  siteId?: string;
}

export interface Announcement {
  _id: string
  title: string
  content: string
  category: "general" | "maintenance" | "event" | "emergency"
  targetRoles: string[]
  authorId: string
  isActive: boolean
  createdAt: Date
  expiryDate?: Date
  siteId?: string;
}

export interface Site {
    _id: string;
    name: string;
    address: string;
    totalBlocks: number;
    floorsPerBlock: number;
    unitsPerFloor: number;
    adminName: string;
    adminEmail: string;
    subscription: {
        tier: 'trial' | 'active' | 'expired';
        startDate: Date;
        endDate: Date;
        fee: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
