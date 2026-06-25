import mongoose, { Document, Model } from "mongoose";

export interface IReview extends Document {
  project: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  scores: {
    communication: number;
    technicalSkills: number;
    reliability: number;
    teamwork: number;
  };
  averageScore: number;
  feedback?: string;
  createdAt: Date;
}

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scores: {
      communication: { type: Number, required: true, min: 1, max: 10 },
      technicalSkills: { type: Number, required: true, min: 1, max: 10 },
      reliability: { type: Number, required: true, min: 1, max: 10 },
      teamwork: { type: Number, required: true, min: 1, max: 10 },
    },
    averageScore: { type: Number, required: true },
    feedback: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

// Prevent a user from reviewing the same person twice for the same project
reviewSchema.index({ project: 1, reviewer: 1, reviewee: 1 }, { unique: true });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
