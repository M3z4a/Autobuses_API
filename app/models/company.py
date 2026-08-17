from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
# importa la bd
from app.database import Base
# crea el modelo de la tabla companies (compañias) en bd
class Company(Base):
    __tablename__ = "companies"
    # parametros de la bd
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    # relaciona la tabla companies con la tabla routes
    routes = relationship(
        "Route",
        back_populates="company",
        cascade="all, delete"
    )
    users = relationship(
    "User",
    back_populates="company"
    )
    units = relationship(
    "Unit",
    back_populates="company",
    cascade="all, delete"
    )
    