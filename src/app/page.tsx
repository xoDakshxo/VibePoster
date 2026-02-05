"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendCard } from "@/components/trend-card";
import { CreateTrendForm } from "@/components/create-trend-form";
import { Loader2 } from "lucide-react";

interface Trend {
  id: string;
  name: string;
  keywords: string;
  status: string;
  styleCard: { locked: boolean } | null;
  _count: { scrapedPosts: number; posts: number };
}

export default function DashboardPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrends = async () => {
    const res = await fetch("/api/trends");
    const data = await res.json();
    setTrends(data.trends);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/trends/${id}`, { method: "DELETE" });
    fetchTrends();
  };

  const queueCount = trends.reduce((acc, t) => acc + t._count.posts, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your trends and posts
          </p>
        </div>
        <CreateTrendForm onCreated={fetchTrends} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">
            Trends
          </p>
          <p className="text-2xl font-semibold text-zinc-100 mt-1">
            {trends.length}
          </p>
        </div>
        <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">
            Active Styles
          </p>
          <p className="text-2xl font-semibold text-zinc-100 mt-1">
            {trends.filter((t) => t.styleCard?.locked).length}
          </p>
        </div>
        <Link
          href="/queue"
          className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50 hover:border-zinc-600 transition-colors"
        >
          <p className="text-xs text-zinc-500 uppercase tracking-wide">
            Total Posts
          </p>
          <p className="text-2xl font-semibold text-zinc-100 mt-1">
            {queueCount}
          </p>
        </Link>
      </div>

      {/* Trends List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-zinc-500" size={24} />
        </div>
      ) : trends.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500">No trends yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trends.map((trend) => (
            <TrendCard
              key={trend.id}
              id={trend.id}
              name={trend.name}
              keywords={trend.keywords}
              status={trend.status}
              styleCard={trend.styleCard}
              postCount={trend._count.posts}
              scrapedCount={trend._count.scrapedPosts}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
