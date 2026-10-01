"use client";

// Form for entering candidate resume + job description, with client-side validation
import { useState } from "react";
import type { AnalysisRequest } from "@/lib/api";

// Initial/empty form values
const EMPTY: AnalysisRequest = {
  candidate_name: "",
  target_role: "",
  resume_text: "",
  company_name: "",
  job_title: "",
  job_description: "",
};

// Human-readable label per field
const FIELD_LABELS: Record<keyof AnalysisRequest, string> = {
  candidate_name: "Candidate name",
  target_role: "Target role",
  resume_text: "Resume text",
  company_name: "Company name",
  job_title: "Job title",
  job_description: "Job description",
};

// Minimum character count required per field (defaults to 1 if unset)
const MIN_LENGTHS: Partial<Record<keyof AnalysisRequest, number>> = {
  resume_text: 20,
  job_description: 20,
};

export default function AnalysisForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (data: AnalysisRequest) => void;
  submitting: boolean;
}) {
  const [values, setValues] = useState<AnalysisRequest>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof AnalysisRequest, string>>>({});

  // Check all fields against required/min-length rules, storing any error messages
  function validate(): boolean {
    const nextErrors: Partial<Record<keyof AnalysisRequest, string>> = {};
    (Object.keys(EMPTY) as (keyof AnalysisRequest)[]).forEach((key) => {
      const value = values[key].trim();
      const minLength = MIN_LENGTHS[key] ?? 1;
      if (!value) {
        nextErrors[key] = `${FIELD_LABELS[key]} is required.`;
      } else if (value.length < minLength) {
        nextErrors[key] = `${FIELD_LABELS[key]} must be at least ${minLength} characters.`;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleChange(key: keyof AnalysisRequest, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  // Validate before calling the parent's onSubmit handler
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit(values);
    }
  }

  // Input border turns red when a field has a validation error
  const inputClass = (key: keyof AnalysisRequest) =>
    `w-full rounded-md border p-2 text-sm text-gray-900 focus:outline-none ${
      errors[key] ? "border-red-400" : "border-gray-300 focus:border-gray-500"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Candidate
        </legend>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {FIELD_LABELS.candidate_name}
          </label>
          <input
            className={inputClass("candidate_name")}
            value={values.candidate_name}
            onChange={(e) => handleChange("candidate_name", e.target.value)}
            placeholder="Riya Shah"
          />
          {errors.candidate_name && (
            <p className="mt-1 text-xs text-red-600">{errors.candidate_name}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {FIELD_LABELS.target_role}
          </label>
          <input
            className={inputClass("target_role")}
            value={values.target_role}
            onChange={(e) => handleChange("target_role", e.target.value)}
            placeholder="Customer Success Manager"
          />
          {errors.target_role && (
            <p className="mt-1 text-xs text-red-600">{errors.target_role}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {FIELD_LABELS.resume_text}
          </label>
          <textarea
            className={inputClass("resume_text")}
            rows={8}
            value={values.resume_text}
            onChange={(e) => handleChange("resume_text", e.target.value)}
            placeholder="Paste the candidate's resume text here…"
          />
          {errors.resume_text && (
            <p className="mt-1 text-xs text-red-600">{errors.resume_text}</p>
          )}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Job
        </legend>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {FIELD_LABELS.company_name}
          </label>
          <input
            className={inputClass("company_name")}
            value={values.company_name}
            onChange={(e) => handleChange("company_name", e.target.value)}
            placeholder="Acme Corp"
          />
          {errors.company_name && (
            <p className="mt-1 text-xs text-red-600">{errors.company_name}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {FIELD_LABELS.job_title}
          </label>
          <input
            className={inputClass("job_title")}
            value={values.job_title}
            onChange={(e) => handleChange("job_title", e.target.value)}
            placeholder="Enterprise Customer Success Manager"
          />
          {errors.job_title && <p className="mt-1 text-xs text-red-600">{errors.job_title}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {FIELD_LABELS.job_description}
          </label>
          <textarea
            className={inputClass("job_description")}
            rows={8}
            value={values.job_description}
            onChange={(e) => handleChange("job_description", e.target.value)}
            placeholder="Paste the job description here…"
          />
          {errors.job_description && (
            <p className="mt-1 text-xs text-red-600">{errors.job_description}</p>
          )}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 sm:w-auto"
      >
        {submitting ? "Analyzing…" : "Analyze fit"}
      </button>
    </form>
  );
}
