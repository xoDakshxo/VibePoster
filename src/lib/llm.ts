import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface StyleCardData {
  tone: string;
  format: string;
  min_words: number;
  max_words: number;
  hooks: string[];
  avoid: string[];
  examples: string[];
}

export async function analyzeStyle(
  topic: string,
  posts: { content: string; likes: number; reposts: number }[],
  hoursBack: number = 48
): Promise<StyleCardData> {
  const postsFormatted = posts
    .map(
      (p, i) =>
        `${i + 1}. [${p.likes} likes, ${p.reposts} reposts]\n${p.content}`
    )
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are analyzing viral social media posts to extract a posting style profile.

Below are the top ${posts.length} most-engaged posts about "${topic}" from the last ${hoursBack} hours.

${postsFormatted}

Analyze these posts and extract a style profile. Return a JSON object with:
- tone: A 3-5 word description of the voice/tone (e.g., "confident, slightly provocative")
- format: The structural pattern most viral posts follow (e.g., "hot take + evidence + question")
- min_words: Minimum word count for posts in this style
- max_words: Maximum word count for posts in this style
- hooks: Array of 3-5 opening patterns/phrases that appear in top posts
- avoid: Array of 3-5 anti-patterns to avoid
- examples: Array of 3 NEW example posts written in this exact style (not copies of the input)

Return ONLY valid JSON, no other text.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return JSON.parse(text) as StyleCardData;
}

export async function composePost(
  topic: string,
  styleCard: {
    tone: string;
    format: string;
    minWords: number;
    maxWords: number;
    hooks: string[];
    avoid: string[];
    examples: string[];
  },
  recentContent: string[]
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are a social media writer. Write a post about "${topic}" using EXACTLY this style:

STYLE CARD:
- Tone: ${styleCard.tone}
- Format: ${styleCard.format}
- Length: ${styleCard.minWords}-${styleCard.maxWords} words
- Good hooks: ${styleCard.hooks.join(", ")}
- Avoid: ${styleCard.avoid.join(", ")}

REFERENCE STYLE (write like these, don't copy them):
${styleCard.examples.join("\n\n")}

FRESH CONTEXT (use this info to make the post timely and specific):
${recentContent.join("\n\n")}

Rules:
- MUST be under 280 characters
- MUST match the tone and format exactly
- MUST use a hook from the list or a similar one
- MUST incorporate something from the fresh context
- Do NOT use hashtags unless the style card says to
- Do NOT use emojis unless the style card says to

Return ONLY the post text, nothing else.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return text.trim();
}
