import { cleanURL, timeAgo } from "@/lib/utils";
import { Typography } from "../typography/Typography";
import { Ellipsis } from "lucide-react";
import { useModalStore } from "@/lib/stores/useModalStore";
import type { PinWithSnippet } from "@/lib/requests/PinRequests";

export const Pin = ({ pin }: { pin: PinWithSnippet }) => {
  const timeCreated = timeAgo(pin.createdAt);
  const openEditPin = useModalStore((s) => s.openEditPin);
  return (
    <div className="group relative w-full border-[3px] border-black bg-white p-5 pt-5">
      {/* Purple tag */}
      <div className="absolute -top-3 left-4 flex items-center gap-1.5 border-2 border-black bg-[#C77DFF] px-2 py-0.5">
        <div className="h-2 w-2 rounded-sm bg-black" />
        <Typography variant="small" className="text-xs font-semibold">
          ENG
        </Typography>
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center">
          <div className="min-w-0 flex-1">
            <Typography className="line-clamp-2 text-lg leading-tight font-bold">
              {pin.title}
            </Typography>
            <a href={pin.link} target="_blank" rel="noreferrer">
              <Typography variant="muted" className="mt-1 line-clamp-2 break-all underline">
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
              className="hidden cursor-pointer rounded p-1 hover:bg-gray-100 group-hover:block"
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
