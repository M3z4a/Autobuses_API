from pydantic import BaseModel
from datetime import datetime

# clase para crear o ejecutar un pago
class PaymentCreate(BaseModel):
    reservation_id: int
    amount: float
     # efectivo, tarjeta, transferencia
    payment_method: str 

# clase para verificar el pago
class PaymentResponse(BaseModel):
    id: int
    reservation_id: int
    amount: float
    payment_method: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True