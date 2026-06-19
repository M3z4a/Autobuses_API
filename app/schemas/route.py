from pydantic import BaseModel
# esquema de una ruta
class RouteBase(BaseModel):
    origin: str
    destination: str
    departure_time: str
# esquema para crear una ruta
class RouteCreate(RouteBase):
    company_id: int
# esquema para actualizar una ruta
class RouteResponse(RouteBase):
    id: int
    company_id: int

    class Config:
        from_attributes = True