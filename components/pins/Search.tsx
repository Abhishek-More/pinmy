"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Typography } from "../typography/Typography";

export const Search = () => {
  const [modifierKey, setModifierKey] = useState("ctrl");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
    setModifierKey(isMac ? "cmd" : "ctrl");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex items-center justify-between gap-2 border-2 border-black px-2 w-2xl brutal-shadow-sm transition-shadow duration-200 has-[:focus]:shadow-none">
      <div className="flex grow items-center gap-2">
        <SearchIcon className="w-4 shrink-0 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search titles, texts, anything"
          className="border-none focus-visible:ring-0 focus-visible:border-none px-0"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              inputRef.current?.blur();
            }
          }}
        />
      </div>
      <Typography variant="muted">{modifierKey}+k</Typography>
    </div>
  );
};
