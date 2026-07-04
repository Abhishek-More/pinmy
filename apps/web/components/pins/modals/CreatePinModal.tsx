"use client";

import { useEffect, useState } from "react";
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
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Prefill the link from the clipboard when the modal opens
  useEffect(() => {
    if (!open) return;
    navigator.clipboard
      ?.readText()
      .then((text) => {
        const candidate = text.trim();
        if (!/^https?:\/\//i.test(candidate) || !URL.canParse(candidate)) return;
        setLink((prev) => prev || candidate);
      })
      .catch(() => {}); // clipboard permission denied or unavailable
  }, [open]);

  const canSave = title.trim() && link.trim() && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await PinRequests.create({
        title: title.trim(),
        link: link.trim(),
        note: note.trim() || undefined,
      });
      setTitle("");
      setLink("");
      setNote("");
      closeCreatePin();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setTitle("");
    setLink("");
    setNote("");
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

        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-wide uppercase">
            Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note about this pin"
            rows={3}
            className="placeholder:text-muted-foreground w-full resize-none border-2 border-black bg-transparent px-2.5 py-2 text-sm outline-none"
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
