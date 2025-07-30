import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { UserModel } from "@/backend/models/User";
import { hashPassword } from "@/backend/lib/auth";
import { verifyToken } from "@/backend/lib/auth";

// Update a user's details
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value;
    const adminUser = token ? verifyToken(token) : null;
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { password, ...updateData } = body;

    if (password) {
      updateData.password = await hashPassword(password);
    }
    
    updateData.updatedAt = new Date();

    const updatedUser = await UserModel.findByIdAndUpdate(params.id, updateData, { new: true }).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated successfully", user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Admin User PUT Error:", error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
