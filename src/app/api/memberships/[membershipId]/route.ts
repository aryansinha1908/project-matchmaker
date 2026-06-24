import connectToDB from "@/lib/db";
import { Membership } from "@/models/membership";
import { Project } from "@/models/project";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// ─── GET /api/memberships/[membershipId] ────────────────────────────────────
// Returns all memberships for a given project ID.
// The dynamic segment doubles as a projectId for reads and a membershipId
// for deletes — the two operations are distinguished by HTTP method.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { membershipId } = await params;

    const memberships = await Membership.find({
      project: membershipId,
    }).populate("user", "githubUsername email avatar _id");

    return NextResponse.json({ memberships }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch memberships" },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/memberships/[membershipId] ──────────────────────────────────
// Removes a membership. Allowed when the caller is:
//   (a) the project owner removing any non-owner member, OR
//   (b) the member themselves (leaving the project).
//
// In both cases the project owner cannot be removed — that would orphan
// the project. Transfer ownership first before leaving.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Resolve the calling user
    const caller = await User.findOne({ email: session.user.email });
    if (!caller) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { membershipId } = await params;

    // Load the membership and its project in one round-trip
    const membership =
      await Membership.findById(membershipId).populate("project");

    if (!membership) {
      return NextResponse.json(
        { message: "Membership not found" },
        { status: 404 },
      );
    }

    const project = membership.project as InstanceType<typeof Project>;
    const isProjectOwner = String(project.owner) === String(caller._id);
    const isSelf = String(membership.user) === String(caller._id);

    // Guard: neither the project owner nor the member themselves
    if (!isProjectOwner && !isSelf) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Guard: the project owner cannot be removed — transfer ownership first
    if (String(membership.user) === String(project.owner)) {
      return NextResponse.json(
        {
          message:
            "The project owner cannot be removed. Transfer ownership before leaving.",
        },
        { status: 400 },
      );
    }

    await Membership.findByIdAndDelete(membershipId);

    return NextResponse.json(
      { message: "Membership removed successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to remove membership" },
      { status: 500 },
    );
  }
}
