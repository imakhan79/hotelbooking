"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BookRoomButton() {
  return (
    <Button
      size="sm"
      className="w-fit"
      onClick={() => toast("Booking opens with the booking engine in Phase 4.")}
    >
      Book this room
    </Button>
  );
}
