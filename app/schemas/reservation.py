from pydantic import BaseModel
from typing import Optional
# esquema de reserva
class ReservationBase(BaseModel):
    passenger_name: str
    seat_number: str
    user_id: int
    route_id: Optional[int] = None
# esquema para crear una reservacion
class ReservationCreate(ReservationBase):
    pass
# esquema para actualizar una reservacion
class ReservationResponse(ReservationBase):
    id: int
    status: str

    class Config:
        from_attributes = True