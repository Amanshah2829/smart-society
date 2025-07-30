
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { AnnouncementModel } from "@/backend/models/Announcement";
import { verifyToken } from "@/backend/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const announcements = await AnnouncementModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json(announcements, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    await dbConnect();
    const body = await request.json();
    const newAnnouncement = new AnnouncementModel({
      ...body,
      authorId: user.id
    });
    await newAnnouncement.save();
    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

    