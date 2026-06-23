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

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { projectId } = await params;
    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ message: "Failed to fetch project" }, { status: 500 });
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

    const { projectId } = await params;
    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    if (String(project.owner) !== String(user._id)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { title, description, category, requiredSkills, requiredRoles, maxTeamSize, status } =
      await req.json();

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { title, description, category, requiredSkills, requiredRoles, maxTeamSize, status },
      { new: true, runValidators: true, omitUndefined: true },
    );

    return NextResponse.json({ message: "Project updated successfully", project: updatedProject });
  } catch {
    return NextResponse.json({ message: "Failed to update project" }, { status: 500 });
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
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    if (String(project.owner) !== String(user._id)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await project.deleteOne();

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch {
    return NextResponse.json({ message: "Failed to delete project" }, { status: 500 });
  }
}
