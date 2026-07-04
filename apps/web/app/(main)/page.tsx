"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Login } from "@/components/auth/login";
import { PinStream } from "@/components/pins/PinStream";
import { Search } from "@/components/pins/Search";
import { PlacesView } from "@/components/places/PlacesView";
import { Typography } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/stores/useModalStore";
import { usePinStore } from "@/lib/stores/usePinStore";
import { LeftSidebar } from "@/components/general/LeftSidebar";
import { RightSidebar } from "@/components/general/RightSidebar";
import { authClient } from "@/lib/clients/auth-browser";

export default function Home() {
  const openCreatePin = useModalStore((s) => s.openCreatePin);
  const view = usePinStore((s) => s.view);
  const setView = usePinStore((s) => s.setView);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  return (
    <div className="mx-auto grid h-dvh max-w-[2500px] grid-cols-12 overflow-hidden">
      {/* Desktop login — hidden on mobile */}
      <div className="absolute top-16 right-16 hidden items-center gap-4 md:flex">
        <Login />
      </div>

      {/* Left sidebar — hidden on mobile */}
      <div className="hidden h-full max-w-11/12 flex-col border-r-2 border-black/10 md:col-span-4 md:flex lg:col-span-3">
        <LeftSidebar />
      </div>

      {/* Main content */}
      <div
        className={`col-span-12 flex h-dvh flex-col items-center overflow-hidden px-4 pt-6 md:col-span-8 md:px-8 md:pt-16 lg:col-span-9 ${
          view === "places" ? "xl:col-span-9" : "xl:col-span-6"
        }`}
      >
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
        <div className="mt-8 mb-6 flex w-full shrink-0 items-center justify-between md:mt-12 md:mb-8">
          <div className="flex items-center gap-3">
            <Typography variant="h1">
              {view === "places" ? "Your Places" : "Your Pins"}
            </Typography>
            {/* Mobile-only view switch; desktop uses the sidebar Places tab */}
            <div className="flex md:hidden">
              {(["pins", "places"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`cursor-pointer border-2 border-black px-2 py-0.5 text-xs font-semibold uppercase first:border-r-0 ${
                    view === v ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="brutal-shadow-accent-wrapper">
            <Button
              onClick={openCreatePin}
              className="text-accent cursor-pointer border-2 border-black p-3 font-semibold md:p-4"
            >
              <Typography>+ NEW PIN</Typography>
            </Button>
          </div>
        </div>
        {view === "places" ? (
          <div className="mb-6 min-h-0 w-full flex-1">
            <PlacesView />
          </div>
        ) : (
          <div className="scrollbar-hide mb-10 min-h-0 w-full flex-1 overflow-y-auto border-b-1 border-black/40 pb-8">
            <PinStream />
          </div>
        )}
      </div>

      {view !== "places" && <RightSidebar />}
    </div>
  );
}
