from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.orm import relationship
#importa la bd
from app.database import Base
# crea la tabla routes (rutas) en bd
class Route(Base):
    __tablename__ = "routes"
    # parametros de la bd
    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(String, nullable=False)
    reservations = relationship("Reservation", back_populates="route")
    # relaciona la tabla routes (rutas) con la tabla companies (compañias)
    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="routes")
    reservations = relationship("Reservation", back_populates="route")