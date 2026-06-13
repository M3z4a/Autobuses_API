from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
# importa labd
from app.database import Base
# crea la tabla reservations (reservaciones) en la bd
class Reservation(Base):
    __tablename__ = "reservations"
    #parametros de la bd
    id = Column(Integer, primary_key=True, index=True)
    seat_number = Column(String, nullable=False)
    status = Column(String, default="pending")
    user_id = Column(Integer, ForeignKey("users.id"))
    route_id = Column(Integer, ForeignKey("routes.id"))
    # relaciona la tabla reservations (reservaciones) con la tabla users (usuarios)
    user = relationship("User", back_populates="reservations")
    route = relationship("Route", back_populates="reservations")