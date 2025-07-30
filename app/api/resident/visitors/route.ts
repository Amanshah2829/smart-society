
import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { VisitorModel } from "@/backend/models/Visitor";
import { verifyToken } from "@/backend/lib/auth";
import { UserModel } from "@/backend/models/User";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'resident') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    await dbConnect();

    const resident = await UserModel.findById(user.userId);
    if (!resident) {
        return NextResponse.json({ message: "Resident not found" }, { status: 404 });
    }

    const visitors = await VisitorModel.find({ flatNumber: resident.flatNumber }).sort({ checkInTime: -1 });
    return NextResponse.json(visitors, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
