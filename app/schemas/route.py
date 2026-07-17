from pydantic import BaseModel
# esquema base de una ruta
class RouteBase(BaseModel):
    origin: str
    destination: str
    departure_time: str
    price: int
# esquema para crear una ruta
class RouteCreate(RouteBase):
    company_id: int
    units_id: int   
# esquema para respuesta
class RouteResponse(RouteBase):
    id: int
    company_id: int
    units_id: int  

    class Config:
        from_attributes = True