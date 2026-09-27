import datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class FitCategory(str, Enum):
    strong_fit = "Strong Fit"
    good_fit = "Good Fit"
    partial_fit = "Partial Fit"
    not_a_fit = "Not a Fit"


class AnalysisRequest(BaseModel):
    candidate_name: str = Field(..., min_length=1, max_length=255)
    target_role: str = Field(..., min_length=1, max_length=255)
    resume_text: str = Field(..., min_length=20, max_length=20000)

    company_name: str = Field(..., min_length=1, max_length=255)
    job_title: str = Field(..., min_length=1, max_length=255)
    job_description: str = Field(..., min_length=20, max_length=20000)

    @field_validator(
        "candidate_name", "target_role", "resume_text", "company_name", "job_title", "job_description"
    )
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be blank or whitespace only")
        return v


class MatchingQualification(BaseModel):
    requirement: str
    evidence: str


# This is the exact shape the LLM is instructed to return. Validating the raw
# model output against this schema is what lets us detect/reject malformed or
# ungrounded responses before they ever reach the database.
class LLMAnalysisOutput(BaseModel):
    overall_fit: FitCategory
    matching_qualifications: list[MatchingQualification]
    missing_requirements: list[str]
    explanation: str
    outreach_email: str


class AnalysisSummary(BaseModel):
    id: int
    created_at: datetime.datetime
    candidate_name: str
    target_role: str
    company_name: str
    job_title: str
    overall_fit: str

    model_config = {"from_attributes": True}


class AnalysisDetail(BaseModel):
    id: int
    created_at: datetime.datetime
    candidate_name: str
    target_role: str
    resume_text: str
    company_name: str
    job_title: str
    job_description: str
    overall_fit: str
    matching_qualifications: list[MatchingQualification]
    missing_requirements: list[str]
    explanation: str
    outreach_email: str

    model_config = {"from_attributes": True}


class OutreachUpdateRequest(BaseModel):
    outreach_email: str = Field(..., min_length=1, max_length=8000)
