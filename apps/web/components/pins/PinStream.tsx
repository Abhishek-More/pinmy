"use client";

import { useState } from "react";
import useSWR from "swr";
import { Typography } from "../typography/Typography";
import { PinSkeleton } from "./PinSkeleton";
import { Pin } from "./Pin";
import { EmptyState } from "./EmptyState";
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
import { PinRequests, type PinWithSnippet } from "@/lib/requests/PinRequests";
import { usePinStore } from "@/lib/stores/usePinStore";

export const PinStream = () => {
  const searchQuery = usePinStore((s) => s.searchQuery);
  const selectedCategory = usePinStore((s) => s.selectedCategory);
  const view = usePinStore((s) => s.view);

  const swrKey = searchQuery
    ? `/api/pins?q=${encodeURIComponent(searchQuery)}`
    : "/api/pins";

  const { data: fetchedPins, error: fetchError } = useSWR<PinWithSnippet[]>(
    swrKey,
    PinRequests.list,
    // ponytail: poll only while something is still processing; otherwise mutations revalidate.
    { refreshInterval: (data) => (data?.some((p) => p.status === "PROCESSING") ? 5000 : 0) },
  );

  const allPins = fetchedPins ?? (fetchError ? [] : null);
  const scoped = allPins?.filter((p) => {
    if (view === "places") return p.latitude != null;
    if (view === "videos") return p.durationSec != null;
    return p.latitude == null && p.durationSec == null;
  });
  const pins =
    scoped && view === "pins" && selectedCategory
      ? scoped.filter((p) => (p.category ?? "Other") === selectedCategory)
      : scoped;
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
      <div className="flex flex-col gap-4 pt-4">
        {pins
          ? pins.length > 0
            ? pins.map((pin) => (
                <div key={pin.uniqueId}>
                  <Pin pin={pin} />
                </div>
              ))
            : !searchQuery && !selectedCategory && <EmptyState />
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
