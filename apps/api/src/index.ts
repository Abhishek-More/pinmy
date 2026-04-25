import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { webhook } from "./routes/webhook";
import { health } from "./routes/health";

const app = new Hono();

app.route("/", health);
app.route("/webhook", webhook);

serve(
  {
    fetch: app.fetch,
    port: 8080,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
