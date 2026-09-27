"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, getAnalysis, type AnalysisDetail } from "@/lib/api";
import AnalysisResult from "@/components/AnalysisResult";

export default function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalysis(Number(id))
      .then(setAnalysis)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Could not load this analysis."),
      );
  }, [id]);

  return (
    <div className="space-y-6">
      <Link href="/history" className="text-sm font-medium text-gray-600 hover:text-gray-900">
        ← Back to history
      </Link>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {!analysis && !error && <p className="text-sm text-gray-500">Loading analysis…</p>}

      {analysis && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <AnalysisResult analysis={analysis} />
        </div>
      )}
    </div>
  );
}
