"use client";

import { Download, Star } from "lucide-react";
import { Typography } from "../typography/Typography";
import { useModalStore } from "@/lib/stores/useModalStore";

export const EmptyState = () => {
  const openCreatePin = useModalStore((s) => s.openCreatePin);

  return (
    <div className="relative w-full border-[3px] border-black bg-white p-5 sm:p-8">
      {/* Tag */}
      <div className="absolute -top-3 left-4 flex items-center gap-1.5 border-2 border-black bg-[#ffd800] px-2 py-0.5">
        <Star className="h-3 w-3" />
        <Typography variant="tag">Get Started</Typography>
      </div>

      {/* Header */}
      <Typography variant="h2" className="mt-2">
        No pins yet...
      </Typography>
      <Typography className="mt-2 text-sm text-black/70">
        Save any links that you want to keep for later —
        <br className="hidden sm:block" />
        We'll process them so you can search through them with any keywords.
      </Typography>

      <Typography className="mt-4 text-sm font-semibold text-black">
        Two ways to get started:
      </Typography>

      {/* Two columns — stacks on mobile */}
      <div className="mt-4 flex flex-col gap-6 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-0">
        {/* Column 01 — QR */}
        <div className="relative border-[3px] border-black p-5">
          <div className="absolute -top-2.5 right-3 border border-black bg-[#55EFC4] px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
            Recommended
          </div>
          <Typography variant="display">01</Typography>
          <Typography className="mt-3 hidden text-sm sm:block">
            Scan the QR with your phone to save PinMy directly to your contacts.
            Just text PinMy a link and we&apos;ll save it for you.
          </Typography>
          <Typography className="mt-3 text-sm sm:hidden">
            Tap the button below to add PinMy to your contacts.
            Then just text us a link and we&apos;ll save it for you.
          </Typography>

          <div className="flex flex-col items-center gap-3 p-4">
            <img
              src="/pinmy-contact-qr.svg"
              alt="Scan to add PinMy to contacts"
              className="hidden h-40 w-40 border-3 border-black sm:block"
            />
            <a
              href="/pinmy.vcf"
              download="PinMy.vcf"
              className="flex w-full items-center justify-center gap-2 border-2 border-black bg-[#ffd800] px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#e6c200] sm:hidden"
            >
              <Download className="h-3.5 w-3.5" />
              Save PinMy to Contacts
            </a>
          </div>
        </div>

        {/* OR divider — horizontal on mobile, vertical on desktop */}
        <div className="flex items-center justify-center gap-3 sm:flex-col sm:px-4">
          <div className="h-px flex-1 bg-black/10 sm:h-full sm:w-px sm:flex-1" />
          <Typography variant="label" className="font-bold text-black/40">
            Or
          </Typography>
          <div className="h-px flex-1 bg-black/10 sm:h-full sm:w-px sm:flex-1" />
        </div>

        {/* Column 02 — New Pin */}
        <div className="border-[3px] border-black p-5">
          <Typography variant="display">02</Typography>
          <Typography className="mt-3 text-sm">
            Click{" "}
            <span className="bg-black px-1.5 py-0.5 text-xs font-bold text-[#ffd800]">
              + NEW PIN
            </span>{" "}
            in the top-right to add your first link.
          </Typography>
        </div>
      </div>
    </div>
  );
};
