import { timeAgo } from "@/lib/utils";
import { Typography } from "../typography/Typography";

interface PinProps {
  id: number;
  uniqueId: string;
  title: string;
  link: string;
  createdAt?: number | string;
  snippet?: string | null;
}

export const Pin = ({ pin }: { pin: PinProps }) => {
  const timeCreated = pin.createdAt ? timeAgo(Number(pin.createdAt)) : "";

  return (
    <div className="border-muted-foreground/60 flex w-full flex-col p-4">
      <div className="flex items-center justify-between">
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
      {pin.snippet && (
        <p
          className="text-muted-foreground mt-2 ml-6 border-l-2 border-muted-foreground/20 pl-3 text-xs leading-relaxed [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:text-foreground"
          dangerouslySetInnerHTML={{ __html: pin.snippet }}
        />
      )}
    </div>
  );
};
