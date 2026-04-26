"use client";

import { Login } from "@/components/auth/login";
import { PinStream } from "@/components/pins/PinStream";
import { Search } from "@/components/pins/Search";
import { Typography } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/stores/useModalStore";
import { LeftSidebar } from "@/components/general/LeftSidebar";
import { RightSidebar } from "@/components/general/RightSidebar";

export default function Home() {
  const openCreatePin = useModalStore((s) => s.openCreatePin);
  return (
    <div className="mx-auto grid h-screen max-w-[2500px] grid-cols-12 overflow-hidden">
      <div className="absolute top-16 right-16 flex items-center gap-4">
        <Login />
      </div>
      <div className="hidden h-full max-w-11/12 flex-col border-r-2 border-black/10 md:col-span-4 md:flex lg:col-span-3">
        <LeftSidebar />
      </div>
      <div className="col-span-12 flex flex-col items-center px-8 pt-16 md:col-span-8 lg:col-span-9 xl:col-span-6">
        <Search />
        <div className="mt-12 mb-8 flex w-full justify-between">
          <Typography variant="h1">Your Pins</Typography>
          <div className="brutal-shadow-accent-wrapper">
            <Button onClick={openCreatePin} className="text-accent cursor-pointer border-2 border-black p-4 font-semibold">
              <Typography>+ NEW PIN</Typography>
            </Button>
          </div>
        </div>
        <PinStream />
      </div>

      <RightSidebar />
    </div>
  );
}
