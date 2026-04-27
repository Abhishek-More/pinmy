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
import type { Category } from "@pinmy/config";

const TAG_CONFIG: Record<Category, { color: string; icon: LucideIcon }> = {
  Engineering: { color: "#D4A0FF", icon: Code },
  Design: { color: "#FFA0A0", icon: Palette },
  Research: { color: "#7EEDE4", icon: FlaskConical },
  Finance: { color: "#8AD4E8", icon: DollarSign },
  News: { color: "#B8E6D0", icon: Newspaper },
  Personal: { color: "#FFEAA7", icon: User },
  Notes: { color: "#DFE6E9", icon: StickyNote },
  Health: { color: "#80FFD4", icon: Heart },
  Legal: { color: "#C4BFFF", icon: Scale },
  Marketing: { color: "#FFB0CB", icon: Megaphone },
  Product: { color: "#B8AFFE", icon: Package },
  Career: { color: "#6EECC0", icon: Briefcase },
  Travel: { color: "#A0F0F0", icon: Plane },
  Food: { color: "#FFCABC", icon: UtensilsCrossed },
  "Real Estate": { color: "#A4D0FF", icon: Home },
  Sports: { color: "#7EE8E4", icon: Trophy },
  Politics: { color: "#FFB09A", icon: Landmark },
  Science: { color: "#8DC8F8", icon: Microscope },
  History: { color: "#E8C9A0", icon: Clock },
  Philosophy: { color: "#CDD5DB", icon: Brain },
  Art: { color: "#FF8DC7", icon: Brush },
  Music: { color: "#CBA4FF", icon: Music },
  Gaming: { color: "#7EE8A0", icon: Gamepad2 },
  Crypto: { color: "#FFC04D", icon: Bitcoin },
  AI: { color: "#7DD8E8", icon: Bot },
  Security: { color: "#FFA0A0", icon: Shield },
  Business: { color: "#B8A4FF", icon: Building2 },
  Education: { color: "#93B8FF", icon: GraduationCap },
  Environment: { color: "#6EE8B0", icon: Leaf },
  Other: { color: "#C0CCD8", icon: Tag },
};

const PROCESSING_CONFIG = { color: "#FBBF24", icon: Loader };

function getTagConfig(category: string) {
  return TAG_CONFIG[category] ?? TAG_CONFIG["Other"];
}

export const Pin = ({ pin }: { pin: PinWithSnippet }) => {
  const timeCreated = timeAgo(pin.createdAt);
  const openEditPin = useModalStore((s) => s.openEditPin);
  const isProcessing = pin.status === "PROCESSING";
  const tagLabel = isProcessing ? "Processing..." : (pin.category ?? "Other");
  const { color: tagBg, icon: TagIcon } = isProcessing ? PROCESSING_CONFIG : getTagConfig(tagLabel);
  return (
    <div className="group relative w-full border-[3px] border-black bg-white p-4 pt-4 sm:p-5 sm:pt-5">
      {/* Status tag */}
      <div className="absolute -top-3 left-4 flex items-center gap-1.5 border-2 border-black px-2 py-0.5" style={{ backgroundColor: tagBg }}>
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
