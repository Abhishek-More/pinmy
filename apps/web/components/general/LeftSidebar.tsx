"use client";

import { Typography } from "../typography/Typography";
import { authClient } from "@/lib/clients/auth-browser";
import { ArrowRight } from "lucide-react";
import useSWR from "swr";
import { PinRequests } from "@/lib/requests/PinRequests";
import { Skeleton } from "@/components/ui/skeleton";
import { Identicon } from "./Identicon";

const ProfileSection = () => {
  const { data: session, isPending } = authClient.useSession();

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
      <ArrowRight className="h-4 w-4" />
    </div>
  );
};

const CollectionsSection = () => {
  const { data: session } = authClient.useSession();
  const { data: pins } = useSWR(
    session?.user ? "/api/pins" : null,
    PinRequests.list,
  );

  const totalCount = pins?.length ?? 0;

  const collections = [
    { name: "ALL", color: null, count: totalCount },
    { name: "ENG", color: "#C77DFF", count: 0 },
  ];

  return (
    <div className="flex flex-col gap-0">
      <div className="mb-3 flex w-1/2 items-center gap-2">
        <div className="h-px flex-1 bg-black/20" />
        <Typography
          variant="small"
          className="text-xs tracking-widest uppercase"
        >
          Collections
        </Typography>
        <div className="h-px flex-1 bg-black/20" />
      </div>
      {collections.map((col) => (
        <div
          key={col.name}
          className={`-mt-[3px] flex cursor-pointer items-center justify-between border-[3px] border-black p-3 first:mt-0 ${
            col.name === "ALL"
              ? "bg-black text-white"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {col.color && (
              <div
                className="h-3 w-3 border border-black"
                style={{ backgroundColor: col.color }}
              />
            )}
            <Typography className="text-sm font-bold">{col.name}</Typography>
          </div>
          <Typography className="text-sm">{col.count}</Typography>
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
          <Typography variant="h1" className="text-4xl">
            Pin
          </Typography>
          <Typography
            variant="h1"
            className="bg-accent border-2 border-black px-1 text-4xl"
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

      {/* Collections */}
      <CollectionsSection />
    </div>
  );
};
