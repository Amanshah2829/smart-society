export interface User {
  _id: string
  email: string
  password: string
  name: string
  role: "admin" | "resident" | "security" | "receptionist" | "accountant"
  flatNumber?: string
  phone: string
  createdAt: Date
  updatedAt: Date
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
}
