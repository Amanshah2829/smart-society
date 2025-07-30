
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { AnnouncementModel } from "@/backend/models/Announcement";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const announcement = await AnnouncementModel.findById(params.id);
    if (!announcement) {
      return NextResponse.json({ message: "Announcement not found" }, { status: 404 });
    }
    return NextResponse.json(announcement, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    const updatedAnnouncement = await AnnouncementModel.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedAnnouncement) {
      return NextResponse.json({ message: "Announcement not found" }, { status: 404 });
    }
    return NextResponse.json(updatedAnnouncement, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const deletedAnnouncement = await AnnouncementModel.findByIdAndDelete(params.id);
    if (!deletedAnnouncement) {
      return NextResponse.json({ message: "Announcement not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Announcement deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

    