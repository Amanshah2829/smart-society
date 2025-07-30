
import { NextResponse, type NextRequest } from "next/server"
import dbConnect from "@/backend/lib/mongodb"
import { MaintenanceBillModel } from "@/backend/models/MaintenanceBill"
import { ComplaintModel } from "@/backend/models/Complaint"
import { VisitorModel } from "@/backend/models/Visitor"
import { AnnouncementModel } from "@/backend/models/Announcement"
import { verifyToken } from "@/backend/lib/auth"
import { UserModel } from "@/backend/models/User"
import { CommunityPostModel } from "@/backend/models/CommunityPost"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    const user = token ? verifyToken(token) : null

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const resident = await UserModel.findById(user.userId);
    if (!resident) {
      return NextResponse.json({ message: "Resident not found" }, { status: 404 });
    }

    const pendingBills = await MaintenanceBillModel.find({
      residentId: user.userId,
      status: { $in: ["pending", "overdue"] },
    })
      .sort({ dueDate: 1 })
      .lean()

    const myComplaints = await ComplaintModel.find({ residentId: user.userId }).sort({ createdAt: -1 }).limit(5).lean()

    const recentVisitors = await VisitorModel.find({ flatNumber: resident.flatNumber })
      .sort({ checkInTime: -1 })
      .limit(5)
      .lean()

    const announcements = await AnnouncementModel.find({
      targetRoles: { $in: ["resident", "all"] },
      isActive: true,
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gt: new Date() } }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      
    // Fetch upcoming community events
    const communityEventsRaw = await CommunityPostModel.find({
        category: 'event',
        eventDate: { $gte: new Date() }
    }).sort({ eventDate: 1 }).limit(3).lean();

    const communityEvents = await Promise.all(
        communityEventsRaw.map(async (event) => {
            const author = await UserModel.findById(event.authorId).select('name').lean();
            return {
                ...event,
                authorName: author?.name || 'A Resident'
            }
        })
    );
    
    const pendingVisitorApprovals = await VisitorModel.find({
      flatNumber: resident.flatNumber,
      status: "pending"
    }).lean();


    return NextResponse.json({
      pendingBills,
      myComplaints,
      recentVisitors,
      announcements,
      communityEvents,
      pendingVisitorApprovals,
    })
  } catch (error) {
    console.error("Resident dashboard error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
