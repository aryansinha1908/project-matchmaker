import connectToDB from "@/lib/db";
import { User } from "@/models/user";
import { Project } from "@/models/project";
import { Membership } from "@/models/membership";
import { Application } from "@/models/application";
import { Invitation } from "@/models/invitation";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch a user's profile with privacy filtering
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    await connectToDB();

    // Resolve dynamic params (Next.js 15 requirement)
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check who is requesting this data
    const session = await getServerSession();
    const isOwner = session?.user?.email === targetUser.email;

    // Convert the Mongoose document to a plain JavaScript object so we can filter it
    let returnedUser = targetUser.toObject();

    // FILTERING: If the requester is a visitor (not the owner of the profile),
    // filter out sensitive fields before sending it to the frontend.
    if (!isOwner) {
      delete returnedUser.email;
      // Add any other private fields here in the future (e.g., delete returnedUser.phone)
    }

    return NextResponse.json({ user: returnedUser, isOwner }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PATCH: Update a user's profile (e.g., bio, status)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    // Securely find the currently logged-in user via session email
    const loggedInUser = await User.findOne({ email: session.user.email });

    if (!loggedInUser) {
      return NextResponse.json(
        { message: "Session user not found" },
        { status: 404 },
      );
    }

    // Security Check: Make sure the person making the request is updating their own profile
    if (loggedInUser._id.toString() !== userId) {
      return NextResponse.json(
        { message: "Forbidden: Cannot update another user's profile" },
        { status: 403 },
      );
    }

    const body = await req.json();

    // Create an object with only the fields we allow the user to update
    const allowedUpdates: any = {};
    if (body.status !== undefined) allowedUpdates.status = body.status;
    if (body.skills !== undefined) allowedUpdates.skills = body.skills;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true },
    );

    return NextResponse.json(
      { message: "Profile updated successfully", user: updatedUser },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "User Could Not Be Updated" },
      { status: 500 },
    );
  }
}

// DELETE: Completely remove a user and clean up their data
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    const loggedInUser = await User.findOne({ email: session.user.email });

    // Security Check: Users can only delete themselves
    if (!loggedInUser || loggedInUser._id.toString() !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // --- CASCADING DELETE ---
    // If a user deletes their account, we must remove all traces of them
    // to prevent broken links and database inconsistencies.

    // 1. Delete all applications they submitted
    await Application.deleteMany({ applicant: userId });

    // 2. Delete all memberships (teams they were a part of)
    await Membership.deleteMany({ user: userId });

    // 3. Delete all invitations sent to them or by them
    await Invitation.deleteMany({
      $or: [{ invitedUser: userId }, { invitedBy: userId }],
    });

    // 4. Delete all projects they owned (and ideally trigger cleanup for those projects too)
    // Note: In a production app, you might want to transfer ownership to another team member instead.
    await Project.deleteMany({ owner: userId });

    // 5. Finally, delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json(
      { message: "User account and all associated data deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Internal Server Error while deleting user" },
      { status: 500 },
    );
  }
}
