import type { Pin } from "@/lib/requests/PinRequests";

export const samplePins: Pin[] = [
  {
    id: 1,
    uniqueId: "pin_00000000000000000000000000000001",
    title: "Quantifying infrastructure noise in agentic coding evals.",
    link: "https://www.anthropic.com/engineering/infrastructure-noise",
    status: "DONE",
    platform: "web",
    userId: "",
    createdAt: new Date(1679481600000).toISOString(),
  },
  {
    id: 2,
    uniqueId: "pin_00000000000000000000000000000002",
    title: "Blog Post",
    link: "https://www.google.com",
    status: "DONE",
    platform: "web",
    userId: "",
    createdAt: new Date(1769481600000).toISOString(),
  },
  {
    id: 3,
    uniqueId: "pin_00000000000000000000000000000003",
    title: "Understanding Gleam",
    link: "https://www.google.com",
    status: "DONE",
    platform: "web",
    userId: "",
    createdAt: new Date(1869481600000).toISOString(),
  },
];
