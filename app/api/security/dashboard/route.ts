
import { NextResponse } from "next/server"
import dbConnect from "@/backend/lib/mongodb"
import { VisitorModel } from "@/backend/models/Visitor"

export async function GET() {
  try {
    await dbConnect()

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    const activeVisitors = await VisitorModel.countDocuments({ status: "checked-in" })

    const todayVisitors = await VisitorModel.countDocuments({
      checkInTime: { $gte: startOfDay, $lt: endOfDay },
    })

    // Placeholder for pending approvals logic if implemented
    const pendingApprovals = 0

    const recentVisitors = await VisitorModel.find({}).sort({ checkInTime: -1 }).limit(5).lean()

    return NextResponse.json({
      activeVisitors,
      todayVisitors,
      pendingApprovals,
      recentVisitors,
    })
  } catch (error) {
    console.error("Security dashboard error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
