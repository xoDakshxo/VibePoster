# VibePoster - Architecture

## High-Level System Design

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                   │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Trends   │  │  Style   │  │   Post   │  │  Queue  │ │
│  │  Manager  │  │  Editor  │  │ Generator │  │  View   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ API Routes
┌──────────────────────┴──────────────────────────────────┐
│                   BACKEND (Next.js API)                   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Scraper    │  │  Style       │  │  Post         │  │
│  │   Service    │  │  Analyzer    │  │  Composer     │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                   │          │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌───────┴───────┐  │
│  │  Bluesky     │  │  LLM         │  │  X API        │  │
│  │  Jetstream   │  │  (Anthropic) │  │  v2           │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
              ┌────────┴────────┐
              │   SQLite (DB)   │
              │   via Prisma    │
              └─────────────────┘
```

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | Full-stack in one project, fast to build |
| **Language** | TypeScript | Type safety across frontend + backend |
| **UI** | Tailwind CSS + shadcn/ui | Minimal UI, fast to style, good defaults |
| **Database** | SQLite via Prisma | Zero infra, file-based, perfect for single-user POC |
| **LLM** | Anthropic Claude API | Style analysis + post generation |
| **Scraping** | Bluesky AT Protocol (Jetstream) | Free, real-time, open firehose |
| **Posting** | X API v2 (Free tier) | Tweet creation endpoint |
| **Trend Validation** | Google Trends (unofficial) | Confirm topic is actually trending |

## Data Flow

### Flow 1: Create a Trend & Discover Style

```
User creates trend ("AI agents")
        │
        ▼
Scraper Service
  ├── Connects to Bluesky Jetstream WebSocket
  ├── Filters posts matching keywords
  ├── Pulls last 48 hours of posts
  ├── Fetches engagement metrics (likes, reposts)
  └── Returns top 50 posts sorted by engagement
        │
        ▼
Style Analyzer (LLM)
  ├── Receives top 50 viral posts
  ├── Analyzes patterns across them
  └── Outputs a Style Card:
      ├── tone: "confident, slightly provocative"
      ├── format: "hot take opener + evidence + question hook"
      ├── length: "40-80 words"
      ├── hooks: ["Unpopular opinion:", "Nobody talks about this:"]
      ├── avoid: ["hashtag spam", "emoji walls", "threads"]
      └── examples: [3 sample posts in this style]
        │
        ▼
User reviews Style Card
  ├── Approves as-is → Style locked
  ├── Tweaks parameters → Re-generates samples
  └── Rejects → Re-scrape with different time window
```

### Flow 2: Generate & Publish a Post

```
User selects a trend → "AI agents"
        │
        ▼
Fresh Scrape (lightweight)
  ├── Pulls latest content about topic
  ├── News snippets, recent Bluesky posts
  └── Returns fresh context
        │
        ▼
Post Composer (LLM)
  ├── Inputs: Style Card + Fresh Content
  ├── Generates draft post
  └── Returns draft for approval
        │
        ▼
User reviews draft
  ├── Approves → Post added to queue or posted immediately
  ├── Regenerates → New draft with same inputs
  └── Edits manually → Modified version saved
        │
        ▼
X API v2 → Tweet published
```

## Project Structure

```
VibePoster/
├── docs/                       # Project documentation
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Home / Dashboard
│   │   ├── layout.tsx          # Root layout
│   │   ├── trends/
│   │   │   ├── page.tsx        # Trends list
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Single trend view (style card + posts)
│   │   ├── compose/
│   │   │   └── page.tsx        # Post composer
│   │   ├── queue/
│   │   │   └── page.tsx        # Post queue
│   │   └── api/
│   │       ├── trends/
│   │       │   └── route.ts    # CRUD for trends
│   │       ├── scrape/
│   │       │   └── route.ts    # Trigger Bluesky scrape
│   │       ├── style/
│   │       │   └── route.ts    # Style analysis
│   │       ├── compose/
│   │       │   └── route.ts    # Post generation
│   │       └── publish/
│   │           └── route.ts    # Post to X
│   ├── lib/
│   │   ├── db.ts               # Prisma client
│   │   ├── bluesky.ts          # Bluesky Jetstream client
│   │   ├── llm.ts              # Anthropic Claude client
│   │   ├── x-api.ts            # X API v2 client
│   │   └── style-analyzer.ts   # Style extraction logic
│   ├── components/
│   │   ├── trend-card.tsx      # Trend display component
│   │   ├── style-card.tsx      # Style card display/editor
│   │   ├── post-preview.tsx    # Post draft preview
│   │   ├── post-queue.tsx      # Queue list
│   │   └── ui/                 # shadcn/ui components
│   └── types/
│       └── index.ts            # Shared TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
├── .env.example                # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## External Service Dependencies

### Bluesky Jetstream (Scraping)

- **Endpoint**: `wss://jetstream2.us-east.bsky.network/subscribe`
- **Auth**: None required for public data
- **Rate Limits**: None (it's a public firehose)
- **Data Available**: Posts, likes, reposts, follows, profile updates
- **Filtering**: By collection type (`app.bsky.feed.post`) and content keywords

### Anthropic Claude API (LLM)

- **Used For**: Style analysis, post generation
- **Model**: Claude Sonnet (fast + cheap for this use case)
- **Estimated Cost**: ~$0.01-0.05 per style analysis, ~$0.005 per post generation
- **Auth**: API key in environment variable

### X API v2 (Posting)

- **Tier**: Free (allows tweet creation)
- **Endpoints Used**: `POST /2/tweets`
- **Rate Limits**: 1,500 tweets/month on free tier
- **Auth**: OAuth 2.0 with PKCE (user-context)

## Environment Variables

```
# Anthropic
ANTHROPIC_API_KEY=

# X API
X_API_KEY=
X_API_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=

# Database
DATABASE_URL="file:./dev.db"
```
