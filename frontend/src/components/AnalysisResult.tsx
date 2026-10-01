"use client";

// Displays a completed fit analysis: badge, explanation, matches/gaps, and an editable outreach email
import { useState } from "react";
import type { AnalysisDetail } from "@/lib/api";
import { updateOutreachEmail } from "@/lib/api";
import FitBadge from "@/components/FitBadge";

export default function AnalysisResult({ analysis }: { analysis: AnalysisDetail }) {
  const [outreach, setOutreach] = useState(analysis.outreach_email);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  // Persist the (possibly edited) outreach email back to the API
  async function handleSave() {
    setSaveState("saving");
    try {
      await updateOutreachEmail(analysis.id, outreach);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  }

  // Copy the outreach email text to the clipboard
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(outreach);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // clipboard access denied or unavailable; user can still select-and-copy manually
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {analysis.candidate_name}{" "}
            <span className="font-normal text-gray-500">→ {analysis.job_title}</span>
          </h2>
          <p className="text-sm text-gray-500">{analysis.company_name}</p>
        </div>
        <FitBadge fit={analysis.overall_fit} />
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Explanation
        </h3>
        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-800">{analysis.explanation}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Matching qualifications
          </h3>
          {analysis.matching_qualifications.length === 0 ? (
            <p className="text-sm text-gray-500">No matching qualifications found.</p>
          ) : (
            <ul className="space-y-3">
              {analysis.matching_qualifications.map((m, i) => (
                <li key={i} className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-sm font-medium text-emerald-900">{m.requirement}</p>
                  <p className="mt-1 text-sm text-emerald-700">&ldquo;{m.evidence}&rdquo;</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Missing requirements
          </h3>
          {analysis.missing_requirements.length === 0 ? (
            <p className="text-sm text-gray-500">No gaps identified.</p>
          ) : (
            <ul className="space-y-2">
              {analysis.missing_requirements.map((req, i) => (
                <li
                  key={i}
                  className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  {req}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Outreach email
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === "saving"}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save edits"}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
            >
              {copyState === "copied" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <textarea
          value={outreach}
          onChange={(e) => setOutreach(e.target.value)}
          rows={8}
          className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
        />
        {saveState === "error" && (
          <p className="mt-1 text-sm text-red-600">Could not save your edits. Try again.</p>
        )}
      </div>
    </div>
  );
}
