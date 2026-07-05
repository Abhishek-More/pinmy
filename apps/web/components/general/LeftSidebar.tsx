"use client";

import { Typography } from "../typography/Typography";
import { authClient } from "@/lib/clients/auth-browser";
import { LogOut, Key, MapPin, Pin, Play } from "lucide-react";
import useSWR from "swr";
import { PinRequests } from "@/lib/requests/PinRequests";
import { Skeleton } from "@/components/ui/skeleton";
import { Identicon } from "./Identicon";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePinStore } from "@/lib/stores/usePinStore";

export const ProfileSection = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="flex items-center gap-3 border-[3px] border-black bg-white p-3">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!session?.user) return null;

  const phone = session.user.phoneNumber || "";

  return (
    <div className="flex items-center justify-between border-[3px] border-black bg-white p-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0 border-2 border-black">
          <Identicon id={session.user.id} size={36} />
        </div>
        <Typography className="font-semibold">{phone}</Typography>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => router.push("/profile")}
          className="cursor-pointer p-1 hover:bg-gray-100"
          title="API Settings"
        >
          <Key className="h-4 w-4" />
        </button>
        <button
          onClick={async () => {
            await authClient.signOut();
            router.push("/login");
          }}
          className="cursor-pointer p-1 hover:bg-gray-100"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const VIEW_TABS = [
  { view: "pins", label: "Pins", icon: Pin },
  { view: "places", label: "Places", icon: MapPin },
  { view: "videos", label: "Videos", icon: Play },
] as const;

export const ViewTabs = () => {
  const { data: session } = authClient.useSession();
  const { data: pins } = useSWR(
    session?.user ? "/api/pins" : null,
    PinRequests.list,
  );
  const view = usePinStore((s) => s.view);
  const setView = usePinStore((s) => s.setView);
  const setSelectedCategory = usePinStore((s) => s.setSelectedCategory);

  const counts = useMemo(() => {
    const tally = { pins: 0, places: 0, videos: 0 };
    for (const pin of pins ?? []) {
      if (pin.latitude != null) tally.places++;
      else if (pin.durationSec != null) tally.videos++;
      else tally.pins++;
    }
    return tally;
  }, [pins]);

  return (
    <div className="flex shrink-0 flex-col">
      {VIEW_TABS.map(({ view: tab, label, icon: Icon }) => (
        <div
          key={tab}
          onClick={() => {
            setView(tab);
            setSelectedCategory(null);
          }}
          className={`mb-2 flex shrink-0 cursor-pointer items-center justify-between border-[3px] border-black p-3 ${
            view === tab ? "bg-black text-white" : "bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0" />
            <Typography className="text-sm font-bold">{label}</Typography>
          </div>
          <Typography className="text-sm">{counts[tab]}</Typography>
        </div>
      ))}
    </div>
  );
};

export const LeftSidebar = () => {
  const { data: session } = authClient.useSession();
  const { data: pins } = useSWR(
    session?.user ? "/api/pins" : null,
    PinRequests.list,
  );

  const totalCount = pins?.length ?? 0;

  return (
    <div className="flex h-full flex-col gap-6 px-8 pt-16">
      {/* Logo */}
      <div>
        <div className="flex items-baseline">
          <Typography variant="display" as="h1">
            Pin
          </Typography>
          <Typography
            variant="display"
            as="span"
            className="bg-accent border-2 border-black px-1"
          >
            My
          </Typography>
        </div>
        <Typography variant="muted" className="mt-1">
          // {totalCount} pins
        </Typography>
      </div>

      {/* Profile */}
      <ProfileSection />

      {/* Views */}
      <ViewTabs />
    </div>
  );
};
