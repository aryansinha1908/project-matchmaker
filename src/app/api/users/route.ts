import connectToDB from "@/lib/db";
import { Application } from "@/models/application";
import { Invitation } from "@/models/invitation";
import { Membership } from "@/models/membership";
import { Project } from "@/models/project";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch user profile by githubUsername OR return all users if authenticated
export async function GET(req: NextRequest) {
  try {
    // 1. Extract the query parameter from the URL
    const githubUsername = req.nextUrl.searchParams.get("githubUsername");

    if (githubUsername) {
      await connectToDB();

      const user = await User.findOne({ githubUsername });

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ user }, { status: 200 });
    }

    // 2. Fallback logic: If no query param, check auth and return all users
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { message: "Current user not found" },
        { status: 404 },
      );
    }

    const users = await User.find();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PATCH: Update the currently logged-in user's profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Securely find the currently logged-in user via session email
    const loggedInUser = await User.findOne({ email: session.user.email });

    if (!loggedInUser) {
      return NextResponse.json(
        { message: "Session user not found" },
        { status: 404 },
      );
    }

    // Since we are fetching the user directly from the session,
    // they are guaranteed to only be modifying their own profile.
    const userId = loggedInUser._id;

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

// DELETE: Completely remove the logged-in user and clean up their data
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const loggedInUser = await User.findOne({ email: session.user.email });

    if (!loggedInUser) {
      return NextResponse.json(
        { message: "Session user not found" },
        { status: 404 },
      );
    }

    const userId = loggedInUser._id;

    // --- CASCADING DELETE ---
    // 1. Delete all applications they submitted
    await Application.deleteMany({ applicant: userId });

    // 2. Delete all memberships (teams they were a part of)
    await Membership.deleteMany({ user: userId });

    // 3. Delete all invitations sent to them or by them
    await Invitation.deleteMany({
      $or: [{ invitedUser: userId }, { invitedBy: userId }],
    });

    // 4. Delete all projects they owned
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
