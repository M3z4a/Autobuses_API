from pydantic import BaseModel

# Registro público (solo viajeros)
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
# Creación interna de usuarios
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    company_id: int | None = None
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    company_id: int | None = None

    class Config:
        from_attributes = True
class LoginRequest(BaseModel):
    email: str
    password: str