from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
# conecta con la bas e de datos de SQLAlchemy
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/transport_db"
# crea el motor de la bd
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