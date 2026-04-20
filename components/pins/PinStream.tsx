import { Button } from "../ui/button";
import { Pin } from "./Pin";

const pins = [
  {
    id: 1,
    title: "The Search Engine",
    link: "https://www.google.com",
    createdAt: 1679481600000,
  },
  {
    id: 2,
    title: "Blog Post",
    link: "https://www.google.com",
    createdAt: 1769481600000,
  },
  {
    id: 3,
    title: "Understanding Gleam",
    link: "https://www.google.com",
    createdAt: 1869481600000,
  },
];

export const PinStream = () => {
  return (
    <div className="w-full">
      <div className="flex h-10 justify-end border-2 border-b-0 border-black">
        <button className="cursor-pointer bg-black px-4 text-white">
          + NEW
        </button>
      </div>
      <div className="border-2 border-black">
        {pins.map((pin, index) => (
          <div
            key={pin.id}
            className={`border-muted-foreground/60 ${index !== pins.length - 1 ? "border-b-1" : ""}`}
          >
            <Pin pin={pin} />
          </div>
        ))}
      </div>
    </div>
  );
};
