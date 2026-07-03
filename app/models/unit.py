from sqlalchemy import Column, Integer, String

from app.database import Base


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)

    type = Column(String, nullable=False)

    model = Column(String, nullable=False)

    plates = Column(String, unique=True, nullable=False)

    seat_count = Column(Integer, nullable=False)