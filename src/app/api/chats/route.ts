import connectToDB from "@/lib/db";
import { Conversation } from "@/models/conversation";
import { User } from "@/models/user";
import { Project } from "@/models/project"; // Required to populate the project title
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all conversations for the sidebar
export async function GET(req: NextRequest) {
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

    const conversations = await Conversation.find({
      participants: currentUser._id,
    })
      .populate("participants", "githubUsername avatar email")
      .populate("projectId", "title") // <--- NEW: Grab the project title for the UI
      .sort({ updatedAt: -1 });

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Create a Project-Specific 1-on-1 Chat
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

    // NEW: We now accept projectId from the frontend
    const { targetUserId, projectId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { message: "Target user ID required" },
        { status: 400 },
      );
    }

    if (currentUser._id.toString() === targetUserId) {
      return NextResponse.json(
        { message: "Cannot chat with yourself" },
        { status: 400 },
      );
    }

    // 1. Build a strict query. It MUST match the participants AND the specific project.
    let query: any = {
      participants: { $all: [currentUser._id, targetUserId], $size: 2 },
      isGroupChat: { $ne: true }, // Ensure we don't accidentally grab the Team Chat
    };

    if (projectId) {
      query.projectId = projectId;
    } else {
      query.projectId = { $exists: false }; // Standard 1-on-1 chat with no project attached
    }

    let conversation = await Conversation.findOne(query);

    // 2. If it doesn't exist for THIS specific project, create a new one!
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUser._id, targetUserId],
        projectId: projectId || undefined,
        lastMessage: "",
        isGroupChat: false,
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
