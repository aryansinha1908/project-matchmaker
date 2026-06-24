import connectToDB from "@/lib/db";
import { Membership } from "@/models/membership";
import { Project } from "@/models/project";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// ─── GET /api/memberships ────────────────────────────────────────────────────
// ?projectId=<id>  → memberships for that project (owner/member view)
// (no param)       → memberships the current user belongs to
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const projectId = req.nextUrl.searchParams.get("projectId");

    if (projectId) {
      const memberships = await Membership.find({
        project: projectId,
      }).populate("user", "githubUsername avatar email");

      console.log(memberships);
      return NextResponse.json({ memberships }, { status: 200 });
    }

    const memberships = await Membership.find({});

    return NextResponse.json({ memberships }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch memberships" },
      { status: 500 },
    );
  }
}

// ─── POST /api/memberships ───────────────────────────────────────────────────
// Body: { projectId, newUser }
// Only the project owner may add members directly.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { projectId, newUser } = body;

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { message: "Project does not exist" },
        { status: 404 },
      );
    }

    if (String(project.owner) !== String(user._id)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const membership = await Membership.create({
      user: newUser,
      project: project._id,
      role: "member",
    });

    return NextResponse.json(
      { message: "Membership created successfully", membership },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create membership" },
      { status: 400 },
    );
  }
}
