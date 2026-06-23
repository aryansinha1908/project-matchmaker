import connectToDB from "@/lib/db";
import { Membership } from "@/models/membership";
import { Project } from "@/models/project";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
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

    const memberships = await Membership.find({ user: user._id });

    return NextResponse.json({ memberships }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Memberships Not Found" },
      { status: 404 },
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const { projectId, newUser } = body;

    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json(
        { message: "Project Does not Exist" },
        { status: 400 },
      );
    }

    if (String(project.owner) !== String(user._id)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const membership = await Membership.create({
      user: newUser,
      project: project._id,
      role: "member",
    });

    return NextResponse.json(
      {
        message: "Membership created successfully",
        membership,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Membership Could Not Be Made" },
      { status: 400 },
    );
  }
}
