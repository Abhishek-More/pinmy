"use client";

import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/stores/useModalStore";
import { PinRequests } from "@/lib/requests/PinRequests";
import { cleanURL, timeAgo } from "@/lib/utils";
import { Typography } from "@/components/typography/Typography";

const editActions = {
  IDLE: "idle",
  SAVING: "saving",
  DELETING: "deleting",
} as const;

type EditAction = (typeof editActions)[keyof typeof editActions];

export const EditPinModal = () => {
  const editPin = useModalStore((s) => s.editPin);
  const closeEditPin = useModalStore((s) => s.closeEditPin);
  const [title, setTitle] = useState("");
  const [action, setAction] = useState<EditAction>(editActions.IDLE);
  const link = editPin?.link ?? "";
  const loading = action !== editActions.IDLE;

  useEffect(() => {
    if (editPin) {
      setTitle(editPin.title);
    }
  }, [editPin]);

  const handleSave = async () => {
    if (!editPin || !title.trim()) return;
    setAction(editActions.SAVING);
    try {
      await PinRequests.update(editPin.uniqueId, {
        title: title.trim(),
        link: link,
      });
      closeEditPin();
    } finally {
      setAction(editActions.IDLE);
    }
  };

  const handleDelete = async () => {
    if (!editPin) return;
    setAction(editActions.DELETING);
    try {
      await PinRequests.delete(editPin.uniqueId);
      closeEditPin();
    } finally {
      setAction(editActions.IDLE);
    }
  };

  const savedAgo = editPin?.createdAt ? timeAgo(editPin.createdAt) : null;

  return (
    <Dialog
      open={!!editPin}
      onOpenChange={(open) => !open && !loading && closeEditPin()}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-lg border-[3px] border-black p-0 sm:max-w-lg"
      >
        {/* Top row: purple tag + close button */}
        <div className="absolute -top-3 right-4 left-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 border-2 border-black bg-[#C77DFF] px-2 py-0.5">
            <div className="h-2 w-2 rounded-sm bg-black" />
            <Typography
              variant="small"
              className="text-xs font-bold tracking-wide uppercase"
            >
              Editing · ENG
            </Typography>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closeEditPin}
            disabled={loading}
            className="border-2 border-black bg-white hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 pt-8 pb-6">
          {/* Header */}
          <div className="flex items-baseline justify-between">
            <DialogTitle className="text-xl font-bold">Edit Pin</DialogTitle>
            <Typography variant="muted" className="text-xs">
              // {savedAgo ? ` saved ${savedAgo} ago` : ""}
            </Typography>
          </div>

          {/* Dashed separator */}
          <div className="mt-3 border-t-2 border-dashed border-gray-300" />

          {/* Title field */}
          <div className="mt-5 flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wide uppercase">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pin title"
              className="h-11 px-3 text-sm"
            />
          </div>

          {/* Link field */}
          <div className="mt-4 flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <label className="text-xs font-bold tracking-wide uppercase">
                Link
              </label>
              <Typography variant="muted" className="text-xs">
                {link ? cleanURL(link) : ""}
              </Typography>
            </div>
            <Input
              value={link}
              readOnly
              className="text-muted-foreground h-11 cursor-default px-3 text-sm"
            />
          </div>

          {/* Dashed separator */}
          <div className="mt-6 border-t-2 border-dashed border-gray-300" />

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={loading}
              className="border-2 border-pink-400 px-4 py-2 text-xs font-bold tracking-wide text-pink-500 uppercase hover:bg-pink-50"
            >
              <X className="h-3 w-3" />
              {action === editActions.DELETING ? "Deleting" : "Delete Pin"}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={closeEditPin}
                disabled={loading}
                className="border-2 border-black px-4 py-2 text-xs font-bold tracking-wide uppercase hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                onClick={handleSave}
                disabled={!title.trim() || loading}
                className="border-2 border-black bg-yellow-400 px-4 py-2 text-xs font-bold tracking-wide text-black uppercase hover:bg-yellow-300"
              >
                <Check className="h-3 w-3" />
                {action === editActions.SAVING ? "Saving" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
