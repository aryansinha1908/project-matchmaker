import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectToDB from "@/lib/db";
import { User } from "@/models/user";
import { Membership } from "@/models/membership";
import { Project } from "@/models/project";

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

    const activeProjects = await Project.find({
      _id: { $in: projectIds },
      status: { $in: ["recruiting", "active"] },
    });

    const completedProjects = await Project.find({
      _id: { $in: projectIds },
      status: "completed",
    });

    return NextResponse.json({
      profile: {
        avatar: user.avatar,
        username: user.githubUsername,
        bio: user.bio,
        status: user.status,
      },
      projects: {
        active: activeProjects,
        completed: completedProjects,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
