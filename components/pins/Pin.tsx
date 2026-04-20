import { timeAgo } from "@/lib/utils";
import { Typography } from "../typography/Typography";

export const Pin = ({ pin }: { pin: any }) => {
  const timeCreated = timeAgo(pin.createdAt);

  return (
    <div className="border-muted-foreground/60 flex w-full items-center justify-between px-8 py-4">
      <div className="flex items-center gap-4">
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: "#C77DFF" }}
        />
        <div>
          <Typography className="leading-4 font-semibold">
            {pin.title}
          </Typography>
          <a href={pin.link} target="_blank" rel="noreferrer">
            <Typography variant="muted" className="underline">
              {pin.link}
            </Typography>
          </a>
        </div>
      </div>
      <Typography variant="muted">{timeCreated}</Typography>
    </div>
  );
};
