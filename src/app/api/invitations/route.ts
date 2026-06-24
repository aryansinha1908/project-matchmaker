import connectToDB from "@/lib/db";
import { Project } from "@/models/project";
import { User } from "@/models/user";
import { Invitation } from "@/models/invitation";
import { Membership } from "@/models/membership";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const invitations = await Invitation.find({
      invitedUser: user._id,
      status: "pending",
    })
      .populate("project", "title")
      .populate("invitedBy", "username email");

    return NextResponse.json({ invitations });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Send a new invitation to a user
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

    const { projectId, invitedUserEmail } = await req.json();

    if (!projectId || !invitedUserEmail) {
      return NextResponse.json(
        { message: "Missing required fields" },
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

    // Security Check: Only the project owner can send invitations
    if (project.owner.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { message: "Forbidden: Not the owner" },
        { status: 403 },
      );
    }

    // Find the user being invited by their ID instead of Email
    const invitedUser = await User.findOne({ email: invitedUserEmail });
    if (!invitedUser) {
      return NextResponse.json(
        { message: "User to invite not found" },
        { status: 404 },
      );
    }

    // Check if they are already in the project
    const existingMembership = await Membership.findOne({
      user: invitedUser._id,
      project: project._id,
    });
    if (existingMembership) {
      return NextResponse.json(
        { message: "User is already in this project" },
        { status: 400 },
      );
    }

    // Create the invitation
    const invitation = await Invitation.create({
      project: project._id,
      invitedUser: invitedUser._id,
      invitedBy: currentUser._id,
      status: "pending",
    });

    return NextResponse.json(
      { message: "Invitation sent!", invitation },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "An invitation to this user already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PATCH: Accept or Decline an invitation
export async function PATCH(req: NextRequest) {
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

    const { invitationId, action } = await req.json(); // action should be "accepted" or "declined"

    if (!invitationId || !["accepted", "declined"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid action or missing ID" },
        { status: 400 },
      );
    }

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 },
      );
    }

    // Security Check: Ensure the current user is the one who was invited
    if (invitation.invitedUser.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    invitation.status = action;
    await invitation.save();

    // If accepted, add them to the team via the Membership model
    if (action === "accepted") {
      await Membership.create({
        user: currentUser._id,
        project: invitation.project,
        role: "member", // Default role for invited members
      });
    }

    return NextResponse.json(
      { message: `Invitation ${action}` },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
