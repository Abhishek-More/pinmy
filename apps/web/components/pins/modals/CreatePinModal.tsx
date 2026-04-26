"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useModalStore } from "@/lib/stores/useModalStore";
import { PinRequests } from "@/lib/requests/PinRequests";

export const CreatePinModal = () => {
  const open = useModalStore((s) => s.createPinOpen);
  const closeCreatePin = useModalStore((s) => s.closeCreatePin);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = title.trim() && link.trim() && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await PinRequests.create({ title: title.trim(), link: link.trim() });
      setTitle("");
      setLink("");
      closeCreatePin();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setTitle("");
    setLink("");
    closeCreatePin();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      disabled={saving}
      tag="New Pin"
      tagColor="#72EFDD"
      title="Create Pin"
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
          <label className="text-xs font-bold tracking-wide uppercase">
            Link
          </label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="https://..."
            className="h-11 px-3 text-sm"
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="ml-auto flex items-center gap-2">
          <Modal.Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Modal.Button>
          <Modal.Button onClick={handleSave} disabled={!canSave}>
            <Check className="h-3 w-3" />
            {saving ? "Creating" : "Create"}
          </Modal.Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
