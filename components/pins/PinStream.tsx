"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Typography } from "../typography/Typography";
import { Pin } from "./Pin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { samplePins } from "@/lib/constants";
import { PinRequests, type PinData } from "@/lib/PinRequests";

export const PinStream = () => {
  const { data: session, isPending } = authClient.useSession();
  const { data: fetchedPins, mutate } = useSWR<PinData[]>(
    session?.user ? "/api/pins" : null,
    PinRequests.list,
  );

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isPending) return;
    const timer = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, [isPending]);

  const isLoading = !timedOut && (isPending || (session?.user && !fetchedPins));
  const pins = isLoading ? [] : (fetchedPins ?? samplePins);
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!link.trim()) {
      setError("Please enter a link");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await PinRequests.create({ title: link, link });
      await mutate();
      setLink("");
      setOpen(false);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex h-10 items-center justify-between border-2 border-b-0 border-black pl-4">
        <Typography className="font-semibold">Your Pins</Typography>
        <button
          className="h-full cursor-pointer bg-black px-4 text-white"
          onClick={() => setOpen(true)}
        >
          + NEW
        </button>
      </div>
      <div className="border-2 border-black">
        {isLoading ? (
          <div className="flex items-center gap-4 p-4">
            <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-muted-foreground/40" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted-foreground/20" />
              <div className="h-2 w-1/2 animate-pulse rounded bg-muted-foreground/10" />
            </div>
          </div>
        ) : (
          pins.map((pin, index) => (
            <div
              key={pin.uniqueId}
              className={`border-muted-foreground/60 ${index !== pins.length - 1 ? "border-b-1" : ""}`}
            >
              <Pin pin={pin} />
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Pin</DialogTitle>
            <DialogDescription>
              Paste a link to save it to your pins.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleCreate();
              }}
              autoFocus
            />
            {error && (
              <Typography variant="muted" className="text-red-500">
                {error}
              </Typography>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
