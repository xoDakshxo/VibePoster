# VibePoster - Features & User Stories

## POC Scope (v0.1)

### Feature 1: Trend Management

**Description**: User can create, view, and delete topics (trends) they want to post about.

**User Stories**:
- As a user, I can create a new trend by entering a topic name and keywords so that VibePoster knows what to track.
- As a user, I can see all my active trends in a list so I can manage them.
- As a user, I can delete a trend I no longer care about.
- As a user, I can see the status of each trend (needs style, style locked, has drafts).

**Acceptance Criteria**:
- Trend has: name, keywords (comma-separated), description (optional), status
- Trends persist in SQLite database
- Minimal UI: list view with create/delete actions

---

### Feature 2: Bluesky Scraping

**Description**: For a given trend, scrape high-engagement posts from Bluesky matching the trend's keywords.

**User Stories**:
- As a user, I can trigger a scrape for a trend to pull recent viral posts about that topic.
- As a user, I can see the scraped posts sorted by engagement so I know what's working.
- As a user, I can re-scrape with different time windows if results are stale.

**Acceptance Criteria**:
- Connects to Bluesky Jetstream or uses Bluesky search API
- Filters posts by trend keywords
- Fetches engagement data (likes, reposts)
- Returns top 50 posts sorted by total engagement
- Scraped data stored in DB linked to the trend
- Shows post content, author, like count, repost count

---

### Feature 3: Style Analysis & Style Cards

**Description**: LLM analyzes scraped viral posts and extracts a Style Card — a structured set of style attributes that define how posts for this trend should sound.

**User Stories**:
- As a user, I can trigger style analysis after a scrape to generate a Style Card.
- As a user, I can see the Style Card with tone, format, hooks, length, patterns, and example posts.
- As a user, I can approve the Style Card to lock it for this trend.
- As a user, I can reject and re-generate the Style Card if it doesn't feel right.
- As a user, I can manually edit the Style Card before locking.

**Style Card Structure**:
```json
{
  "tone": "confident, slightly provocative",
  "format": "hot take opener + supporting point + question hook",
  "length": { "min_words": 40, "max_words": 80 },
  "hooks": [
    "Unpopular opinion:",
    "Nobody talks about this:",
    "Everyone's building X. Nobody's building Y."
  ],
  "avoid": [
    "hashtag spam",
    "emoji walls",
    "generic motivational tone"
  ],
  "examples": [
    "Sample post 1 in this style...",
    "Sample post 2 in this style...",
    "Sample post 3 in this style..."
  ]
}
```

**Acceptance Criteria**:
- LLM receives top scraped posts and outputs structured Style Card
- Style Card displayed in a readable, editable format
- User can approve (lock), reject (re-generate), or edit
- Locked Style Card saved to DB linked to the trend
- A trend can only have one active Style Card at a time

---

### Feature 4: Post Generation

**Description**: Using the locked Style Card + fresh content, generate draft posts for user approval.

**User Stories**:
- As a user, I can generate a new post draft for any trend with a locked style.
- As a user, I can see the generated draft and compare it against the Style Card.
- As a user, I can approve, edit, or regenerate the draft.
- As a user, I can generate multiple drafts at once (batch of 3-5).

**Acceptance Criteria**:
- LLM receives: Style Card + recent scraped content about the topic
- Generates a post that matches the style constraints
- Draft is stored in DB with status (draft, approved, published, rejected)
- User can regenerate without re-scraping (uses cached content)

---

### Feature 5: Post Queue & Publishing

**Description**: Approved posts go into a queue. User can publish directly to X from the queue.

**User Stories**:
- As a user, I can see all approved posts in a queue.
- As a user, I can publish a post to X with one click.
- As a user, I can remove a post from the queue.
- As a user, I can copy a post to clipboard (fallback if X API isn't configured).
- As a user, I can see which posts have been published and when.

**Acceptance Criteria**:
- Queue shows approved posts grouped by trend
- Publish button calls X API v2 to create tweet
- Post status updates to "published" with timestamp
- Copy-to-clipboard works as fallback
- Published posts show confirmation with link to tweet

---

### Feature 6: Dashboard / Home

**Description**: A single-page overview showing the state of all trends and recent activity.

**User Stories**:
- As a user, I can see all my trends and their status at a glance.
- As a user, I can see how many posts are in the queue.
- As a user, I can quickly navigate to any trend or the queue.

**Acceptance Criteria**:
- Shows: trend count, posts in queue, posts published today
- Quick links to each trend and the queue
- Minimal, clean layout

---

## Deferred Features (Post-POC)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Scheduled Posting** | Set frequency per trend (e.g., 2 posts/day) with auto-scheduling | High |
| **Auto-Scraping** | Cron-based scraping that runs on a schedule per trend | High |
| **Auto-Drafting** | Generate drafts automatically after scrape, notify user for approval | Medium |
| **Multi-Platform** | Post to Threads, LinkedIn, Bluesky in addition to X | Medium |
| **Analytics** | Track engagement on published posts, correlate with style | Medium |
| **Style Evolution** | Automatically update Style Cards as trends evolve | Medium |
| **Thread Support** | Generate multi-tweet threads, not just single posts | Low |
| **Image/Media** | Attach generated or scraped images to posts | Low |
| **Multi-User** | Authentication, per-user trends and settings | Low |
| **Google Trends** | Validate/discover trends using Google Trends data | Low |

## User Flow Summary

```
                    ┌──────────────┐
                    │  Dashboard   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │  Create  │ │  View    │ │  Queue   │
       │  Trend   │ │  Trend   │ │          │
       └────┬─────┘ └────┬─────┘ └────┬─────┘
            │             │            │
            ▼             ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │  Scrape  │ │  Style   │ │ Publish  │
       │  Posts   │ │  Card    │ │ to X     │
       └────┬─────┘ └────┬─────┘ └──────────┘
            │             │
            ▼             ▼
       ┌──────────┐ ┌──────────┐
       │ Analyze  │ │ Generate │
       │  Style   │ │  Posts   │
       └──────────┘ └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │ Approve  │
                    │ / Edit   │
                    └──────────┘
```
