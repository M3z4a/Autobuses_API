from pydantic import BaseModel
class UnitCreate(BaseModel):
    type: str
    model: str
    plates: str
    #company_id: int
class UnitResponse(BaseModel):
    id: int
    type: str
    model: str
    plates: str
    seat_count: int
    company_id: int
    class Config:
        from_attributes = True