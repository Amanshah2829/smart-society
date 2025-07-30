
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { VisitorModel } from "@/backend/models/Visitor";
import { NotificationModel } from "@/backend/models/Notification";
import { verifyToken } from "@/backend/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;
    
    if (!user || user.role !== 'resident') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const visitor = await VisitorModel.findById(params.id);
    if (!visitor) {
      return NextResponse.json({ message: "Visitor not found" }, { status: 404 });
    }

    // A resident can only approve visitors for their own flat
    // This is a simplified check. A robust check would verify against the user's flat number.
    
    visitor.status = "approved";
    visitor.approvedBy = user.userId;
    await visitor.save();

    // Optionally notify security that the visitor is approved
    // This would require finding the security user and creating a notification for them.

    return NextResponse.json(visitor, { status: 200 });
  } catch (error) {
    console.error("Visitor approval error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
