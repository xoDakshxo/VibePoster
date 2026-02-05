# VibePoster

Trend-aware social posting tool that analyzes viral posting styles from Bluesky's open firehose and generates on-brand posts for X (Twitter).

## How it works

```
Pick a Topic → Scrape Bluesky → Extract Viral Style → Lock a Style Card → Generate Posts → Approve & Publish to X
```

1. **Create a Trend** — Define a topic and keywords (e.g., "AI Agents")
2. **Scrape** — Pulls top-engagement posts from Bluesky matching your keywords
3. **Analyze Style** — LLM reads the viral posts and extracts a Style Card (tone, format, hooks, word range, anti-patterns)
4. **Lock the Style** — Review, tweak, and lock the Style Card for that trend
5. **Generate Posts** — LLM composes drafts using your locked style + fresh scraped content
6. **Approve & Publish** — Review drafts, approve, and post directly to X

Each trend gets its own Style Card — so your AI agents topic can be provocative hot takes while your startup topic is story-driven.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (dark theme)
- **Database**: SQLite via Prisma
- **LLM**: Anthropic Claude (style analysis + post composition)
- **Scraping**: Bluesky AT Protocol public search API (free, no auth)
- **Publishing**: X API v2 (OAuth 1.0a)

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- X API credentials (for publishing — optional for local dev)

### Setup

```bash
# Install dependencies
npm install

# Copy env template and fill in your keys
cp .env.example .env

# Run database migration
npx prisma migrate dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=sk-ant-...        # Required for style analysis & post generation
X_API_KEY=...                        # Required for publishing to X
X_API_SECRET=...
X_ACCESS_TOKEN=...
X_ACCESS_TOKEN_SECRET=...
```

## Project Structure

```
├── docs/                          # Project documentation
│   ├── PROJECT_OVERVIEW.md        # Vision and concept
│   ├── ARCHITECTURE.md            # System design and data flows
│   ├── FEATURES.md                # Feature specs and user stories
│   ├── DATA_MODELS.md             # Database schema details
│   └── API_DESIGN.md              # API endpoints and LLM prompts
├── prisma/
│   └── schema.prisma              # Trend, StyleCard, ScrapedPost, Post
├── src/
│   ├── app/
│   │   ├── page.tsx               # Dashboard
│   │   ├── trends/page.tsx        # Trends list
│   │   ├── trends/[id]/page.tsx   # Trend detail (full pipeline)
│   │   ├── queue/page.tsx         # Post queue
│   │   └── api/                   # REST API routes
│   ├── components/                # UI components
│   ├── lib/
│   │   ├── bluesky.ts             # Bluesky search client
│   │   ├── llm.ts                 # Anthropic Claude client
│   │   ├── x-api.ts               # X API client
│   │   └── db.ts                  # Prisma singleton
│   └── types/                     # Shared TypeScript types
└── .env.example
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/trends` | List or create trends |
| GET/DELETE | `/api/trends/[id]` | Get or delete a trend |
| POST | `/api/scrape` | Scrape Bluesky for a trend |
| GET | `/api/scrape/[trendId]` | Get scraped posts |
| POST | `/api/style/analyze` | Analyze style from scraped posts |
| PUT | `/api/style/[id]` | Update/lock a Style Card |
| POST | `/api/style/[id]/regenerate` | Regenerate a Style Card |
| POST | `/api/compose` | Generate post drafts |
| PUT | `/api/compose/[id]` | Update a post (approve/reject) |
| POST | `/api/publish/[id]` | Publish to X |
| GET | `/api/queue` | List posts by status |

## Why Bluesky?

- **Free and open** — AT Protocol firehose, no API key needed for public search
- **Same culture as X** — Short-form, engagement-driven, overlapping user base
- **Engagement data is public** — Likes, reposts, replies all accessible
- **Legal** — Open protocol, designed for third-party access
