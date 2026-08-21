import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:TU_PASSWORD@localhost:5432/transport_db"
)
engine = create_engine(DATABASE_URL)
# crea la sesion local de la bd
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
# crea la base de los modelos de la bd
Base = declarative_base()
# obtiene la sesion de la bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()