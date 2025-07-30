
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { MaintenanceBillModel } from "@/backend/models/MaintenanceBill";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await dbConnect();
    const { paymentMethod } = await request.json();
    
    // For a real app, 'card' would integrate with a payment gateway.
    // 'upi' and 'cash' require manual confirmation.
    const newStatus = paymentMethod === 'card' ? 'paid' : 'pending_confirmation';

    const updateData: any = {
      status: newStatus,
      paymentMethod,
    };

    if (newStatus === 'paid') {
      updateData.paymentDate = new Date();
      // In a real scenario, this ID would come from the payment gateway.
      updateData.paymentId = `PAY${Date.now()}`;
    }

    const updatedBill = await MaintenanceBillModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedBill) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBill, { status: 200 });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
