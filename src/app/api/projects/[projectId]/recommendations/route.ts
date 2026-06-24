import connectToDB from "@/lib/db";
import { Project } from "@/models/project";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

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

    const candidates = await User.find({
      status: { $in: ["available", "looking_for_team"] },
    }).limit(20);

    const filteredCandidates = candidates.filter(
      (u) => u._id.toString() !== project.owner.toString(),
    );

    const aiCandidates = filteredCandidates.map((user) => ({
      userId: user._id.toString(),
      username: user.githubUsername,
      skills: user.skills,
      trustScore: user.trustScore,
      status: user.status,
    }));

    const aiProject = {
      title: project.title,
      description: project.description,
      requiredSkills: project.requiredSkills,
      requiredRoles: project.requiredRoles,
      category: project.category,
    };

    const prompt = `
        You are an AI recruiter.
        
        Match candidates to this software project.
        
        Scoring criteria:
        - Skill overlap (40%)
        - Role fit (25%)
        - Trust score (20%)
        - Availability (15%)
        
        PROJECT:
        ${JSON.stringify(aiProject, null, 2)}
        
        CANDIDATES:
        ${JSON.stringify(aiCandidates, null, 2)}
        
        Return ONLY valid JSON:
        [
          {
            "userId": "mongodb id",
            "score": 95,
            "reason": "Good React and backend experience"
          }
        ]
        
        Return top 5 only.
        `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text ?? "";

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const recommendations = JSON.parse(cleaned);

    const enrichedRecommendations = recommendations.map((rec: any) => {
      const user = filteredCandidates.find(
        (u) => u._id.toString() === rec.userId,
      );

      return {
        userId: rec.userId,
        score: rec.score,
        reason: rec.reason,
        githubUsername: user?.githubUsername || "Unknown Developer",
        avatar: user?.avatar || "",
        skills: user?.skills || [],
        status: user?.status || "available",
      };
    });

    return NextResponse.json({
      recommendations: enrichedRecommendations,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
