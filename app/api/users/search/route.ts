import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { UserModel } from "@/backend/models/User";
import { verifyToken } from "@/backend/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const currentUser = token ? verifyToken(token) : null;
    if (!currentUser) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    await dbConnect();

    // Find users whose name matches the query and are not the current user.
    // Removed role restriction to allow chatting with admin, accountant etc.
    const searchQuery: any = {
      _id: { $ne: currentUser.userId }
    };
    
    if (query) {
      searchQuery.name = { $regex: query, $options: "i" };
    }

    const users = await UserModel.find(searchQuery).select("name flatNumber avatar role").limit(20);

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}