
import { NextResponse } from "next/server"
import dbConnect from "@/backend/lib/mongodb"
import { UserModel } from "@/backend/models/User"
import { MaintenanceBillModel } from "@/backend/models/MaintenanceBill"
import { ComplaintModel } from "@/backend/models/Complaint"
import { startOfMonth, endOfMonth } from "date-fns"

export async function GET() {
  try {
    await dbConnect()

    const totalResidents = await UserModel.countDocuments({ role: "resident" })

    const pendingBills = await MaintenanceBillModel.countDocuments({
      status: { $in: ["pending", "overdue"] },
    })

    const openComplaints = await ComplaintModel.countDocuments({
      status: { $in: ["open", "in-progress"] },
    })

    const now = new Date()
    const startOfCurrentMonth = startOfMonth(now)
    const endOfCurrentMonth = endOfMonth(now)
    const monthlyRevenueResult = await MaintenanceBillModel.aggregate([
      {
        $match: {
          status: "paid",
          paymentDate: {
            $gte: startOfCurrentMonth,
            $lte: endOfCurrentMonth,
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])
    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0

    const recentComplaints = await ComplaintModel.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title priority status flatNumber")
      .lean()

    const recentPayments = await MaintenanceBillModel.find({ status: "paid" })
      .sort({ paymentDate: -1 })
      .limit(3)
      .select("flatNumber amount paymentDate")
      .lean()

    return NextResponse.json({
      totalResidents,
      pendingBills,
      openComplaints,
      monthlyRevenue,
      recentComplaints,
      recentPayments,
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
