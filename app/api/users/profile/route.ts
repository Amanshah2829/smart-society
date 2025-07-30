
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { UserModel } from "@/backend/models/User";
import { verifyToken } from "@/backend/lib/auth";

// GET current user's profile
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
        const user = token ? verifyToken(token) : null;
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const dbUser = await UserModel.findById(user.userId).select("-password");
        if (!dbUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(dbUser, { status: 200 });
    } catch (error) {
        console.error("Profile GET Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}


// UPDATE current user's profile
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { name, phone, avatar } = body;

    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar; // In a real app, this would be a URL from a storage service

    const updatedUser = await UserModel.findByIdAndUpdate(
      user.userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
