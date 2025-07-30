
import { NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { MaintenanceBillModel } from "@/backend/models/MaintenanceBill";
import { UserModel } from "@/backend/models/User";
import { NotificationModel } from "@/backend/models/Notification";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { month, year, amount, dueDate } = await request.json();

    if (!month || !year || !amount || !dueDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const residents = await UserModel.find({ role: "resident" });
    let billsCreatedCount = 0;

    for (const resident of residents) {
      // Check if a bill for this month/year already exists for the resident
      const existingBill = await MaintenanceBillModel.findOne({
        residentId: resident._id,
        month,
        year,
      });

      if (!existingBill && resident.flatNumber) {
        const newBill = new MaintenanceBillModel({
          residentId: resident._id,
          flatNumber: resident.flatNumber,
          amount,
          month,
          year,
          dueDate: new Date(dueDate),
          status: "pending",
        });
        await newBill.save();
        
        // Create notification for resident
        const notification = new NotificationModel({
          userId: resident._id,
          message: `New maintenance bill of ₹${amount} generated for ${month}, ${year}.`,
          link: '/resident/bills',
        });
        await notification.save();
        
        billsCreatedCount++;
      }
    }

    return NextResponse.json({ message: "Bills generated successfully", count: billsCreatedCount }, { status: 201 });
  } catch (error) {
    console.error("Bill generation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
