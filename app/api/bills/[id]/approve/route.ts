
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { MaintenanceBillModel } from "@/backend/models/MaintenanceBill";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const updatedBill = await MaintenanceBillModel.findByIdAndUpdate(
      params.id,
      { status: "paid", paymentDate: new Date() },
      { new: true }
    );

    if (!updatedBill) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    // Here you would typically also create a corresponding ledger entry for the credit.
    // For simplicity, this is omitted but would be necessary in a real application.

    return NextResponse.json(updatedBill, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
