from pydantic import BaseModel

# esquema de reserva
class ReservationBase(BaseModel):
    seat_number: str
    user_id: int
    route_id: int
# esquema para crear una reservacion
class ReservationCreate(ReservationBase):
    pass
# esquema para actualizar una reservacion
class ReservationResponse(ReservationBase):
    id: int
    status: str

    class Config:
        from_attributes = True