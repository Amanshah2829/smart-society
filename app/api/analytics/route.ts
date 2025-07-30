
import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { MaintenanceBillModel } from "@/backend/models/MaintenanceBill";
import { ComplaintModel } from "@/backend/models/Complaint";
import { VisitorModel } from "@/backend/models/Visitor";
import { subDays, startOfWeek, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const now = new Date();

    // Overview Stats
    const totalRevenue = (await MaintenanceBillModel.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]))[0]?.total || 0;

    const totalComplaints = await ComplaintModel.countDocuments();
    const totalVisitors = await VisitorModel.countDocuments();
    const totalBills = await MaintenanceBillModel.countDocuments();
    const paidBills = await MaintenanceBillModel.countDocuments({ status: 'paid' });
    const collectionRate = totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 0;

    // Revenue section (placeholder data)
    const revenue = [
        { name: 'This Month', amount: 50000 },
        { name: 'Last Month', amount: 45000 },
    ]

    // Complaints by Category
    const complaintsByCategoryRaw = await ComplaintModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const totalComplaintsForPercentage = complaintsByCategoryRaw.reduce((sum, item) => sum + item.count, 0);
    const complaintsByCategory = complaintsByCategoryRaw.map(item => ({
        category: item._id,
        count: item.count,
        percentage: totalComplaintsForPercentage > 0 ? Math.round((item.count / totalComplaintsForPercentage) * 100) : 0
    }))

    // Top 5 Complaints (placeholder data)
    const topComplaints = [
        { issue: 'Water leakage', count: 5 },
        { issue: 'Parking dispute', count: 4 },
        { issue: 'Elevator not working', count: 3 },
        { issue: 'Noise complaint', count: 2 },
        { issue: 'Garbage disposal', count: 1 },
    ];

    // Payment Status
    const pendingBills = await MaintenanceBillModel.countDocuments({ status: 'pending' });
    const overdueBills = await MaintenanceBillModel.countDocuments({ status: 'overdue' });
    const totalBillsForPercentage = totalBills > 0 ? totalBills : 1;
    
    const paymentStatus = {
        paid: paidBills,
        pending: pendingBills,
        overdue: overdueBills,
        paidPercentage: Math.round((paidBills / totalBillsForPercentage) * 100),
        pendingPercentage: Math.round((pendingBills / totalBillsForPercentage) * 100),
        overduePercentage: Math.round((overdueBills / totalBillsForPercentage) * 100),
    }

    // Weekly Visitor Trends
    const startOfThisWeek = startOfWeek(now);
    const visitorTrends = [];
    for(let i=0; i < 7; i++) {
        const day = new Date(startOfThisWeek);
        day.setDate(day.getDate() + i);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const count = await VisitorModel.countDocuments({
            checkInTime: { $gte: day, $lt: nextDay }
        });
        visitorTrends.push({ day: format(day, 'EEE'), count });
    }

    const analyticsData = {
      overview: {
        totalRevenue,
        revenueGrowth: 5, // Placeholder
        totalComplaints,
        complaintsGrowth: -2, // Placeholder
        totalVisitors,
        visitorsGrowth: 10, // Placeholder
        collectionRate,
      },
      revenue,
      complaintsByCategory,
      topComplaints,
      paymentStatus,
      visitorTrends,
    };

    return NextResponse.json(analyticsData, { status: 200 });

  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
