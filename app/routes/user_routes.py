from app.schemas.users import UserCreate, UserResponse, LoginRequest
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.auth import create_access_token, require_admin
from app.database import SessionLocal
from app.models.user import User
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(
    prefix="/users",
    tags=["Users"]
)
#sesion de la bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
#registrar usuario
@router.post("/register", response_model=UserResponse)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    # validar email duplicado
    existing_user = db.query(User).filter(User.email == user.email).first()
    #si el email ya esta en uso, mandara error
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="El usuario ya existe"
        )
    hashed_password = pwd_context.hash(user.password)
    #parametros para crear admin
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role="client"   
    )
    #guarda en bd
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

#login
@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    #verifica los campos si son correctos
    user = db.query(User).filter(
        User.email == login_data.email
    ).first()
    #si no lo son manda error
    if not user or not pwd_context.verify(login_data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )
    #crea el token para la autoriazacion de roles
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    )
    #devuelve el token
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

#muestra los usuario (solo vista de admin)
@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    #solicita los usuarios a la bd
    return db.query(User).all()

#busca un usario por id (solo admin)
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    #pide y filtra un usuario por su id
    user = db.query(User).filter(User.id == user_id).first()
    #si no existe un id asociado a un usuario, mostrara error
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    return user