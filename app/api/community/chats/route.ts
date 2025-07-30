

import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { verifyToken } from "@/backend/lib/auth";
import { ChatModel } from "@/backend/models/Chat";
import { UserModel } from "@/backend/models/User";
import mongoose from "mongoose";

// Get all chats for the current user
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const chats = await ChatModel.find({ members: user.userId })
      .populate('members', 'name email avatar')
      .sort({ lastMessageAt: -1 })
      .lean();

    return NextResponse.json(chats, { status: 200 });
  } catch (error) {
    console.error("Get chats error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Create a new one-on-one chat
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
        const user = token ? verifyToken(token) : null;
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { memberId } = await request.json();
        if (!memberId) return NextResponse.json({ message: "Member ID is required" }, { status: 400 });

        if (memberId === user.userId) return NextResponse.json({ message: "Cannot create chat with yourself" }, { status: 400 });
        
        await dbConnect();

        // Check if chat already exists
        const existingChat = await ChatModel.findOne({
            isGroup: false,
            members: { $all: [user.userId, memberId] }
        }).populate('members', 'name email avatar');

        if(existingChat) {
            return NextResponse.json(existingChat, { status: 200 });
        }
        
        const newChat = new ChatModel({
            isGroup: false,
            members: [user.userId, memberId],
            messages: [],
        });

        await newChat.save();
        
        const populatedChat = await ChatModel.findById(newChat._id).populate('members', 'name email avatar').lean();

        return NextResponse.json(populatedChat, { status: 201 });

    } catch (error) {
        console.error("Create chat error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
