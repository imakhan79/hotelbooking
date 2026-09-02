"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approvePropertyAction,
  rejectPropertyAction,
  suspendPropertyAction,
} from "@/app/admin/properties/actions";

export function ModerationActions({ propertyId, status }: { propertyId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {status !== "approved" && (
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await approvePropertyAction(propertyId);
                toast.success("Property approved.");
              })
            }
          >
            Approve
          </Button>
        )}
        {status !== "rejected" && (
          <Button variant="outline" disabled={isPending} onClick={() => setShowReject((v) => !v)}>
            Reject
          </Button>
        )}
        {status !== "suspended" && (
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await suspendPropertyAction(propertyId);
                toast.success("Property suspended.");
              })
            }
          >
            Suspend
          </Button>
        )}
      </div>

      {showReject && (
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Reason for rejection (shown to the host)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            disabled={isPending || reason.trim().length === 0}
            onClick={() =>
              startTransition(async () => {
                await rejectPropertyAction(propertyId, reason.trim());
                toast.success("Property rejected.");
                setShowReject(false);
                setReason("");
              })
            }
          >
            Confirm rejection
          </Button>
        </div>
      )}
    </div>
  );
}
