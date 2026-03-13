"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PriceChartProps {
  itemId: string;
  region?: string;
}

interface ChartDataPoint {
  date: string;
  avgPrice: number;
  volume: number;
}

export default function PriceChart({ itemId, region = "europe" }: PriceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/prices?type=history&itemId=${encodeURIComponent(itemId)}&region=${region}`
        );
        if (!res.ok) throw new Error("Failed to fetch history");
        const json = await res.json();

        const points: ChartDataPoint[] = [];
        if (json.length > 0 && json[0].data) {
          for (const entry of json[0].data) {
            points.push({
              date: new Date(entry.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              avgPrice: Math.round(entry.avg_price),
              volume: entry.item_count,
            });
          }
        }
        setData(points);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [itemId, region]);

  if (loading) {
    return <div className="h-64 bg-gray-800 rounded animate-pulse"></div>;
  }
  if (error) {
    return <div className="text-red-400 text-sm py-4">Failed to load price history: {error}</div>;
  }
  if (data.length === 0) {
    return <div className="text-gray-500 text-sm py-4">No price history available</div>;
  }

  return (
    <div className="bg-albion-darker rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Price History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
            labelStyle={{ color: "#9CA3AF" }}
          />
          <Legend />
          <Line type="monotone" dataKey="avgPrice" stroke="#3B82F6" name="Avg Price" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
