import Anthropic from "@anthropic-ai/sdk";
import {
  CATEGORIES,
  PLACE_CATEGORIES,
  type Category,
  type PlaceCategory,
} from "@pinmy/config";

const client = new Anthropic();

export async function classifyPin(
  title: string,
  description: string,
  link: string,
  isPlace = false,
): Promise<Category | PlaceCategory> {
  const categories: readonly string[] = isPlace ? PLACE_CATEGORIES : CATEGORIES;
  const prompt = `${
    isPlace
      ? "This is a map link to a place. Classify what kind of place it is into exactly one category."
      : "Classify this link into exactly one category."
  }

Categories: ${categories.join(", ")}

${isPlace ? "Place name" : "Title"}: ${title}
Description: ${description}
URL: ${link}

Respond with only the category name, nothing else.`;
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 16,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text"
        ? response.content[0].text.trim()
        : "Other";

    const match = categories.find(
      (c) => c.toLowerCase() === text.toLowerCase(),
    ) as Category | PlaceCategory | undefined;
    return match ?? "Other";
  } catch {
    return "Other";
  }
}
