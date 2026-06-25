"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge"; // <--- ADD THIS LINE
import { Loader2, Star, ShieldCheck, CheckCircle2 } from "lucide-react"; // Ensure Badge is NOT in here

type Member = { _id: string; githubUsername: string; avatar?: string };

export function TeamReviews({
  projectId,
  members,
  currentUserId,
}: {
  projectId: string;
  members: Member[];
  currentUserId: string;
}) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [scores, setScores] = useState({
    communication: 10,
    technicalSkills: 10,
    reliability: 10,
    teamwork: 10,
  });
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]); // Track who we already reviewed

  // Filter out the current user (you can't review yourself)
  const reviewableMembers = members.filter((m) => m._id !== currentUserId);

  const handleSubmit = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revieweeId: selectedMember._id,
          scores,
          feedback,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      // Mark as reviewed so the UI updates
      setReviewedIds((prev) => [...prev, selectedMember._id]);
      setSelectedMember(null);
      setScores({
        communication: 10,
        technicalSkills: 10,
        reliability: 10,
        teamwork: 10,
      });
      setFeedback("");
    } catch (error) {
      alert(
        "Failed to submit review. You may have already reviewed this person.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAverage = (
    (scores.communication +
      scores.technicalSkills +
      scores.reliability +
      scores.teamwork) /
    4
  ).toFixed(1);

  return (
    <Card className="border-white/5 bg-black/20 backdrop-blur-md shadow-xl overflow-hidden mt-8">
      <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-inner">
            <Star className="size-4 text-yellow-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-zinc-100">
              Post-Project Reviews
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Rate your teammates to build their Trust Scores.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {!selectedMember ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reviewableMembers.map((member) => {
              const isReviewed = reviewedIds.includes(member._id);
              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-white/10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-300">
                        {member.githubUsername[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold text-zinc-200 truncate max-w-[100px]">
                      @{member.githubUsername}
                    </p>
                  </div>

                  {isReviewed ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    >
                      <CheckCircle2 className="size-3 mr-1" /> Reviewed
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-[#d8b4fe]/10 text-[#d8b4fe] border-[#d8b4fe]/20 hover:bg-[#d8b4fe]/20"
                      onClick={() => setSelectedMember(member)}
                    >
                      Rate
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 border border-white/10">
                  <AvatarImage src={selectedMember.avatar} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-300">
                    {selectedMember.githubUsername[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-zinc-400">Reviewing</p>
                  <p className="text-lg font-bold text-zinc-100">
                    @{selectedMember.githubUsername}
                  </p>
                </div>
              </div>
              <div className="text-center bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                  Net Score
                </p>
                <p className="text-xl font-bold text-[#d8b4fe]">
                  {currentAverage}{" "}
                  <span className="text-sm text-zinc-500">/ 10</span>
                </p>
              </div>
            </div>

            {/* Score Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(scores).map((key) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-zinc-300 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <span className="text-sm font-bold text-[#d8b4fe]">
                      {scores[key as keyof typeof scores]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={scores[key as keyof typeof scores]}
                    onChange={(e) =>
                      setScores({ ...scores, [key]: parseInt(e.target.value) })
                    }
                    className="w-full accent-[#d8b4fe] h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Written Feedback (Optional)
              </label>
              <Textarea
                placeholder="Great to work with, highly recommended!"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-black/40 border-white/10 text-zinc-100 focus-visible:ring-[#d8b4fe]/50 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-white/10 text-zinc-300"
                onClick={() => setSelectedMember(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#c084fc] to-[#d8b4fe] text-black font-bold"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin size-4" />
                ) : (
                  <ShieldCheck className="size-4 mr-2" />
                )}{" "}
                Submit Review
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
