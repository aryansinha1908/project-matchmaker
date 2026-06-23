import mongoose, { Model, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email?: string;
  githubId: string;
  githubUsername: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  status: "available" | "busy" | "looking_for_team" | "looking_for_projects";
  trustScore: number;
  profileReadme?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
    },
    githubUsername: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    profileReadme: { type: String, default: "" },

    skills: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["available", "busy", "looking_for_team", "looking_for_projects"],
      default: "available",
    },

    trustScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true },
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
