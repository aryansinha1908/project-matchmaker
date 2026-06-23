import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  githubId: string;
  githubUsername: string;
  avatar?: string;
  skills: string[];
  status: "available" | "busy" | "looking_for_team" | "looking_for_projects";
  trustScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    githubId: { type: String, required: true, unique: true },
    githubUsername: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    avatar: { type: String },
    skills: [{ type: String }],
    status: {
      type: String,
      enum: ["available", "busy", "looking_for_team", "looking_for_projects"],
      default: "available",
    },
    trustScore: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
