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

const TAG_CONFIG: Record<string, { color: string; icon: LucideIcon }> = {
  Engineering: { color: "#C77DFF", icon: Code },
  Design: { color: "#FF6B6B", icon: Palette },
  Research: { color: "#4ECDC4", icon: FlaskConical },
  Finance: { color: "#45B7D1", icon: DollarSign },
  News: { color: "#96CEB4", icon: Newspaper },
  Personal: { color: "#FFEAA7", icon: User },
  Notes: { color: "#DFE6E9", icon: StickyNote },
  Health: { color: "#55EFC4", icon: Heart },
  Legal: { color: "#A29BFE", icon: Scale },
  Marketing: { color: "#FD79A8", icon: Megaphone },
  Product: { color: "#6C5CE7", icon: Package },
  Career: { color: "#00B894", icon: Briefcase },
  Travel: { color: "#81ECEC", icon: Plane },
  Food: { color: "#FAB1A0", icon: UtensilsCrossed },
  "Real Estate": { color: "#74B9FF", icon: Home },
  Sports: { color: "#00CEC9", icon: Trophy },
  Politics: { color: "#E17055", icon: Landmark },
  Science: { color: "#0984E3", icon: Microscope },
  History: { color: "#D4A574", icon: Clock },
  Philosophy: { color: "#B2BEC3", icon: Brain },
  Art: { color: "#E84393", icon: Brush },
  Music: { color: "#A855F7", icon: Music },
  Gaming: { color: "#22C55E", icon: Gamepad2 },
  Crypto: { color: "#F59E0B", icon: Bitcoin },
  AI: { color: "#06B6D4", icon: Bot },
  Security: { color: "#EF4444", icon: Shield },
  Business: { color: "#8B5CF6", icon: Building2 },
  Education: { color: "#3B82F6", icon: GraduationCap },
  Environment: { color: "#10B981", icon: Leaf },
  Other: { color: "#94A3B8", icon: Tag },
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
    <div className="group relative w-full border-[3px] border-black bg-white p-5 pt-5">
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
