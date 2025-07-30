
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { verifyToken } from "@/backend/lib/auth";
import { CommunityPostModel } from "@/backend/models/CommunityPost";
import mongoose from "mongoose";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const postId = params.id;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ message: "Comment content is required" }, { status: 400 });
    }

    const post = await CommunityPostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const comment = {
      authorId: new mongoose.Types.ObjectId(user.userId),
      content,
      createdAt: new Date(),
    };

    post.comments.push(comment as any);
    await post.save();

    return NextResponse.json(comment, { status: 201 });

  } catch (error) {
    console.error("Comment post error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
