import connectToDB from "@/lib/db";
import { Project } from "@/models/project";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import { Membership } from "@/models/membership";
import { User } from "@/models/user";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const email = session.user.email;

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const memberships = await Membership.find({
      user: user._id,
    });

    const projectIds = memberships.map((membership) => membership.project);

    const Projects = await Project.find({ _id: { $in: projectIds } });

    return NextResponse.json({
      Projects,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Projects Not Found" },
      { status: 404 },
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
