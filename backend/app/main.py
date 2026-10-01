# FastAPI app: routes for creating, listing, and viewing resume-fit analyses
import logging

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, get_db
from app.llm import LLMError, run_resume_analysis
from app.models import Analysis
from app.schemas import (
    AnalysisDetail,
    AnalysisRequest,
    AnalysisSummary,
    OutreachUpdateRequest,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables on startup if they don't already exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MyPM Resume-Fit Assessment API")

# Allow the frontend origin(s) to call this API from the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Convert an ORM row into the API's detail response shape
def _to_detail(analysis: Analysis) -> AnalysisDetail:
    return AnalysisDetail(
        id=analysis.id,
        created_at=analysis.created_at,
        candidate_name=analysis.candidate_name,
        target_role=analysis.target_role,
        resume_text=analysis.resume_text,
        company_name=analysis.company_name,
        job_title=analysis.job_title,
        job_description=analysis.job_description,
        overall_fit=analysis.overall_fit,
        matching_qualifications=analysis.matching_qualifications,
        missing_requirements=analysis.missing_requirements,
        explanation=analysis.explanation,
        outreach_email=analysis.outreach_email,
    )


# Fetch an analysis by id or raise a 404
def _get_or_404(db: Session, analysis_id: int) -> Analysis:
    analysis = db.get(Analysis, analysis_id)
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


# Run the LLM analysis for a new resume/job pair and persist the result
@app.post("/api/analyses", response_model=AnalysisDetail)
def create_analysis(req: AnalysisRequest, db: Session = Depends(get_db)):
    try:
        result = run_resume_analysis(req)
    except LLMError as exc:
        logger.error("LLM analysis failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    analysis = Analysis(
        candidate_name=req.candidate_name,
        target_role=req.target_role,
        resume_text=req.resume_text,
        company_name=req.company_name,
        job_title=req.job_title,
        job_description=req.job_description,
        overall_fit=result.overall_fit.value,
        explanation=result.explanation,
        outreach_email=result.outreach_email,
    )
    analysis.matching_qualifications = [q.model_dump() for q in result.matching_qualifications]
    analysis.missing_requirements = result.missing_requirements

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return _to_detail(analysis)


# List all past analyses, newest first
@app.get("/api/analyses", response_model=list[AnalysisSummary])
def list_analyses(db: Session = Depends(get_db)):
    return db.query(Analysis).order_by(desc(Analysis.created_at)).all()


# Fetch one analysis's full detail
@app.get("/api/analyses/{analysis_id}", response_model=AnalysisDetail)
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    return _to_detail(_get_or_404(db, analysis_id))


# Let the recruiter edit the generated outreach email after the fact
@app.patch("/api/analyses/{analysis_id}/outreach", response_model=AnalysisDetail)
def update_outreach(analysis_id: int, req: OutreachUpdateRequest, db: Session = Depends(get_db)):
    analysis = _get_or_404(db, analysis_id)
    analysis.outreach_email = req.outreach_email
    db.commit()
    db.refresh(analysis)
    return _to_detail(analysis)
