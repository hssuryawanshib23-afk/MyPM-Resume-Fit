"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, listAnalyses, type AnalysisSummary } from "@/lib/api";
import FitBadge from "@/components/FitBadge";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAnalyses()
      .then(setAnalyses)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Could not load history."),
      );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analysis history</h1>
        <p className="mt-1 text-sm text-gray-600">Reopen a previous analysis below.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {!analyses && !error && (
        <p className="text-sm text-gray-500">Loading history…</p>
      )}

      {analyses && analyses.length === 0 && (
        <p className="text-sm text-gray-500">No analyses yet. Run one from the New analysis page.</p>
      )}

      {analyses && analyses.length > 0 && (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
          {analyses.map((a) => (
            <li key={a.id}>
              <Link
                href={`/history/${a.id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {a.candidate_name} <span className="text-gray-400">·</span>{" "}
                    <span className="text-gray-600">{a.job_title}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {a.company_name} — {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <FitBadge fit={a.overall_fit} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
