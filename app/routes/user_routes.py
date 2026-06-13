from app.schemas.users import UserCreate, UserResponse
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.auth import create_access_token
from app.schemas.users import LoginRequest

from app.database import SessionLocal
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# crea el routes para los usuarios
router = APIRouter(
    prefix="/users",
    tags=["Users"]
)
# obtiene la sesion de la bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # devuelve el rol dle usuario creado
    print("ROL RECIBIDO:", user.role)

    hashed_password = pwd_context.hash(user.password)
    # parametros necesarios para la creacion de usuarios
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        # nuevo: roles para la division de actividades (admin, employee, client)
        role=user.role
    )
    # guarda los datos en la bd
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):

    # Buscar usuario por correo
    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

    # Verificar que exista y que la contraseña sea correcta
    if not user or not pwd_context.verify(
        login_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )

    # Crear token JWT
    access_token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }
# ontiene los usuarios ya registrados
@router.get("/")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()
# devuelve un usuario por su id
@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    # si el id (usuario) es inexistente, devolvera error
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    # si los datos (id) son correctos, ddevolvera el usuario
    return user