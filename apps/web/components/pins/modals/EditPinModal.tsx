"use client";

import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
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
    <Modal
      open={!!editPin}
      onClose={closeEditPin}
      disabled={loading}
      tag="Editing · ENG"
      tagColor="#C77DFF"
      title="Edit Pin"
      titleRight={
        <Typography variant="muted" className="text-xs">
          // {savedAgo ? ` saved ${savedAgo} ago` : ""}
        </Typography>
      }
    >
      <Modal.Body>
        <div className="mt-5 flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-wide uppercase">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Pin title"
            className="h-11 px-3 text-sm"
          />
        </div>

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
      </Modal.Body>

      <Modal.Footer>
        <Modal.Button variant="danger" onClick={handleDelete} disabled={loading}>
          <X className="h-3 w-3" />
          {action === editActions.DELETING ? "Deleting" : "Delete Pin"}
        </Modal.Button>

        <div className="flex items-center gap-2">
          <Modal.Button variant="secondary" onClick={closeEditPin} disabled={loading}>
            Cancel
          </Modal.Button>
          <Modal.Button onClick={handleSave} disabled={!title.trim() || loading}>
            <Check className="h-3 w-3" />
            {action === editActions.SAVING ? "Saving" : "Save"}
          </Modal.Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
