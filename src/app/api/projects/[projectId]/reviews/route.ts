import connectToDB from "@/lib/db";
import { Review } from "@/models/review";
import { User } from "@/models/user";
import { Project } from "@/models/project";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const currentUser = await User.findOne({ email: session.user.email });

    if (!currentUser) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }

    const { projectId } = await params;
    const { revieweeId, scores, feedback } = await req.json();

    // 1. Verify the project is actually completed
    const project = await Project.findById(projectId);
    if (!project || project.status !== "completed") {
      return NextResponse.json(
        { message: "Reviews can only be submitted for completed projects." },
        { status: 400 },
      );
    }

    if (currentUser._id.toString() === revieweeId) {
      return NextResponse.json(
        { message: "You cannot review yourself." },
        { status: 400 },
      );
    }

    // 2. Calculate the average score for this specific review
    const averageScore =
      (scores.communication +
        scores.technicalSkills +
        scores.reliability +
        scores.teamwork) /
      4;

    // 3. Save the Review
    await Review.create({
      project: projectId,
      reviewer: currentUser._id,
      reviewee: revieweeId,
      scores,
      averageScore,
      feedback,
    });

    // ==========================================
    // TRUST SCORE RECALCULATION ENGINE
    // ==========================================
    // Find all reviews ever written about this user
    const allUserReviews = await Review.find({ reviewee: revieweeId });

    // Calculate their new lifetime average Trust Score
    const totalLifetimeScore = allUserReviews.reduce(
      (sum, rev) => sum + rev.averageScore,
      0,
    );
    const newTrustScore = Number(
      (totalLifetimeScore / allUserReviews.length).toFixed(1),
    ); // Round to 1 decimal

    // Update the User's profile with the new Trust Score
    await User.findByIdAndUpdate(revieweeId, { trustScore: newTrustScore });

    return NextResponse.json(
      { message: "Review submitted successfully!" },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "You have already reviewed this member for this project." },
        { status: 400 },
      );
    }
    console.error("Review Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
