import { Hono } from "hono";
import { prisma } from "@pinmy/db";
import { validateURL } from "../utils/helpers";
import { scrapeLink } from "../services/scraper.service";
import { chunkText } from "../utils/chunker";
import { classifyPin } from "../services/classifier.service";

export const webhook = new Hono();

// POST /webhook/twilio
// Twilio sends form-encoded data with From (phone) and Body (message text).
webhook.post("/twilio", async (c) => {
  const body = await c.req.parseBody();
  const phone = body["From"] as string;
  const link = body["Body"] as string;

  if (!phone || !link) {
    return c.json({ error: "phone and link are required" }, 400);
  }

  if (!validateURL(link)) {
    return c.json({ error: "invalid link" }, 400);
  }

  const user = await prisma.user.findFirst({
    where: { phoneNumber: phone },
  });

  if (!user) {
    return c.json({ error: "user not found" }, 404);
  }

  const scraped = await scrapeLink(link);
  console.log("[webhook] scrape done, classifying...");

  const category = await classifyPin(scraped.title, scraped.description, link);
  console.log("[webhook] category:", category);

  const pin = await prisma.pin.create({
    data: {
      title: scraped.title,
      link,
      description: scraped.description || null,
      category,
      userId: user.id,
    },
  });
  console.log("[webhook] pin created:", pin.id);

  console.log(`[webhook] chunking content, length=${scraped.content.length}`);
  for (const chunk of chunkText(scraped.content)) {
    await prisma.pinChunk.create({
      data: {
        pinId: pin.id,
        sequence: chunk.sequence,
        content: chunk.content,
      },
    });
    console.log(`[webhook] inserted chunk ${chunk.sequence}`);
  }

  console.log("[webhook] done");
  return c.json({ status: "created", pin }, 201);
});
