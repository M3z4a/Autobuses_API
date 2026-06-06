from pydantic import BaseModel

# Esquemas para la creacion de las compañias
class CompanyCreate(BaseModel):

    name: str

    email: str

    phone: str

# esquema para la respuesta de compañias
class CompanyResponse(CompanyCreate):

    id: int

    class Config:
        from_attributes = True