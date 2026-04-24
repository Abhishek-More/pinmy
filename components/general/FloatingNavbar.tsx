import {
  BookmarkIcon,
  HomeIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";

export const FloatingNavbar = () => {
  return (
    <nav className="fixed bottom-6 left-1/2 flex w-xl -translate-x-1/2 items-center justify-around border-2 border-black bg-white py-3">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <HomeIcon className="size-5" />
      </Link>
      <Link
        href="/bookmarks"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <BookmarkIcon className="size-5" />
      </Link>
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <LayoutDashboardIcon className="size-5" />
      </Link>
      <Link
        href="/settings"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <SettingsIcon className="size-5" />
      </Link>
    </nav>
  );
};
