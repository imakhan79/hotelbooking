"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { archivePropertyAction, submitForReviewAction } from "@/app/host/properties/actions";

export function PropertyLifecycleActions({
  propertyId,
  status,
}: {
  propertyId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (status === "draft" || status === "rejected") {
    return (
      <Button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await submitForReviewAction(propertyId);
              toast.success("Submitted for review.");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to submit");
            }
          })
        }
      >
        {isPending ? "Submitting..." : "Submit for review"}
      </Button>
    );
  }

  if (status === "pending" || status === "approved") {
    return (
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await archivePropertyAction(propertyId);
            toast.success("Listing archived.");
          })
        }
      >
        {isPending ? "Archiving..." : "Archive listing"}
      </Button>
    );
  }

  return null;
}
