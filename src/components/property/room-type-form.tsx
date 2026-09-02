"use client";

import { useActionState, useRef, useEffect } from "react";
import type { ActionState } from "@/app/host/properties/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: ActionState = {};

export function RoomTypeForm({
  action,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a room type</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="roomName">Room name</Label>
              <Input id="roomName" name="name" required placeholder="Deluxe King" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="maxGuests">Max guests</Label>
              <Input id="maxGuests" name="maxGuests" type="number" min={1} defaultValue={2} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bedConfig">Bed configuration</Label>
              <Input id="bedConfig" name="bedConfig" placeholder="1 King bed" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sizeSqm">Room size (m²)</Label>
              <Input id="sizeSqm" name="sizeSqm" type="number" min={1} step="0.1" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="view">View</Label>
              <Input id="view" name="view" placeholder="City view" />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="roomDescription">Description</Label>
              <Textarea id="roomDescription" name="description" rows={3} />
            </div>
            <Label className="flex items-center gap-2 text-sm font-normal">
              <Checkbox name="smokingAllowed" value="true" />
              Smoking allowed
            </Label>
            <Label className="flex items-center gap-2 text-sm font-normal">
              <Checkbox name="accessible" value="true" />
              Accessible
            </Label>
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-fit" disabled={pending}>
            {pending ? "Adding..." : "Add room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
