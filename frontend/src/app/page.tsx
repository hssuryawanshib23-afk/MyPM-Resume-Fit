"use client";

import { useState } from "react";
import AnalysisForm from "@/components/AnalysisForm";
import AnalysisResult from "@/components/AnalysisResult";
import { ApiError, createAnalysis, type AnalysisDetail, type AnalysisRequest } from "@/lib/api";

export default function HomePage() {
  const [result, setResult] = useState<AnalysisDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: AnalysisRequest) {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const analysis = await createAnalysis(data);
      setResult(analysis);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume vs. job fit analysis</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter the candidate&apos;s resume and the target job description to get a grounded fit
          assessment and a draft outreach email.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <AnalysisForm onSubmit={handleSubmit} submitting={submitting} />
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {submitting && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          Analyzing resume against job description…
        </div>
      )}

      {result && !submitting && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <AnalysisResult analysis={result} />
        </div>
      )}
    </div>
  );
}
