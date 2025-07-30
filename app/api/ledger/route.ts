
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { LedgerEntryModel } from "@/backend/models/LedgerEntry";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const entries = await LedgerEntryModel.find({}).sort({ date: -1 });
    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const newEntry = new LedgerEntryModel(body);
    await newEntry.save();
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
