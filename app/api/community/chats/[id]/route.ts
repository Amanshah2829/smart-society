

import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { verifyToken } from "@/backend/lib/auth";
import { ChatModel } from "@/backend/models/Chat";
import { NotificationModel } from "@/backend/models/Notification";
import mongoose from "mongoose";

// Get a specific chat with messages
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const chat = await ChatModel.findById(params.id)
      .populate('members', 'name avatar')
      .populate({
        path: 'messages.senderId',
        select: 'name avatar',
        model: 'User' 
      })
      .lean();

    if (!chat) return NextResponse.json({ message: "Chat not found" }, { status: 404 });

    if (!chat.members.some((member: any) => member._id.equals(user.userId))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error("Get chat error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Send a message to a chat
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = request.cookies.get("token")?.value;
        const user = token ? verifyToken(token) : null;
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { content, type = 'text', mediaUrl, fileSize } = await request.json();
        if (!content) return NextResponse.json({ message: "Content is required" }, { status: 400 });

        await dbConnect();
        
        const chat = await ChatModel.findById(params.id);
        if (!chat) return NextResponse.json({ message: "Chat not found" }, { status: 404 });
        
        const memberObjectIds = chat.members.map(id => new mongoose.Types.ObjectId(id.toString()));
        
        if (!memberObjectIds.some((memberId) => memberId.equals(user.userId))) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        
        const message = {
            _id: new mongoose.Types.ObjectId(),
            senderId: new mongoose.Types.ObjectId(user.userId),
            content,
            type,
            mediaUrl,
            fileSize,
            timestamp: new Date(),
            readBy: [new mongoose.Types.ObjectId(user.userId)]
        };

        chat.messages.push(message as any);
        chat.lastMessageAt = new Date();
        await chat.save();
        
        // Create notifications for other members of the chat
        const otherMembers = chat.members.filter(memberId => !memberId.equals(user.userId));
        for (const memberId of otherMembers) {
            const notification = new NotificationModel({
                userId: memberId,
                message: `New message from ${user.name}`,
                link: `/resident/community?view=chat&chatId=${chat._id.toString()}`,
            });
            await notification.save();
        }

        // Populate sender details for the response
        const populatedMessage = {
          ...message,
          senderId: {
            _id: user.userId,
            name: user.name,
            avatar: (user as any).avatar,
          }
        }

        return NextResponse.json(populatedMessage, { status: 201 });
    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
