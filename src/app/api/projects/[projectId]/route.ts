import connectToDB from "@/lib/db";
import { Project } from "@/models/project";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await getServerSession();

    await connectToDB();

    const { projectId } = await params;
    const project = await Project.findById(projectId).populate(
      "owner",
      "githubUsername email avatar",
    );

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    if (!session) {
      return NextResponse.json({
        project,
        isOwner: false,
      });
    }

    return NextResponse.json({
      project,
      isOwner: (project.owner as any).email === session.user.email,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
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

    const { projectId } = await params;
    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    if (String(project.owner) !== String(user._id)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await project.deleteOne();

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete project" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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

    const resolvedParams = await params;
    const projectId = resolvedParams.projectId;

    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    // Security Check: Only the owner can edit the project
    if (project.owner.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "Forbidden: You are not the owner of this project" },
        { status: 403 },
      );
    }

    const body = await req.json();

    // Update the allowed fields
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        title: body.title,
        description: body.description,
        category: body.category,
        status: body.status,
        maxTeamSize: body.maxTeamSize,
        requiredSkills: body.requiredSkills,
        requiredRoles: body.requiredRoles,
      },
      { new: true, runValidators: true }, // Returns the updated document
    );

    return NextResponse.json(
      { message: "Project updated successfully", project: updatedProject },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
