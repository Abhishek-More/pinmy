"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Typography } from "../typography/Typography";
import { PinSkeleton } from "./PinSkeleton";
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
import { authClient } from "@/lib/clients/auth-browser";
import { samplePins } from "@/lib/constants";
import { PinRequests, type PinWithSnippet } from "@/lib/requests/PinRequests";
import { usePinStore } from "@/lib/stores/usePinStore";

export const PinStream = () => {
  const searchQuery = usePinStore((s) => s.searchQuery);
  const { data: session, isPending } = authClient.useSession();

  const swrKey = session?.user
    ? searchQuery
      ? `/api/pins?q=${encodeURIComponent(searchQuery)}`
      : "/api/pins"
    : null;

  const { data: fetchedPins } = useSWR<PinWithSnippet[]>(
    swrKey,
    PinRequests.list,
  );

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isPending) return;
    const timer = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, [isPending]);

  const isLoading = !timedOut && (isPending || (session?.user && !fetchedPins));
  const pins = isLoading ? null : (fetchedPins ?? samplePins);
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
      <div className="flex flex-col gap-4">
        {pins
          ? pins.map((pin) => (
              <div key={pin.uniqueId}>
                <Pin pin={pin} />
              </div>
            ))
          : Array.from({ length: 2 }).map((_, i) => (
              <PinSkeleton key={`skeleton-${i}`} />
            ))}
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
