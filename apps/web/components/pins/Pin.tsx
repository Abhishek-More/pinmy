import { cleanURL, timeAgo } from "@/lib/utils";
import { Typography } from "../typography/Typography";
import {
  Ellipsis,
  Code,
  Palette,
  FlaskConical,
  DollarSign,
  Newspaper,
  User,
  StickyNote,
  Heart,
  Scale,
  Megaphone,
  Package,
  Briefcase,
  Plane,
  UtensilsCrossed,
  Home,
  Trophy,
  Landmark,
  Microscope,
  Clock,
  Brain,
  Brush,
  Music,
  Gamepad2,
  Bitcoin,
  Bot,
  Shield,
  Building2,
  GraduationCap,
  Leaf,
  Tag,
  Loader,
  type LucideIcon,
} from "lucide-react";
import { useModalStore } from "@/lib/stores/useModalStore";
import type { PinWithSnippet } from "@/lib/requests/PinRequests";
import { CATEGORY_COLORS, type Category } from "@pinmy/config";

const TAG_ICONS: Record<Category, LucideIcon> = {
  Engineering: Code,
  Design: Palette,
  Research: FlaskConical,
  Finance: DollarSign,
  News: Newspaper,
  Personal: User,
  Notes: StickyNote,
  Health: Heart,
  Legal: Scale,
  Marketing: Megaphone,
  Product: Package,
  Career: Briefcase,
  Travel: Plane,
  Food: UtensilsCrossed,
  "Real Estate": Home,
  Sports: Trophy,
  Politics: Landmark,
  Science: Microscope,
  History: Clock,
  Philosophy: Brain,
  Art: Brush,
  Music: Music,
  Gaming: Gamepad2,
  Crypto: Bitcoin,
  AI: Bot,
  Security: Shield,
  Business: Building2,
  Education: GraduationCap,
  Environment: Leaf,
  Other: Tag,
};

const PROCESSING_CONFIG = { color: "#FBBF24", icon: Loader };

function getTagConfig(category: string) {
  const color =
    CATEGORY_COLORS[category as Category] ?? CATEGORY_COLORS["Other"];
  const icon = TAG_ICONS[category as Category] ?? TAG_ICONS["Other"];
  return { color, icon };
}

export const Pin = ({ pin }: { pin: PinWithSnippet }) => {
  const timeCreated = timeAgo(pin.createdAt);
  const openEditPin = useModalStore((s) => s.openEditPin);
  const isProcessing = pin.status === "PROCESSING";
  const tagLabel = isProcessing ? "Indexing..." : (pin.category ?? "Other");
  const { color: tagBg, icon: TagIcon } = isProcessing
    ? PROCESSING_CONFIG
    : getTagConfig(tagLabel);
  return (
    <div className="group relative w-full border-[3px] border-black bg-white p-4 pt-4 sm:p-5 sm:pt-5">
      {/* Status tag */}
      <div
        className="absolute -top-3 left-4 flex items-center gap-1.5 border-2 border-black px-2 py-0.5"
        style={{ backgroundColor: tagBg }}
      >
        <TagIcon className="h-3 w-3" />
        <Typography variant="small" className="font-semibold">
          {tagLabel}
        </Typography>
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center">
          <div className="min-w-0 flex-1">
            <Typography variant="large" className="line-clamp-2">
              {pin.title}
            </Typography>
            <a href={pin.link} target="_blank" rel="noreferrer">
              <Typography
                variant="muted"
                className="mt-1 line-clamp-2 break-all underline"
              >
                {cleanURL(pin.link)}
              </Typography>
            </a>
          </div>

          {/* Time / Menu */}
          <div className="shrink-0 pl-4">
            <Typography variant="muted" className="group-hover:hidden">
              {timeCreated}
            </Typography>
            <button
              className="hidden cursor-pointer rounded p-1 group-hover:block hover:bg-gray-100"
              onClick={() => openEditPin(pin)}
            >
              <Ellipsis className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search snippet */}
        {pin.snippet && (
          <p
            className="text-muted-foreground [&_mark]:text-foreground mt-3 border-l-[3px] border-black pl-3 text-sm leading-relaxed [&_mark]:bg-yellow-200 [&_mark]:px-0.5"
            dangerouslySetInnerHTML={{ __html: pin.snippet }}
          />
        )}
      </div>
    </div>
  );
};
