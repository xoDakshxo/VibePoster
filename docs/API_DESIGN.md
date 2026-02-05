# VibePoster - API Design

## Internal API (Next.js API Routes)

All endpoints are under `/api/`. No authentication for POC (single-user, local).

---

### Trends

#### `GET /api/trends`

List all trends.

**Response**:
```json
{
  "trends": [
    {
      "id": "clx...",
      "name": "AI Agents",
      "keywords": "AI agents, autonomous AI, agentic",
      "description": "Posts about autonomous AI systems",
      "status": "active",
      "createdAt": "2025-01-15T10:00:00Z",
      "styleCard": { "id": "clx...", "tone": "...", "locked": true },
      "_count": { "posts": 12, "scrapedPosts": 50 }
    }
  ]
}
```

#### `POST /api/trends`

Create a new trend.

**Request**:
```json
{
  "name": "AI Agents",
  "keywords": "AI agents, autonomous AI, agentic",
  "description": "Posts about autonomous AI systems"
}
```

**Response**: Created trend object. Status set to `new`.

#### `GET /api/trends/:id`

Get a single trend with its Style Card and post counts.

#### `DELETE /api/trends/:id`

Delete a trend and all associated data (scraped posts, style card, generated posts). Cascading delete.

---

### Scraping

#### `POST /api/scrape`

Trigger a Bluesky scrape for a trend.

**Request**:
```json
{
  "trendId": "clx...",
  "hoursBack": 48,
  "limit": 50
}
```

**Response**:
```json
{
  "scrapedCount": 50,
  "topPost": {
    "content": "Everyone's building AI wrappers...",
    "likes": 342,
    "reposts": 89
  },
  "posts": [...]
}
```

**Implementation Notes**:
- Uses Bluesky search API (`app.bsky.feed.searchPosts`) to find posts matching trend keywords
- Fetches engagement metrics for each post
- Stores results in `ScrapedPost` table
- Updates trend status to `scraped`

#### `GET /api/scrape/:trendId`

Get previously scraped posts for a trend, sorted by engagement.

**Query params**: `?limit=50&offset=0`

---

### Style Analysis

#### `POST /api/style/analyze`

Trigger LLM style analysis on scraped posts.

**Request**:
```json
{
  "trendId": "clx..."
}
```

**Response**:
```json
{
  "styleCard": {
    "id": "clx...",
    "tone": "confident, slightly provocative",
    "format": "hot take opener + supporting point + question hook",
    "minWords": 40,
    "maxWords": 80,
    "hooks": ["Unpopular opinion:", "Nobody talks about this:"],
    "avoid": ["hashtag spam", "emoji walls"],
    "examples": [
      "Sample post 1...",
      "Sample post 2...",
      "Sample post 3..."
    ],
    "locked": false
  }
}
```

**Implementation Notes**:
- Fetches top 50 scraped posts for the trend
- Sends to Claude with a structured prompt asking for style extraction
- Parses LLM response into StyleCard fields
- Saves to DB (replaces existing unlocked Style Card if any)

#### `PUT /api/style/:id`

Update a Style Card (edit fields, lock/unlock).

**Request**:
```json
{
  "tone": "witty, contrarian",
  "locked": true
}
```

**Notes**: When `locked` is set to `true`, trend status updates to `styled`.

#### `POST /api/style/:id/regenerate`

Re-generate the Style Card using the same scraped data but a new LLM call.

---

### Post Composition

#### `POST /api/compose`

Generate a new post draft using the trend's Style Card.

**Request**:
```json
{
  "trendId": "clx...",
  "count": 1
}
```

**Response**:
```json
{
  "posts": [
    {
      "id": "clx...",
      "content": "Everyone's building AI agents. Nobody's building AI agent guardrails. The next big company isn't an agent — it's the thing that stops agents from going rogue. Who's working on this?",
      "status": "draft",
      "trendId": "clx..."
    }
  ]
}
```

**Implementation Notes**:
- Requires trend to have a locked Style Card
- Fetches Style Card + recent scraped content
- Sends to Claude with a composition prompt
- Validates output length (max 280 chars for X)
- Saves draft to `Post` table

#### `PUT /api/compose/:id`

Update a post (edit content, change status).

**Request**:
```json
{
  "content": "Edited post content...",
  "status": "approved"
}
```

---

### Publishing

#### `POST /api/publish/:id`

Publish an approved post to X.

