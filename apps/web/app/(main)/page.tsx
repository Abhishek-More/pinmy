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
      {/* Desktop login — hidden on mobile */}
      <div className="absolute top-16 right-16 hidden items-center gap-4 md:flex">
        <Login />
      </div>

      {/* Left sidebar — hidden on mobile */}
      <div className="hidden h-full max-w-11/12 flex-col border-r-2 border-black/10 md:col-span-4 md:flex lg:col-span-3">
        <LeftSidebar />
      </div>

      {/* Main content */}
      <div className="col-span-12 flex flex-col items-center overflow-y-auto px-4 pt-6 pb-8 md:col-span-8 md:px-8 md:pt-16 lg:col-span-9 xl:col-span-6">
        {/* Mobile header */}
        <div className="mb-6 flex w-full items-center justify-between md:hidden">
          <div className="flex items-baseline">
            <Typography variant="h1">Pin</Typography>
            <Typography
              variant="h1"
              as="span"
              className="bg-accent border-2 border-black px-1"
            >
              My
            </Typography>
          </div>
          <Login />
        </div>

        <Search />
        <div className="mt-8 mb-6 flex w-full items-center justify-between md:mt-12 md:mb-8">
          <Typography variant="h1">Your Pins</Typography>
          <div className="brutal-shadow-accent-wrapper">
            <Button onClick={openCreatePin} className="text-accent cursor-pointer border-2 border-black p-3 font-semibold md:p-4">
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
