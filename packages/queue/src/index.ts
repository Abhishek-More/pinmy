import { Client } from "@upstash/qstash";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

class MessageQueue {
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async publish(endpoint: string, body: { phone: string; link: string; pinUniqueId: string }) {
    return this.client.publishJSON({
      url: BACKEND_API_URL + endpoint,
      body,
    });
  }
}

const qstash = new Client();
export const MessageQueueClient = new MessageQueue(qstash);
