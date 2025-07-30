
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { ComplaintModel } from "@/backend/models/Complaint";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    const updatedComplaint = await ComplaintModel.findByIdAndUpdate(params.id, { ...body, updatedAt: new Date() }, { new: true });
    if (!updatedComplaint) {
      return NextResponse.json({ message: "Complaint not found" }, { status: 404 });
    }
    return NextResponse.json(updatedComplaint, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

    