**Response**:
```json
{
  "success": true,
  "tweetId": "1234567890",
  "tweetUrl": "https://x.com/user/status/1234567890"
}
```

**Implementation Notes**:
- Post must have status `approved`
- Calls X API v2 `POST /2/tweets`
- Updates post status to `published` with `tweetId`, `tweetUrl`, `publishedAt`
- Returns tweet URL for confirmation

#### `GET /api/queue`

Get all posts in the queue (approved but not yet published).

**Query params**: `?status=approved` or `?status=draft`

**Response**:
```json
{
  "posts": [
    {
      "id": "clx...",
      "content": "Post content...",
      "status": "approved",
      "trend": { "id": "clx...", "name": "AI Agents" },
      "createdAt": "2025-01-15T12:00:00Z"
    }
  ]
}
```

---

## External API Integration

### Bluesky AT Protocol

#### Search Posts

**Endpoint**: `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts`

**Method**: GET (no auth required for public search)

**Params**:
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query (trend keywords) |
| `sort` | string | `top` or `latest` |
| `since` | string | ISO datetime for time window start |
| `until` | string | ISO datetime for time window end |
| `limit` | int | Max results (1-100) |
| `cursor` | string | Pagination cursor |

**Response shape** (relevant fields):
```json
{
  "posts": [
    {
      "uri": "at://did:plc:xxx/app.bsky.feed.post/yyy",
      "author": {
        "did": "did:plc:xxx",
        "handle": "user.bsky.social",
        "displayName": "User Name"
      },
      "record": {
        "text": "The actual post content...",
        "createdAt": "2025-01-15T10:00:00Z"
      },
      "likeCount": 142,
      "repostCount": 38,
      "replyCount": 23
    }
  ],
  "cursor": "next_page_cursor"
}
```

**Notes**:
- No API key required
- Rate limits are generous for public endpoints
- `sort: "top"` returns by engagement, which is exactly what we need
- Paginate with cursor to get more than 100 results

### X API v2

#### Create Tweet

**Endpoint**: `https://api.twitter.com/2/tweets`

**Method**: POST

**Auth**: OAuth 2.0 User Context (Bearer token)

**Request**:
```json
{
  "text": "Tweet content here (max 280 chars)"
}
```

**Response**:
```json
{
  "data": {
    "id": "1234567890",
    "text": "Tweet content here"
  }
}
```

**Notes**:
- Free tier: 1,500 tweets/month
- Requires OAuth 2.0 with PKCE for user-context auth
- App must have "Read and Write" permissions
- Developer portal: https://developer.x.com/

---

## LLM Prompts

### Style Analysis Prompt

```
You are analyzing viral social media posts to extract a posting style profile.

Below are the top {count} most-engaged posts about "{topic}" from the last {hours} hours.

{posts_formatted}

Analyze these posts and extract a style profile. Return a JSON object with:
- tone: A 3-5 word description of the voice/tone (e.g., "confident, slightly provocative")
- format: The structural pattern most viral posts follow (e.g., "hot take + evidence + question")
- min_words: Minimum word count for posts in this style
- max_words: Maximum word count for posts in this style
- hooks: Array of 3-5 opening patterns/phrases that appear in top posts
- avoid: Array of 3-5 anti-patterns to avoid
- examples: Array of 3 NEW example posts written in this exact style (not copies of the input)

Return ONLY valid JSON, no other text.
```

### Post Composition Prompt

```
You are a social media writer. Write a post about "{topic}" using EXACTLY this style:

STYLE CARD:
- Tone: {tone}
- Format: {format}
- Length: {min_words}-{max_words} words
- Good hooks: {hooks}
- Avoid: {avoid}

REFERENCE STYLE (write like these, don't copy them):
{examples}

FRESH CONTEXT (use this info to make the post timely and specific):
{recent_scraped_content}

Rules:
- MUST be under 280 characters
- MUST match the tone and format exactly
- MUST use a hook from the list or a similar one
- MUST incorporate something from the fresh context
- Do NOT use hashtags unless the style card says to
- Do NOT use emojis unless the style card says to

Return ONLY the post text, nothing else.
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Human-readable error message",
  "code": "TREND_NOT_FOUND"
}
```

| HTTP Status | Usage |
|-------------|-------|
| 400 | Bad request (missing params, invalid state) |
| 404 | Resource not found |
| 422 | Validation error (e.g., Style Card not locked) |
| 500 | Internal error (LLM failure, X API error) |
| 502 | External service error (Bluesky down, X API down) |
