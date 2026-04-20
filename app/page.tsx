import { Login } from "@/components/auth/login";
import { PinStream } from "@/components/pins/PinStream";
import { Search } from "@/components/pins/Search";

export default function Home() {
  return (
    <div className="mx-auto mt-16 flex w-4xl flex-col items-center gap-8">
      <div className="absolute top-16 right-16">
        <Login />
      </div>
      <Search />
      <PinStream />
    </div>
  );
}
