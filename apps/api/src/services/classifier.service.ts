import Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES, type Category } from "@pinmy/config";

const client = new Anthropic();

export async function classifyPin(
  title: string,
  description: string,
  link: string,
): Promise<Category> {
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 16,
      messages: [
        {
          role: "user",
          content: `Classify this link into exactly one category.

Categories: ${CATEGORIES.join(", ")}

Title: ${title}
Description: ${description}
URL: ${link}

Respond with only the category name, nothing else.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text"
        ? response.content[0].text.trim()
        : "Other";

    const match = CATEGORIES.find(
      (c) => c.toLowerCase() === text.toLowerCase(),
    );
    return match ?? "Other";
  } catch {
    return "Other";
  }
}
