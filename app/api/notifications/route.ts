
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { NotificationModel } from "@/backend/models/Notification";
import { verifyToken } from "@/backend/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const notifications = await NotificationModel.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    await NotificationModel.updateMany({ userId: user.userId, read: false }, { $set: { read: true } });

    return NextResponse.json({ message: "Notifications marked as read" }, { status: 200 });

  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
