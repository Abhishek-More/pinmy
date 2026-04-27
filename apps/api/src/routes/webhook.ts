import { Hono } from "hono";
import { prisma } from "@pinmy/db";
import { validateURL } from "../utils/helpers";
import { scrapeLink } from "../services/scraper.service";
import { chunkText } from "../utils/chunker";
import { classifyPin } from "../services/classifier.service";
import { MessageQueueClient } from "@pinmy/queue";
import type { Context } from "hono";

export const webhook = new Hono();

async function validateAndResolveUser(phone: string, link: string, c: Context) {
  if (!phone || !link) {
    return { error: c.json({ error: "phone and link are required" }, 400) };
  }
  if (!validateURL(link)) {
    return { error: c.json({ error: "invalid link" }, 400) };
  }
  const user = await prisma.user.findFirst({ where: { phoneNumber: phone } });
  if (!user) {
    return { error: c.json({ error: "user not found" }, 404) };
  }
  return { user, error: null };
}

async function scrapeAndClassify(link: string) {
  const scraped = await scrapeLink(link);
  const category = await classifyPin(scraped.title, scraped.description, link);
  return { scraped, category };
}

async function createChunks(content: string, pinId: number) {
  for (const chunk of chunkText(content)) {
    await prisma.pinChunk.create({
      data: { pinId, sequence: chunk.sequence, content: chunk.content },
    });
  }
}

// POST /webhook/twilio
// Twilio sends form-encoded data with From (phone) and Body (message text).
// We just create the pin here and send the data to the message queue to queue up further processing.
webhook.post("/twilio", async (c) => {
  const body = await c.req.parseBody();
  const phone = body["From"] as string;
  const link = body["Body"] as string;

  const { user, error } = await validateAndResolveUser(phone, link, c);
  if (error) return error;

  const scraped = await scrapeLink(link);

  const pin = await prisma.pin.create({
    data: {
      title: scraped.title,
      link,
      description: scraped.description || null,
      status: "PROCESSING",
      platform: "sms",
      userId: user.id,
    },
  });

  MessageQueueClient.publish("/webhook/process", {
    phone: user.phoneNumber as string,
    link: pin.link,
    pinUniqueId: pin.uniqueId,
  });

  return c.json({ status: "created", pin }, 201);
});

webhook.post("/process", async (c) => {
  const body = await c.req.json();
  const phone = body.phone as string;
  const link = body.link as string;
  const pinUniqueId = body.pinUniqueId as string;

  const { error } = await validateAndResolveUser(phone, link, c);
  if (error) return error;

  if (!pinUniqueId) {
    return c.json({ error: "pinUniqueId is required" }, 400);
  }

  const pin = await prisma.pin.findFirst({ where: { uniqueId: pinUniqueId } });
  if (!pin) {
    return c.json({ error: "pin not found" }, 404);
  }

  const { scraped, category } = await scrapeAndClassify(link);
  await createChunks(scraped.content, pin.id);

  const updatedPin = await prisma.pin.update({
    where: { id: pin.id },
    data: { category, status: "READY" },
  });

  return c.json({ status: "created", pin: updatedPin }, 201);
});
