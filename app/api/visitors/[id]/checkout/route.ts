
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { VisitorModel } from "@/backend/models/Visitor";
import { verifyToken } from "@/backend/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;
    
    if (!user || !['security', 'receptionist'].includes(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const visitor = await VisitorModel.findById(params.id);

    if (!visitor) {
      return NextResponse.json({ message: "Visitor not found" }, { status: 404 });
    }

    if (visitor.status !== 'approved' && visitor.status !== 'pre-approved') {
        return NextResponse.json({ message: "Visitor not approved for check-in." }, { status: 403 });
    }

    visitor.status = "checked-in";
    visitor.checkInTime = new Date();
    visitor.securityId = user.name;
    await visitor.save();

    return NextResponse.json(visitor, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
