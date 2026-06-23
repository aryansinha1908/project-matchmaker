import connectToDB from "@/lib/db";
import { Project } from "@/models/project";
import { User } from "@/models/user";
import { Application } from "@/models/application";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";

export async function POST(
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
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    if (project.owner.toString() === user._id.toString()) {
      return NextResponse.json(
        { message: "You cannot apply to a project you own" },
        { status: 400 },
      );
    }

    if (project.status !== "recruiting") {
      return NextResponse.json(
        { message: "This project is no longer accepting applications" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { message } = body;

    const application = await Application.create({
      applicant: user._id,
      project: project._id,
      message: message || "",
    });

    return NextResponse.json(
      { message: "Application submitted successfully", application },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Application error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { message: "You have already applied to this project" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Failed to submit application" },
      { status: 500 },
    );
  }
}
