from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    model = Column(String, nullable=False)
    plates = Column(String, unique=True, nullable=False)
    seat_count = Column(Integer, nullable=False)
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False
    )
    company = relationship(
        "Company",
        back_populates="units"
    )
    routes = relationship(
        "Route",
        back_populates="unit",
        cascade="all, delete"
    )