import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { UserModel } from "@/backend/models/User";
import { hashPassword } from "@/backend/lib/auth";

// This is a simplified reset password flow.
// In a real app, you'd use a secure, single-use token sent via email.
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json({ message: "Email and new password are required" }, { status: 400 });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      // Don't reveal if the user exists or not for security reasons
      return NextResponse.json({ message: "If a user with that email exists, the password has been reset." }, { status: 200 });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json({ message: "Password has been successfully reset." }, { status: 200 });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
