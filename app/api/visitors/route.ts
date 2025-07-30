
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { VisitorModel } from "@/backend/models/Visitor";
import { UserModel } from "@/backend/models/User";
import { NotificationModel } from "@/backend/models/Notification";
import { BlacklistModel } from "@/backend/models/Blacklist";
import { verifyToken } from "@/backend/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const visitors = await VisitorModel.find({}).sort({ checkInTime: -1 });
    return NextResponse.json(visitors, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;
    
    if (!user || !['security', 'receptionist', 'resident'].includes(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    await dbConnect();
    const body = await request.json();

    // Check if phone number is blacklisted
    const isBlacklisted = await BlacklistModel.findOne({ phone: body.phone });
    if (isBlacklisted) {
      return NextResponse.json({ message: `Visitor with phone number ${body.phone} is blacklisted.` }, { status: 403 });
    }
    
    let status: VisitorType['status'] = "pending";
    let securityId = "N/A";

    if (user.role === 'resident') { // Pre-approved by resident
      status = "pre-approved";
    } else { // Logged by security/receptionist
      securityId = user.name;
    }

    const newVisitor = new VisitorModel({
      ...body,
      checkInTime: new Date(),
      status,
      securityId,
    });

    await newVisitor.save();

    // Notify the resident for approval if not pre-approved
    if (status === 'pending') {
      const resident = await UserModel.findOne({ flatNumber: body.flatNumber });
      if (resident) {
          const notification = new NotificationModel({
              userId: resident._id,
              message: `${body.name} is at the gate. Please approve or reject their entry.`,
              link: '/resident' // Link to the dashboard where they can approve
          });
          await notification.save();
      }
    }
    
    return NextResponse.json(newVisitor, { status: 201 });
  } catch (error) {
    console.error("Visitor log error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
