"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { authClient } from "@/lib/clients/auth-browser";
import { PinRequests } from "@/lib/requests/PinRequests";
import { usePinStore } from "@/lib/stores/usePinStore";
import { CategorySelect } from "../general/CategorySelect";

/** Collection filter for the regular pins view, bound to the pin store. */
export const CollectionSelect = () => {
  const { data: session } = authClient.useSession();
  const { data: pins } = useSWR(
    session?.user ? "/api/pins" : null,
    PinRequests.list,
  );
  const selectedCategory = usePinStore((s) => s.selectedCategory);
  const setSelectedCategory = usePinStore((s) => s.setSelectedCategory);

  const options = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const pin of pins ?? []) {
      if (pin.latitude != null || pin.durationSec != null) continue;
      const cat = pin.category ?? "Other";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [pins]);

  return (
    <CategorySelect
      allLabel="All collections"
      options={options}
      value={selectedCategory}
      onChange={setSelectedCategory}
    />
  );
};
