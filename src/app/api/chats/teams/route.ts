import connectToDB from "@/lib/db";
import { Conversation } from "@/models/conversation";
import { Project } from "@/models/project";
import { Membership } from "@/models/membership";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json(
        { message: "Project ID required" },
        { status: 400 },
      );
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    // 1. Verify the current user is actually allowed to be in this group chat
    const isOwner = project.owner.toString() === currentUser._id.toString();
    const membership = await Membership.findOne({
      project: projectId,
      user: currentUser._id,
    });

    if (!isOwner && !membership) {
      return NextResponse.json(
        { message: "You are not a member of this project" },
        { status: 403 },
      );
    }

    // 2. Find the existing team chat
    let groupChat = await Conversation.findOne({
      projectId: project._id,
      isGroupChat: true,
    });

    if (groupChat) {
      // If it exists, ensure the current user is in it (in case they joined after it was created)
      const isAlreadyMember = groupChat.participants.some(
        (id) => id.toString() === currentUser._id.toString(),
      );

      if (!isAlreadyMember) {
        groupChat.participants.push(currentUser._id);
        await groupChat.save();
      }
    } else {
      // 3. If it doesn't exist, forcefully create it and pull ALL current members into it!
      const allMemberships = await Membership.find({ project: project._id });
      const participantIds = [
        project.owner,
        ...allMemberships.map((m) => m.user),
      ];

      groupChat = await Conversation.create({
        isGroupChat: true,
        groupName: `${project.title} Team`,
        projectId: project._id,
        participants: participantIds,
        lastMessage: "Team chat created!",
      });
    }

    return NextResponse.json({ conversation: groupChat }, { status: 200 });
  } catch (error) {
    console.error("Team Chat Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
