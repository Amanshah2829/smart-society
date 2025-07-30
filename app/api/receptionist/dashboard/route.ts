
import { NextResponse } from "next/server"
import dbConnect from "@/backend/lib/mongodb"
import { VisitorModel } from "@/backend/models/Visitor"
import { ComplaintModel } from "@/backend/models/Complaint"

export async function GET() {
  try {
    await dbConnect()

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    const activeVisitors = await VisitorModel.countDocuments({ status: "checked-in" })
    const totalToday = await VisitorModel.countDocuments({
      checkInTime: { $gte: startOfDay, $lt: endOfDay },
    })
    const openComplaints = await ComplaintModel.countDocuments({ status: { $in: ["open", "in-progress"] } })

    // This is a placeholder for pre-approved visitors logic
    const upcomingVisitors = [
      // { _id: "1", name: "Guest Smith", flatNumber: "B-205", eta: "4:00 PM" },
      // { _id: "2", name: "Service Pro", flatNumber: "D-401", eta: "4:30 PM" },
    ]

    return NextResponse.json({
      activeVisitors,
      totalToday,
      openComplaints,
      upcomingVisitors,
    })
  } catch (error) {
    console.error("Receptionist dashboard error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
