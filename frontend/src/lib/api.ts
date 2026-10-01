// API client: types and fetch wrappers for talking to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type FitCategory = "Strong Fit" | "Good Fit" | "Partial Fit" | "Not a Fit";

export interface MatchingQualification {
  requirement: string;
  evidence: string;
}

export interface AnalysisRequest {
  candidate_name: string;
  target_role: string;
  resume_text: string;
  company_name: string;
  job_title: string;
  job_description: string;
}

export interface AnalysisSummary {
  id: number;
  created_at: string;
  candidate_name: string;
  target_role: string;
  company_name: string;
  job_title: string;
  overall_fit: FitCategory;
}

export interface AnalysisDetail extends AnalysisSummary {
  resume_text: string;
  job_description: string;
  matching_qualifications: MatchingQualification[];
  missing_requirements: string[];
  explanation: string;
  outreach_email: string;
}

// Thrown for any failed request, carrying the HTTP status for callers to inspect
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Shared fetch wrapper: sets JSON headers, parses error details, and JSON-decodes the response
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(0, "Could not reach the API server. Is the backend running?");
  }

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") {
        detail = body.detail;
      } else if (Array.isArray(body.detail)) {
        detail = body.detail.map((d: { msg?: string }) => d.msg).join("; ");
      }
    } catch {
      // response body wasn't JSON; keep the generic message
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

// Submit a new resume/job pair for LLM analysis
export function createAnalysis(payload: AnalysisRequest): Promise<AnalysisDetail> {
  return request<AnalysisDetail>("/api/analyses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Fetch the history list (summaries only)
export function listAnalyses(): Promise<AnalysisSummary[]> {
  return request<AnalysisSummary[]>("/api/analyses");
}

// Fetch one analysis's full detail by id
export function getAnalysis(id: number): Promise<AnalysisDetail> {
  return request<AnalysisDetail>(`/api/analyses/${id}`);
}

// Save edits to the generated outreach email
export function updateOutreachEmail(id: number, outreach_email: string): Promise<AnalysisDetail> {
  return request<AnalysisDetail>(`/api/analyses/${id}/outreach`, {
    method: "PATCH",
    body: JSON.stringify({ outreach_email }),
  });
}
