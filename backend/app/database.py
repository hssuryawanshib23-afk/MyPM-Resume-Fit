# DB engine, session factory, and FastAPI dependency for getting a DB session
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# SQLite needs check_same_thread=False to work with FastAPI's threaded requests
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# FastAPI dependency: yields a session and always closes it afterwards
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
