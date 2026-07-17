from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
# modelo de la tabla rutas
class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(String, nullable=False)
    price = Column(Integer, nullable=False, default=0)
    # relación con empresa
    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="routes")
    #relacion con las unidades
    units_id = Column(Integer, ForeignKey("units.id"))
    unit = relationship("Unit")
    # relación con reservaciones
    reservations = relationship("Reservation", back_populates="route")

    