import connectToDB from "@/lib/db";
import { Project } from "@/models/project";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import { Membership } from "@/models/membership";
import { User } from "@/models/user";

export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const searchQuery = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";
    const categoryFilter = searchParams.get("category") || "all";
    const skillsFilter = searchParams.get("skill") || "";
    const roleFilter = searchParams.get("role") || "";

    const memberships = await Membership.find({ user: user._id });
    const projectIds = memberships.map((membership) => membership.project);

    const dbQuery: any = { _id: { $in: projectIds } };

    if (searchQuery) {
      dbQuery.$or = [
        { title: { $regex: searchQuery, $options: "i" } }, // 'i' means case-insensitive
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

    if (roleFilter) {
      dbQuery.requiredRoles = { $regex: roleFilter, $options: "i" };
    }

    const Projects = await Project.find(dbQuery).sort({ createdAt: -1 });

    return NextResponse.json({ Projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
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
