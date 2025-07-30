
import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { AnnouncementModel } from "@/backend/models/Announcement";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const announcements = await AnnouncementModel.find({
        targetRoles: { $in: ['resident', 'all'] },
        isActive: true,
         $or: [
            { expiryDate: { $exists: false } },
            { expiryDate: { $gt: new Date() } }
        ]
    }).sort({ createdAt: -1 });
    return NextResponse.json(announcements, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
