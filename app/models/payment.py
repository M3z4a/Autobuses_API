from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from datetime import datetime
# importa la bd
from app.database import Base
# crea la tabla payments(pagos) en la bd
class Payment(Base):
    __tablename__ = "payments"
    #parametros de la bd
    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)  # efectivo, tarjeta, transferencia
    status = Column(String, default="pending")  # pending, paid, rejected
    created_at = Column(DateTime, default=datetime.utcnow)