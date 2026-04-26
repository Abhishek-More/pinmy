import { Client } from "@upstash/qstash";

export const qstash = new Client();

export async function publishToQueue<T extends Record<string, unknown>>(
  url: string,
  body: T,
) {
  return qstash.publishJSON({
    url,
    body,
  });
}
