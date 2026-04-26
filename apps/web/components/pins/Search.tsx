"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "../ui/input";
import { Typography } from "../typography/Typography";
import { usePinStore } from "@/lib/stores/usePinStore";

export const Search = () => {
  const setSearchQuery = usePinStore((s) => s.setSearchQuery);
  const [modifierKey, setModifierKey] = useState("cmd");
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
    setModifierKey(isMac ? "cmd" : "ctrl");
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchQuery(value.trim());
      }, 300);
    },
    [setSearchQuery],
  );

  return (
    <div className="brutal-shadow flex h-14 w-full items-center justify-between gap-2 border-2 border-black bg-white px-2 transition-shadow duration-200 has-[:focus]:shadow-none">
      <div className="flex grow items-center gap-2">
        <SearchIcon className="text-muted-foreground w-4 shrink-0" />
        <Input
          ref={inputRef}
          placeholder="Search titles, texts, anything"
          className="border-none px-0 focus-visible:border-none focus-visible:ring-0"
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              inputRef.current?.blur();
            }
          }}
        />
      </div>
      {!isMobile && <Typography variant="muted">{modifierKey}+k</Typography>}
    </div>
  );
};
