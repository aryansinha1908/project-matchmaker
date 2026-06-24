import connectToDB from "@/lib/db";
import { Conversation } from "@/models/conversation";
import { Message } from "@/models/message";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all messages for a specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const { chatId } = await params;

    // Fetch messages and populate the sender's details
    const messages = await Message.find({ conversationId: chatId })
      .populate("sender", "githubUsername avatar email") // <-- ADDED email here
      .sort({ createdAt: 1 });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Send a new message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
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

    const { chatId } = await params;
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { message: "Message text is required" },
        { status: 400 },
      );
    }

    // 1. Create the new message
    const newMessage = await Message.create({
      conversationId: chatId,
      sender: currentUser._id,
      text: text.trim(),
    });

    // Populate sender info before returning to the frontend
    await newMessage.populate("sender", "githubUsername avatar email"); // <-- ADDED email here

    // 2. Update the parent Conversation's "lastMessage" and "updatedAt"
    // This is what forces the conversation to jump to the top of the "Recent Contacts" sidebar!
    await Conversation.findByIdAndUpdate(chatId, {
      lastMessage: text.trim(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
