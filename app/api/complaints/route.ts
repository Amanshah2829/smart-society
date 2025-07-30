
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { ComplaintModel } from "@/backend/models/Complaint";
import { UserModel } from "@/backend/models/User";
import { NotificationModel } from "@/backend/models/Notification";
import { verifyToken } from "@/backend/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const complaints = await ComplaintModel.find({}).sort({ createdAt: -1 });
    
    // For admin, fetch resident names
    const complaintsWithResidentNames = await Promise.all(
        complaints.map(async (complaint) => {
            const resident = await UserModel.findById(complaint.residentId);
            return {
                ...complaint.toObject(),
                residentName: resident ? resident.name : 'Unknown Resident'
            };
        })
    );

    return NextResponse.json(complaintsWithResidentNames, { status: 200 });
  } catch (error) {
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
    const body = await request.json();

    const resident = await UserModel.findById(user.userId);
    if (!resident) {
      return NextResponse.json({ message: "Resident not found" }, { status: 404 });
    }
    
    const newComplaint = new ComplaintModel({
      ...body,
      residentId: user.userId,
      flatNumber: resident.flatNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newComplaint.save();

    // Create notification for admin
    const admins = await UserModel.find({ role: 'admin' });
    for (const admin of admins) {
        const notification = new NotificationModel({
            userId: admin._id,
            message: `New complaint "${newComplaint.title}" from ${resident.flatNumber}.`,
            link: '/admin/complaints'
        });
        await notification.save();
    }

    return NextResponse.json(newComplaint, { status: 201 });
  } catch (error) {
    console.error("Complaint creation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
