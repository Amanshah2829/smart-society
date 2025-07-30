
import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { ComplaintModel } from "@/backend/models/Complaint";
import { verifyToken } from "@/backend/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'resident') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    await dbConnect();
    const complaints = await ComplaintModel.find({ residentId: user.userId }).sort({ createdAt: -1 });
    return NextResponse.json(complaints, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
