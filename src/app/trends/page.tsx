"use client";

import { useEffect, useState } from "react";
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

export default function TrendsPage() {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Trends</h1>
        <CreateTrendForm onCreated={fetchTrends} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-zinc-500" size={24} />
        </div>
      ) : trends.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500">
            No trends yet. Create one to get started.
          </p>
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
