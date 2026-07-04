import { Client } from "@upstash/qstash";


class MessageQueue {
  private client: Client | null = null;

  private getClient() {
    if (!this.client) {
      this.client = new Client({ token: process.env.QSTASH_TOKEN! });
    }
    return this.client;
  }

  async publish(endpoint: string, body: { phone: string; link: string; pinUniqueId: string }) {
    const url = process.env.BACKEND_API_URL + endpoint;
    // ponytail: local dev bypass. QStash can't call back into localhost, so POST straight to the api.
    if (new URL(url).hostname === "localhost" || new URL(url).hostname === "127.0.0.1") {
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    return this.getClient().publishJSON({ url, body });
  }
}

export const MessageQueueClient = new MessageQueue();
