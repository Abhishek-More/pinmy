"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Menu, X } from "lucide-react";
import { ProfileSection, CollectionsSection } from "./LeftSidebar";

/** Mobile-only slide-in drawer exposing the desktop sidebar's profile + collections. */
export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          aria-label="Open menu"
          className="flex h-11 w-11 cursor-pointer items-center justify-center border-2 border-black bg-white md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 bg-black/50 md:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col gap-6 overflow-y-auto border-l-[3px] border-black bg-[#f4f1e8] p-5 md:hidden"
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="text-xs font-medium tracking-widest uppercase">
              Menu
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <button
                aria-label="Close menu"
                className="flex h-9 w-9 cursor-pointer items-center justify-center border-2 border-black bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>
          </div>
          {/* Any tap inside closes the drawer after the item's own handler runs. */}
          <div
            className="flex min-h-0 flex-1 flex-col gap-6"
            onClick={() => setOpen(false)}
          >
            <ProfileSection />
            <CollectionsSection />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
