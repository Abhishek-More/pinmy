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
    return this.getClient().publishJSON({
      url: process.env.BACKEND_API_URL + endpoint,
      body,
    });
  }
}

export const MessageQueueClient = new MessageQueue();
