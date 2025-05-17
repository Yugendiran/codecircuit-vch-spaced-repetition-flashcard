import OpenAI from "openai";

// Temporary key for the demo. Will be deactivated after the hackathon.
const openai = new OpenAI({
  apiKey:
    "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",
  dangerouslyAllowBrowser: true,
});

export default defineEventHandler(async (event) => {
  // Ensure this is a POST request
  if (event.method !== "POST") {
    return createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  // Get request body
  const body = await readBody(event);
  const topic = body.topic || "";

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates a deck of flashcards.",
      },
      {
        role: "user",
        content: `Generate a deck of flashcards ${
          topic ? `about ${topic}` : ""
        }`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "content_response",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            content: {
              type: "object",
              additionalProperties: false,
              description: `Generate a title and description for a flashcard deck ${
                topic ? `about ${topic}` : ""
              }. The title should be a single word or phrase. The description should be a short description of the deck`,
              properties: {
                title: {
                  type: "string",
                  description:
                    "Title of the deck. It should be a single word or phrase. But not same as the topic",
                },
                description: {
                  type: "string",
                  description:
                    "Description of the deck. It should be a short description of the deck. It should be a single sentence.",
                },
              },
              required: ["title", "description"],
            },
          },
          required: ["content"],
        },
      },
    },
  });

  let output: any = aiResponse.choices[0].message.content;
  output = JSON.parse(output);

  return {
    content: output.content,
  };
});
