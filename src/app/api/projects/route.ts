import connectToDB from "@/lib/db";
import { Project } from "@/models/project";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import { Membership } from "@/models/membership";
import { Application } from "@/models/application";
import { User } from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const searchParams = req.nextUrl.searchParams;
    const searchQuery = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";
    const categoryFilter = searchParams.get("category") || "all";
    const skillsFilter = searchParams.get("skills") || "";
    const rolesFilter = searchParams.get("roles") || "";

    const dbQuery: any = {};

    if (searchQuery) {
      dbQuery.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    if (statusFilter !== "all") {
      dbQuery.status = statusFilter;
    }

    if (categoryFilter !== "all") {
      dbQuery.category = { $regex: new RegExp(`^${categoryFilter}$`, "i") };
    }

    if (skillsFilter) {
      const skillsArray = skillsFilter
        .split(",")
        .map((s) => new RegExp(s.trim(), "i"));
      dbQuery.requiredSkills = { $in: skillsArray };
    }

    if (rolesFilter) {
      const rolesArray = rolesFilter
        .split(",")
        .map((r) => new RegExp(r.trim(), "i"));
      dbQuery.requiredRoles = { $in: rolesArray };
    }

    const Projects = await Project.find(dbQuery)
      .populate("owner", "name email image")
      .sort({ createdAt: -1 });

    return NextResponse.json({ Projects });
  } catch (error) {
    console.error("Error fetching all projects:", error);
    return NextResponse.json(
      { message: "Projects Not Found" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    const {
      title,
      description,
      category,
      requiredSkills,
      requiredRoles,
      maxTeamSize,
    } = body;

    if (!title || !description || !category || !maxTeamSize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const project = await Project.create({
      owner: user._id,
      title,
      description,
      category,
      requiredSkills,
      requiredRoles,
      maxTeamSize,
      status: "recruiting",
    });

    await Membership.create({
      user: user._id,
      project: project._id,
      role: "owner",
    });

    return NextResponse.json(
      {
        message: "Project created successfully",
        project,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Project Could Not Be Created" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
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

    // Unwrap params for Next.js 15 compatibility
    const resolvedParams = await params;
    const projectId = resolvedParams.projectId;

    // 1. Find the project
    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    // 2. Security Check: Only the owner can delete the project
    if (project.owner.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "Forbidden: You are not the owner of this project" },
        { status: 403 },
      );
    }

    // 3. Cascading Delete: Clean up all related data
    // Delete all memberships tied to this project
    await Membership.deleteMany({ project: projectId });

    // Delete all pending/accepted/rejected applications for this project
    await Application.deleteMany({ project: projectId });

    // Finally, delete the project itself
    await Project.findByIdAndDelete(projectId);

    return NextResponse.json(
      { message: "Project and all associated data deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
