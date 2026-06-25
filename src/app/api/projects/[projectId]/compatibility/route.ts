import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import connectToDB from "@/lib/db";
import { User } from "@/models/user"; // Adjust path if needed

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { userProfile, projectDetails } = await req.json();

    if (!userProfile?.email || !projectDetails) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 },
      );
    }

    // 1. Connect to DB and fetch the REAL user data using the email from the session
    await connectToDB();
    const dbUser = await User.findOne({ email: userProfile.email });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 },
      );
    }

    // 2. Build the prompt with ACTUAL user skills and bio
    const prompt = `
      You are an expert technical recruiter matching developers to projects.
      Analyze the user's profile against the project's requirements.
      
      USER PROFILE:
      GitHub Username: ${dbUser.githubUsername || "Unknown"}
      Bio: ${dbUser.bio || "No bio provided"}
      Skills: ${dbUser.skills && dbUser.skills.length > 0 ? dbUser.skills.join(", ") : "No specific skills listed"}

      PROJECT DETAILS:
      Title: ${projectDetails.title}
      Description: ${projectDetails.description}
      Required Skills: ${projectDetails.requiredSkills?.join(", ") || "None specified"}
      Required Roles: ${projectDetails.requiredRoles?.join(", ") || "None specified"}

      Return a JSON object EXACTLY in this format:
      {
        "overallScore": <number 0-100>,
        "skillMatch": <number 0-100>,
        "roleMatch": <number 0-100>,
        "summary": "<A 2-sentence explanation directly to the user about their fit>"
      }
    `;

    // 3. Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text as any);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Gemini Matchmaking Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate compatibility" },
      { status: 500 },
    );
  }
}
