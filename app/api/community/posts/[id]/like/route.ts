
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
    const userId = new mongoose.Types.ObjectId(user.userId);

    const post = await CommunityPostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const isLiked = post.likes.some(likeId => likeId.equals(userId));

    if (isLiked) {
      // Unlike
      await CommunityPostModel.updateOne({ _id: postId }, { $pull: { likes: userId } });
      return NextResponse.json({ message: "Post unliked" }, { status: 200 });
    } else {
      // Like
      await CommunityPostModel.updateOne({ _id: postId }, { $addToSet: { likes: userId } });
      return NextResponse.json({ message: "Post liked" }, { status: 200 });
    }
  } catch (error) {
    console.error("Like post error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

    
