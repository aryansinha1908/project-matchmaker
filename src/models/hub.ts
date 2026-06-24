import { Schema, model, models } from "mongoose";

const TaskSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["todo", "in_progress", "in_review", "done"],
      default: "todo",
    },
  },
  { timestamps: true },
);

const ExpenseSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    value: { type: Number, required: true },
    color: { type: String, required: true },
  },
  { timestamps: true },
);

const ResourceSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true },
);

export const Task = models.Task || model("Task", TaskSchema);
export const Expense = models.Expense || model("Expense", ExpenseSchema);
export const Resource = models.Resource || model("Resource", ResourceSchema);
