# VibePoster - Project Overview

## What is VibePoster?

VibePoster is a trend-aware social posting tool that helps users create high-engagement posts on X (Twitter) by analyzing what's actually working right now on social media.

Instead of guessing what tone or format to use, VibePoster scrapes real-time viral posts from Bluesky's open firehose, extracts the winning style patterns using LLMs, and lets the user lock a "Style Card" per topic. Every post generated from that point forward matches the proven style — grounded in fresh, scraped content.

## The Problem

Posting on X effectively is hard because:

- **Style matters more than substance.** The same insight posted two different ways gets 10x different engagement.
- **Trends move fast.** By the time you figure out a topic is hot, the window is closing.
- **Consistency is exhausting.** Maintaining a posting cadence across multiple topics/niches burns people out.
- **Generic AI content fails.** ChatGPT-style posts are obvious and get ignored. Posts need to match the *current* viral style for a specific niche, not a generic "professional" tone.

## The Solution

VibePoster solves this with a simple pipeline:

```
Pick a Topic → Scrape What's Viral → Extract the Style → Generate Posts → Approve & Post
```

### Core Loop

1. **User selects a topic** — "AI agents", "crypto regulation", "indie hacking", etc.
2. **VibePoster scrapes** — Pulls recent high-engagement posts about that topic from Bluesky's public firehose.
3. **LLM analyzes style** — Reads the top-performing posts and extracts a Style Card (tone, format, hooks, length, patterns).
4. **User reviews & locks** — User sees the Style Card with sample posts, tweaks if needed, and locks it.
5. **Post generation** — When ready to post, VibePoster combines the locked style + freshly scraped content to generate a draft.
6. **User approves** — One-tap approve and post to X.

### Key Differentiator: Style Cards

Each topic/trend gets its own **Style Card** — a locked set of style attributes that define how posts for that topic should sound. This means:

- Your AI takes on different styles at different times
- Posts for "AI agents" can be provocative hot takes
- Posts for "startup fundraising" can be story-driven threads
- Each style is derived from *actual viral data*, not generic prompts

## Why Bluesky as the Data Source?

- **Free, open, real-time** — AT Protocol firehose requires no API key, no payment, no rate limits
- **Same culture as X** — Short-form, engagement-driven, same user base overlap
- **Engagement data is public** — Likes, reposts, reply counts are all accessible
- **Legal** — Open protocol, designed for this kind of access
- **Style signal is high quality** — People who go viral on X cross-post to Bluesky with identical style

## Target User

The initial target is a single power user (the developer themselves) who:

- Wants to post regularly on X across 2-5 topics
- Cares about engagement and style, not just publishing
- Wants AI assistance but with full approval control
- Doesn't want to pay $100+/mo for X API analytics tools

## Vision (Post-POC)

- Multi-platform posting (Threads, LinkedIn, Bluesky itself)
- Automated scheduling with frequency controls
- Cron-based scraping and auto-drafting
- Analytics dashboard (what styles perform best over time)
- Multiple user support
- Fine-tuned style models per user
