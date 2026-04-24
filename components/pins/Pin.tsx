import { timeAgo } from "@/lib/utils";
import { Typography } from "../typography/Typography";

interface PinProps {
  id: number;
  uniqueId: string;
  title: string;
  link: string;
  createdAt?: number | string;
}

export const Pin = ({ pin }: { pin: PinProps }) => {
  const timeCreated = pin.createdAt ? timeAgo(Number(pin.createdAt)) : "";

  return (
    <div className="border-muted-foreground/60 flex w-full items-center justify-between p-4">
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
