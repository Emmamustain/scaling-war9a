"use client";

import { use, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Star, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = use(params);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: () =>
      fetchApi(`/feedback/entry/${entryId}`, {
        method: "POST",
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      }),
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to submit feedback"),
  });

  if (submitted) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 text-center">
        <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-success/20">
          <CheckCircle className="size-8 text-success" />
        </div>
        <h2 className="mb-2 text-xl font-bold">Thank You!</h2>
        <p className="mb-6 text-muted-foreground">Your feedback helps us improve.</p>
        <Button asChild>
          <Link href="/discover">Discover More</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold">Rate Your Experience</h1>
      <p className="mb-8 text-center text-muted-foreground">
        How was your experience at this service?
      </p>

      <div className="mb-6 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "size-10 transition-colors",
                star <= (hovered || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30",
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        className="mb-4 w-full resize-none rounded-xl border border-border bg-card p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        rows={4}
        placeholder="Tell us more (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <Button
        className="w-full"
        disabled={rating === 0 || submitMutation.isPending}
        onClick={() => submitMutation.mutate()}
      >
        {submitMutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Submit Feedback"
        )}
      </Button>

      <Button variant="ghost" className="mt-2 w-full" asChild>
        <Link href="/discover">Skip</Link>
      </Button>
    </div>
  );
}
