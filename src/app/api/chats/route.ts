import connectToDB from "@/lib/db";
import { Conversation } from "@/models/conversation";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Find the currently logged in user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find all conversations where this user is a participant
    // Populate the participants so the frontend sidebar can display avatars & usernames
    const conversations = await Conversation.find({
      participants: currentUser._id,
    })
      .populate("participants", "githubUsername avatar email")
      .sort({ updatedAt: -1 }); // Sort by newest (recent contacts at the top)

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Create a new chat or return an existing one
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { message: "Target user ID required" },
        { status: 400 },
      );
    }

    // Check if you are trying to message yourself
    if (currentUser._id.toString() === targetUserId) {
      return NextResponse.json(
        { message: "Cannot chat with yourself" },
        { status: 400 },
      );
    }

    // 1. Check if a conversation already exists between these EXACT two users
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUser._id, targetUserId], $size: 2 },
    });

    // 2. If no conversation exists, create a new one!
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUser._id, targetUserId],
        lastMessage: "",
      });
    }

    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
