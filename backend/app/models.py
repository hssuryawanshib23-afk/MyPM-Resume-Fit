# ORM model for a stored resume-fit analysis
import datetime
import json

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, index=True
    )

    candidate_name: Mapped[str] = mapped_column(String(255))
    target_role: Mapped[str] = mapped_column(String(255))
    resume_text: Mapped[str] = mapped_column(Text)

    company_name: Mapped[str] = mapped_column(String(255))
    job_title: Mapped[str] = mapped_column(String(255))
    job_description: Mapped[str] = mapped_column(Text)

    overall_fit: Mapped[str] = mapped_column(String(50))
    # Stored as JSON strings since SQLite has no native array/JSON column here.
    matching_qualifications_json: Mapped[str] = mapped_column(Text, default="[]")
    missing_requirements_json: Mapped[str] = mapped_column(Text, default="[]")
    explanation: Mapped[str] = mapped_column(Text)

    outreach_email: Mapped[str] = mapped_column(Text)

    # Expose the JSON-backed columns as plain Python lists
    @property
    def matching_qualifications(self) -> list:
        return json.loads(self.matching_qualifications_json or "[]")

    @matching_qualifications.setter
    def matching_qualifications(self, value: list) -> None:
        self.matching_qualifications_json = json.dumps(value)

    @property
    def missing_requirements(self) -> list:
        return json.loads(self.missing_requirements_json or "[]")

    @missing_requirements.setter
    def missing_requirements(self, value: list) -> None:
        self.missing_requirements_json = json.dumps(value)
