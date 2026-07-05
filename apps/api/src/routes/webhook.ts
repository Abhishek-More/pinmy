import { Hono } from "hono";
import { prisma } from "@pinmy/db";
import { validateURL } from "../utils/helpers";
import { scrapeLink } from "../services/scraper.service";
import { chunkText } from "../utils/chunker";
import {
  getYouTubeVideoId,
  fetchYouTubeVideo,
  chunkTranscript,
} from "../utils/youtube";
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
  const isPlace = scraped.latitude != null;
  const category = await classifyPin(
    scraped.title,
    scraped.description,
    link,
    isPlace,
  );
  return { scraped, category };
}

async function createChunks(content: string, pinId: number) {
  const chunks = chunkText(content);
  if (chunks.length === 0) return;
  await prisma.pinChunk.createMany({
    data: chunks.map((chunk) => ({ pinId, ...chunk })),
  });
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

  const pin = await prisma.pin.create({
    data: {
      title: link,
      link,
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

  // YouTube links: metadata + transcript via the player API; transcript chunks
  // carry timestamps so search results can deep-link into the video.
  const videoId = getYouTubeVideoId(link);
  const video = videoId ? await fetchYouTubeVideo(videoId) : null;
  if (video) {
    const category = await classifyPin(video.title, video.description, link, false);
    const chunks = video.transcript.length
      ? chunkTranscript(video.transcript)
      : chunkText(video.description);
    if (chunks.length) {
      await prisma.pinChunk.createMany({
        data: chunks.map((chunk) => ({ pinId: pin.id, ...chunk })),
      });
    }
    const updatedPin = await prisma.pin.update({
      where: { id: pin.id },
      data: {
        ...(pin.title === pin.link && {
          title: video.title || pin.link,
          description: video.description || null,
        }),
        category,
        image: video.thumbnail || null,
        durationSec: video.durationSec,
        status: "READY",
      },
    });
    return c.json({ status: "created", pin: updatedPin }, 201);
  }

  const { scraped, category } = await scrapeAndClassify(link);
  await createChunks(scraped.content, pin.id);

  const updatedPin = await prisma.pin.update({
    where: { id: pin.id },
    data: {
      // SMS pins are created with title=link as a placeholder; fill in the scraped one.
      ...(pin.title === pin.link && {
        title: scraped.title,
        description: scraped.description || null,
      }),
      category,
      image: scraped.image || null,
      latitude: scraped.latitude,
      longitude: scraped.longitude,
      stars: scraped.stars,
      language: scraped.language,
      status: "READY",
    },
  });

  return c.json({ status: "created", pin: updatedPin }, 201);
});
