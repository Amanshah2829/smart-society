import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { UserModel } from "@/backend/models/User";
import { comparePassword, hashPassword, verifyToken } from "@/backend/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current and new passwords are required" }, { status: 400 });
    }

    const dbUser = await UserModel.findById(user.userId);
    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await comparePassword(currentPassword, dbUser.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid current password" }, { status: 401 });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    dbUser.password = hashedNewPassword;
    await dbUser.save();

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
