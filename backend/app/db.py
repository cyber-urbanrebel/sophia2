from sqlmodel import SQLModel, Session, create_engine
from app.config import settings

database_url = settings.database_url.strip()

if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
elif database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
else:
    database_url = f"sqlite:///{settings.database_path}"

connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)


def init_db() -> None:
    from app import models  # noqa: F401 — register tables on metadata
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
