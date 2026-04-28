"use client";

import { Typography } from "../typography/Typography";
import { authClient } from "@/lib/clients/auth-browser";
import { LogOut } from "lucide-react";
import useSWR from "swr";
import { PinRequests } from "@/lib/requests/PinRequests";
import { Skeleton } from "@/components/ui/skeleton";
import { Identicon } from "./Identicon";
import { CATEGORY_COLORS } from "@pinmy/config";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePinStore } from "@/lib/stores/usePinStore";

const ProfileSection = () => {
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
  );
};

const CollectionsSection = () => {
  const { data: session } = authClient.useSession();
  const { data: pins } = useSWR(
    session?.user ? "/api/pins" : null,
    PinRequests.list,
  );
  const selectedCategory = usePinStore((s) => s.selectedCategory);
  const setSelectedCategory = usePinStore((s) => s.setSelectedCategory);

  const collections = useMemo(() => {
    const totalCount = pins?.length ?? 0;
    const counts: Record<string, number> = {};
    for (const pin of pins ?? []) {
      const cat = pin.category ?? "Other";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }

    const categories = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        color:
          CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] ??
          CATEGORY_COLORS["Other"],
        count,
      }));

    return [
      { name: "ALL", color: null as string | null, count: totalCount },
      ...categories,
    ];
  }, [pins]);

  const isSelected = (name: string) =>
    name === "ALL" ? selectedCategory === null : selectedCategory === name;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0">
      <div className="mb-3 flex w-1/2 shrink-0 items-center gap-2">
        <div className="h-px flex-1 bg-black/20" />
        <Typography variant="label">Collections</Typography>
        <div className="h-px flex-1 bg-black/20" />
      </div>
      <div className="scrollbar-hide overflow-y-auto border">
        {collections.map((col) => (
          <div
            key={col.name}
            onClick={() =>
              setSelectedCategory(col.name === "ALL" ? null : col.name)
            }
            className={`mt-2 flex cursor-pointer items-center justify-between border-[3px] border-black p-3 first:mt-0 ${
              isSelected(col.name)
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              {col.color && (
                <div
                  className="h-3 w-3 shrink-0 rounded-full border border-black"
                  style={{ backgroundColor: col.color }}
                />
              )}
              <Typography className="text-sm font-bold">{col.name}</Typography>
            </div>
            <Typography className="text-sm">{col.count}</Typography>
          </div>
        ))}
      </div>
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

      {/* Collections */}
      <CollectionsSection />
    </div>
  );
};
