import mongoose, { Model, Document } from "mongoose";

export interface IProject extends Document {
  owner: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  requiredSkills?: string[];
  requiredRoles?: string[];
  status: "recruiting" | "active" | "completed" | "archived";
  maxTeamSize: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    requiredSkills: [
      {
        type: String,
      },
    ],

    requiredRoles: [
      {
        type: String,
      },
    ],

    maxTeamSize: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["recruiting", "active", "completed", "archived"],
      default: "recruiting",
    },
  },
  { timestamps: true },
);

export const Project: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ||
  mongoose.model<IProject>("Project", projectSchema);
