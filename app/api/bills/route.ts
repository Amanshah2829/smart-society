
import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { MaintenanceBillModel } from "@/backend/models/MaintenanceBill";
import { UserModel } from "@/backend/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const bills = await MaintenanceBillModel.find({}).sort({ year: -1, month: -1 });

    const billsWithResidentNames = await Promise.all(
      bills.map(async (bill) => {
        const resident = await UserModel.findById(bill.residentId);
        return {
          ...bill.toObject(),
          residentName: resident ? resident.name : "N/A",
        };
      })
    );
    
    return NextResponse.json(billsWithResidentNames, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch bills:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
