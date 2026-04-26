"use client";

import { Login } from "@/components/auth/login";
import { PinStream } from "@/components/pins/PinStream";
import { Search } from "@/components/pins/Search";
import { Typography } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { WeeklyPins } from "@/components/stats/WeeklyPins";
import { LeftSidebar } from "@/components/general/LeftSidebar";

export default function Home() {
  return (
    <div className="mx-auto grid h-screen max-w-[2500px] grid-cols-12 overflow-hidden">
      <div className="absolute top-16 right-16 flex items-center gap-4">
        <Login />
      </div>
      <div className="col-span-3 h-full max-w-11/12 border-r-2 border-black/10">
        <LeftSidebar />
      </div>
      <div className="col-span-6 flex flex-col items-center px-8 pt-16">
        <Search />
        <div className="mt-12 mb-8 flex w-full justify-between">
          <Typography variant="h1">Your Pins</Typography>
          <div className="brutal-shadow-accent-wrapper">
            <Button className="text-accent cursor-pointer border-2 border-black p-4 font-semibold">
              <Typography>+ NEW PIN</Typography>
            </Button>
          </div>
        </div>
        <PinStream />
      </div>

      <div className="col-span-3 h-full w-full px-8 pt-16 pr-8">
        <WeeklyPins />
      </div>
    </div>
  );
}
