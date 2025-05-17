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

  if (!body.deckName || !body.deckDescription) {
    return createError({
      statusCode: 400,
      statusMessage: "Bad Request",
    });
  }

  let { deckName, deckDescription } = body;

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates flashcards for a deck.",
      },
      {
        role: "user",
        content: `Generate a deck of flashcards for the deck with the name ${deckName} and description ${deckDescription}. Generate 10 cards.`,
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
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                description: `Generate a front and back for the card. The front should be a question and the back should be the answer.`,
                properties: {
                  front: {
                    type: "string",
                    description: "This is the question of the card",
                  },
                  back: {
                    type: "string",
                    description: "This is the answer of the card",
                  },
                  tags: {
                    type: "array",
                    description: "Tags for the card. 3 tags",
                    items: {
                      type: "string",
                    },
                  },
                  nextReview: {
                    type: "string",
                    description:
                      "This is the next review date of the card. Return empty string",
                  },
                  repetitions: {
                    type: "number",
                    description:
                      "This is the number of times the card has been reviewed. Return 0",
                  },
                },
                required: [
                  "front",
                  "back",
                  "tags",
                  "nextReview",
                  "repetitions",
                ],
              },
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
