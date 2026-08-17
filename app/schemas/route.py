from pydantic import BaseModel
class RouteBase(BaseModel):
    origin: str
    destination: str
    departure_time: str
    price: int
class RouteCreate(RouteBase):
    units_id: int
class CompanyName(BaseModel):
    name: str
    class Config:
        from_attributes = True

class RouteResponse(RouteBase):
    id: int
    company_id: int
    units_id: int
    company: CompanyName
    class Config:
        from_attributes = True