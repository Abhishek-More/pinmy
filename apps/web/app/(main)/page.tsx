"use client";

import { useState } from "react";
import { Login } from "@/components/auth/login";
import { PinStream } from "@/components/pins/PinStream";
import { Search } from "@/components/pins/Search";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mx-auto mt-16 flex w-3xl flex-col items-center gap-16">
      <div className="absolute top-16 right-16 flex items-center gap-4">
        <Login />
      </div>
      <Search onSearch={setSearchQuery} />
      <PinStream searchQuery={searchQuery} />
    </div>
  );
}
