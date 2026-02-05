"use client";

import { useEffect, useState } from "react";
import { PostPreview } from "@/components/post-preview";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  trendId: string;
  content: string;
  status: string;
  tweetUrl: string | null;
  trend: { id: string; name: string };
}

type Tab = "approved" | "draft" | "published";

export default function QueuePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("approved");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPosts = async (status: string) => {
    setLoading(true);
    const res = await fetch(`/api/queue?status=${status}`);
    const data = await res.json();
    setPosts(data.posts);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/compose/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      fetchPosts(activeTab);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/compose/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      fetchPosts(activeTab);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/publish/${id}`, { method: "POST" });
      fetchPosts(activeTab);
    } finally {
      setActionLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "approved", label: "Ready to Post" },
    { key: "draft", label: "Drafts" },
    { key: "published", label: "Published" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-100 mb-6">Queue</h1>

      <div className="flex items-center gap-1 mb-6 border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "text-sm px-4 py-2 border-b-2 transition-colors",
              activeTab === tab.key
                ? "border-zinc-100 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-zinc-500" size={24} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500">
            No {activeTab} posts yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostPreview
              key={post.id}
              id={post.id}
              content={post.content}
              status={post.status}
              tweetUrl={post.tweetUrl}
              trendName={post.trend.name}
              onApprove={handleApprove}
              onReject={handleReject}
              onPublish={handlePublish}
              onCopy={(content) => navigator.clipboard.writeText(content)}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
