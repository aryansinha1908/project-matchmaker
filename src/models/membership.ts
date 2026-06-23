import mongoose, { Model, Document } from "mongoose";

export interface IMembership extends Document {
  user: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  role: "owner" | "member";
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    role: {
      type: String,
      enum: ["owner", "member"],
      default: "member",
    },
  },
  { timestamps: true },
);

membershipSchema.index({ user: 1, project: 1 }, { unique: true });

export const Membership: Model<IMembership> =
  mongoose.models.Membership ||
  mongoose.model<IMembership>("Membership", membershipSchema);
