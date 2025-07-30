import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { UserModel } from "@/backend/models/User";
import { hashPassword } from "@/backend/lib/auth";
import { verifyToken } from "@/backend/lib/auth";

// Get all users (for admin)
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
        const user = token ? verifyToken(token) : null;
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const users = await UserModel.find({ siteId: user.siteId }).select("-password").sort({ createdAt: -1 });
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error("Admin Users GET Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// Create a new user (resident)
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
        const adminUser = token ? verifyToken(token) : null;
        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        const {
            name, email, phone, flatNumber, role = 'resident',
            residencyType, dateOfBirth, password
        } = body;

        if (!name || !email || !phone || !flatNumber || !residencyType || !dateOfBirth || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }
        
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "A user with this email already exists." }, { status: 409 });
        }
        
        const hashedPassword = await hashPassword(password);

        const newUser = new UserModel({
            ...body,
            password: hashedPassword,
            role,
            siteId: adminUser.siteId
        });

        await newUser.save();
        
        // In a real app, you would send a welcome email.

        return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 201 });

    } catch (error) {
        console.error("Admin User POST Error:", error);
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
