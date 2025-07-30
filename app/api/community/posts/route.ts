

import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { verifyToken } from "@/backend/lib/auth";
import { CommunityPostModel } from "@/backend/models/CommunityPost";
import { UserModel } from "@/backend/models/User";
import mongoose from "mongoose";

// GET all community posts
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    const posts = await CommunityPostModel.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: 'comments.authorId',
        select: 'name'
      })
      .lean();

    const populatedPosts = await Promise.all(
        posts.map(async (post) => {
            const author = await UserModel.findById(post.authorId).select('name role avatar').lean();
            
            const formattedComments = await Promise.all(post.comments.map(async (comment) => {
              const commentAuthor = await UserModel.findById(comment.authorId).select('name avatar').lean();
              return {
                ...comment,
                _id: (comment as any)._id.toString(),
                authorName: commentAuthor?.name || 'Unknown',
                authorImage: commentAuthor?.avatar
              }
            }));

            return {
                ...post,
                _id: post._id.toString(),
                authorName: author?.name || 'Unknown User',
                authorImage: author?.avatar,
                authorRole: author?.role || 'Resident',
                likedByCurrentUser: user ? post.likes.some(likeId => likeId.toString() === user.userId) : false,
                comments: formattedComments,
            }
        })
    );

    return NextResponse.json(populatedPosts, { status: 200 });
  } catch (error) {
    console.error("Community posts GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


// POST a new community post
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    
    const { content, category, mediaUrl, eventType, eventDate, eventTime, eventLocation, pollOptions, hashtags } = body;

    if (!content || !category) {
        return NextResponse.json({ message: "Content and category are required" }, { status: 400 });
    }
    
    const resident = await UserModel.findById(user.userId);
    if (!resident) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const newPostData: any = {
      content,
      category,
      mediaUrl,
      hashtags,
      authorId: user.userId,
      siteId: resident.siteId,
    };
    
    if (category === 'event') {
        newPostData.eventType = eventType;
        newPostData.eventDate = eventDate;
        newPostData.eventTime = eventTime;
        newPostData.eventLocation = eventLocation;
    }
    
    if (category === 'poll' && pollOptions) {
        newPostData.pollOptions = pollOptions.map((opt: { text: string }) => ({ text: opt.text, voters: [] }));
    }

    const newPost = new CommunityPostModel(newPostData);

    await newPost.save();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Community post POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
