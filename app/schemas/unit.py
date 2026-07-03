from pydantic import BaseModel
class UnitCreate(BaseModel):
    type: str
    model: str
    plates: str
class UnitResponse(BaseModel):
    id: int
    type: str
    model: str
    plates: str
    seat_count: int
    class Config:
        from_attributes = True