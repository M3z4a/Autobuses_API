from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True )
    seat_number = Column(String, nullable=False)
    passenger_name = Column(String, nullable=False)
    status = Column(String, default="pending")
    user_id = Column(Integer, ForeignKey("users.id"))
    route_id = Column(Integer, ForeignKey("routes.id"))
    user = relationship("User", back_populates="reservations")
    route = relationship("Route", back_populates="reservations")
    payment = relationship("Payment", back_populates="reservation", uselist=False, cascade="all, delete")