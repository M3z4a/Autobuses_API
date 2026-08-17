from pydantic import BaseModel
class PaymentCreate(BaseModel):
    reservation_id: int
class PaymentResponse(BaseModel):
    id: int
    paypal_order_id: str
    status: str
    amount: int
    reservation_id: int
    user_id: int
    route_id: int
    seat_number: str
    class Config:
        from_attributes = True