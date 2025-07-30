
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { VisitorModel } from "@/backend/models/Visitor";
import { verifyToken } from "@/backend/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;
    
    if (!user || user.role !== 'resident') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const visitor = await VisitorModel.findByIdAndUpdate(
      params.id,
      { status: "rejected", approvedBy: user.userId },
      { new: true }
    );

    if (!visitor) {
      return NextResponse.json({ message: "Visitor not found" }, { status: 404 });
    }

    return NextResponse.json(visitor, { status: 200 });
  } catch (error) {
    console.error("Visitor rejection error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
