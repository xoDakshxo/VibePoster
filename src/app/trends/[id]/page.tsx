"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { StyleCardDisplay } from "@/components/style-card-view";
import { ScrapedPostsList } from "@/components/scraped-posts-list";
import { PostPreview } from "@/components/post-preview";
import { Loader2, Search, Sparkles, PenLine, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StyleCardView } from "@/types";

interface TrendDetail {
  id: string;
  name: string;
  keywords: string;
  description: string | null;
  status: string;
  styleCard: StyleCardView | null;
  _count: { scrapedPosts: number; posts: number };
}

interface ScrapedPost {
  id: string;
  authorHandle: string;
  content: string;
  likes: number;
  reposts: number;
  replies: number;
  engagement: number;
}

interface Post {
  id: string;
  trendId: string;
  content: string;
  status: string;
  tweetUrl: string | null;
}

export default function TrendDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [trend, setTrend] = useState<TrendDetail | null>(null);
  const [scrapedPosts, setScrapedPosts] = useState<ScrapedPost[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [composing, setComposing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTrend = useCallback(async () => {
    const res = await fetch(`/api/trends/${id}`);
    if (!res.ok) {
      router.push("/trends");
      return;
    }
    const data = await res.json();
    setTrend(data);
    setLoading(false);
  }, [id, router]);

  const fetchScrapedPosts = useCallback(async () => {
    const res = await fetch(`/api/scrape/${id}`);
    const data = await res.json();
    setScrapedPosts(data.posts);
  }, [id]);

  const fetchPosts = useCallback(async () => {
    const res = await fetch(`/api/queue?status=draft`);
    const data = await res.json();
    const trendPosts = data.posts.filter(
      (p: Post) => p.trendId === id
    );

    const approvedRes = await fetch(`/api/queue?status=approved`);
    const approvedData = await approvedRes.json();
    const approvedPosts = approvedData.posts.filter(
      (p: Post) => p.trendId === id
    );

    setPosts([...trendPosts, ...approvedPosts]);
  }, [id]);

  useEffect(() => {
    fetchTrend();
    fetchScrapedPosts();
    fetchPosts();
  }, [fetchTrend, fetchScrapedPosts, fetchPosts]);

  const handleScrape = async () => {
    setScraping(true);
    try {
      await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendId: id }),
      });
      await fetchTrend();
      await fetchScrapedPosts();
    } finally {
      setScraping(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await fetch("/api/style/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendId: id }),
      });
      await fetchTrend();
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLockStyle = async () => {
    if (!trend?.styleCard) return;
    setActionLoading(true);
    try {
      await fetch(`/api/style/${trend.styleCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locked: true }),
      });
      await fetchTrend();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerateStyle = async () => {
    if (!trend?.styleCard) return;
    setAnalyzing(true);
    try {
      await fetch(`/api/style/${trend.styleCard.id}/regenerate`, {
        method: "POST",
      });
      await fetchTrend();
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCompose = async () => {
    setComposing(true);
    try {
      await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendId: id, count: 3 }),
      });
      await fetchPosts();
      await fetchTrend();
    } finally {
      setComposing(false);
    }
  };

  const handlePostAction = async (
    postId: string,
    action: "approved" | "rejected"
  ) => {
    setActionLoading(true);
    try {
      await fetch(`/api/compose/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      await fetchPosts();
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (postId: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/publish/${postId}`, { method: "POST" });
      await fetchPosts();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-zinc-500" size={24} />
      </div>
    );
  }

  if (!trend) return null;

  return (
    <div>
      <Link
        href="/trends"
        className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back to Trends
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">
            {trend.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{trend.keywords}</p>
          {trend.description && (
            <p className="text-sm text-zinc-400 mt-1">{trend.description}</p>
          )}
        </div>
      </div>

      {/* Action Pipeline */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={handleScrape}
          disabled={scraping}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {scraping ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}
          {scraping ? "Scraping..." : "Scrape Bluesky"}
        </button>

        {scrapedPosts.length > 0 && !trend.styleCard && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-purple-900 text-purple-300 hover:bg-purple-800 transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {analyzing ? "Analyzing..." : "Analyze Style"}
          </button>
        )}

        {trend.styleCard?.locked && (
          <button
            onClick={handleCompose}
            disabled={composing}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-blue-900 text-blue-300 hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {composing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <PenLine size={14} />
            )}
            {composing ? "Generating..." : "Generate Posts"}
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* Style Card */}
        {trend.styleCard && (
          <StyleCardDisplay
            styleCard={trend.styleCard}
            onLock={handleLockStyle}
            onRegenerate={handleRegenerateStyle}
            loading={analyzing || actionLoading}
          />
        )}

        {/* Generated Posts */}
        {posts.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-zinc-100 mb-3">
              Generated Posts
            </h2>
            <div className="space-y-3">
              {posts.map((post) => (
                <PostPreview
                  key={post.id}
                  id={post.id}
                  content={post.content}
                  status={post.status}
                  tweetUrl={post.tweetUrl}
                  onApprove={(id) => handlePostAction(id, "approved")}
                  onReject={(id) => handlePostAction(id, "rejected")}
                  onPublish={handlePublish}
                  onCopy={(content) => navigator.clipboard.writeText(content)}
                  loading={actionLoading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Scraped Posts */}
        {scrapedPosts.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-zinc-100 mb-3">
              Scraped Posts ({scrapedPosts.length})
            </h2>
            <ScrapedPostsList posts={scrapedPosts} />
          </div>
        )}
      </div>
    </div>
  );
}
