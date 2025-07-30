
import { NextResponse } from "next/server"
import dbConnect from "@/backend/lib/mongodb"
import { MaintenanceBillModel } from "@/backend/models/MaintenanceBill"
import { startOfMonth, endOfMonth } from "date-fns"

export async function GET() {
  try {
    await dbConnect()

    const now = new Date()
    const startOfCurrentMonth = startOfMonth(now)
    const endOfCurrentMonth = endOfMonth(now)

    // Total Revenue
    const totalRevenueResult = await MaintenanceBillModel.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0

    // Revenue This Month
    const revenueThisMonthResult = await MaintenanceBillModel.aggregate([
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
    const revenueThisMonth = revenueThisMonthResult.length > 0 ? revenueThisMonthResult[0].total : 0

    // Pending Payments
    const pendingPayments = await MaintenanceBillModel.countDocuments({
      status: "pending",
    })

    // Overdue Bills
    const overdueBills = await MaintenanceBillModel.countDocuments({
      status: "overdue",
    })

    // Recent Transactions (last 5 paid bills)
    const recentTransactions = await MaintenanceBillModel.find({ status: "paid" })
      .sort({ paymentDate: -1 })
      .limit(5)
      .select("amount status paymentDate residentName month year")
      .lean()

    const formattedTransactions = recentTransactions.map((t) => ({
      _id: t._id.toString(),
      title: `Maintenance Fee - ${t.month} ${t.year}`,
      amount: t.amount,
      status: "completed",
      createdAt: t.paymentDate as Date,
    }))

    return NextResponse.json({
      totalRevenue,
      revenueThisMonth,
      pendingPayments,
      overdueBills,
      recentTransactions: formattedTransactions,
    })
  } catch (error) {
    console.error("Accountant dashboard error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
