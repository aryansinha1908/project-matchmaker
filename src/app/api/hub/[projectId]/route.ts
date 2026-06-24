import connectToDB from "@/lib/db";
import { Task, Expense, Resource } from "@/models/hub";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all Hub Data for a specific project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    await connectToDB();

    // Run all 3 database queries simultaneously for maximum speed
    const [tasks, expenses, resources] = await Promise.all([
      Task.find({ project: projectId }),
      Expense.find({ project: projectId }),
      Resource.find({ project: projectId }),
    ]);

    return NextResponse.json({ tasks, expenses, resources }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching hub data" },
      { status: 500 },
    );
  }
}

// POST: Create a new Task, Expense, or Resource
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const { type, data } = await req.json();

    await connectToDB();

    let result;
    if (type === "task")
      result = await Task.create({ project: projectId, ...data });
    else if (type === "expense")
      result = await Expense.create({ project: projectId, ...data });
    else if (type === "resource")
      result = await Resource.create({ project: projectId, ...data });
    else return NextResponse.json({ message: "Invalid type" }, { status: 400 });

    return NextResponse.json({ doc: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating document" },
      { status: 500 },
    );
  }
}

// PATCH: Update an existing document (e.g., drag and drop task status)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, id, data } = body;

    await connectToDB();

    let result;
    if (type === "task") {
      result = await Task.findByIdAndUpdate(id, data, { new: true });
    }

    return NextResponse.json({ doc: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating document" },
      { status: 500 },
    );
  }
}
