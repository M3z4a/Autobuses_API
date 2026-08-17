from app.schemas.users import ( UserRegister, UserCreate, UserResponse, LoginRequest)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.auth import (create_access_token, require_system_admin, require_company_admin, get_current_user)
from app.database import SessionLocal
from app.models.user import User
from app.auth import hash_password

pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# sesión de bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#registro publico
@router.post("/register", response_model=UserResponse)
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="El usuario ya existe"
        )
    new_user = User(
        name=user.name,
        email=user.email,
        password=pwd_context.hash(user.password),
        role="traveler"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

#creacion de usuarios importantes
@router.post("/create", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    creator_role = current_user["role"]
    # validar permisos de creación
    allowed_roles = []
    if creator_role == "system_admin":
        allowed_roles = [
            "company_admin",
            "route_manager",
            "auditor",
            "traveler"
        ]
    elif creator_role == "company_admin":
        allowed_roles = [
            "route_manager",
            "auditor",
            "traveler"
        ]
    else:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear usuarios"
        )
    # impedir escalamiento de privilegios
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="No puedes crear este tipo de usuario"
        )
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="El usuario ya existe"
        )
    company_id = user.company_id
    # company_admin no puede elegir empresa
    if creator_role == "company_admin":
        company_id = current_user["company_id"]
    new_user = User(
        name=user.name,
        email=user.email,
        password=pwd_context.hash(user.password),
        role=user.role,
        company_id=company_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

#login
@router.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == login_data.email
    ).first()
    if not user or not pwd_context.verify(
        login_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "company_id": user.company_id
        }
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "company_id": user.company_id
    }

#obtiene usuarios

@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] == "system_admin":

        return db.query(User).all()
    if current_user["role"] == "company_admin":

        return db.query(User).filter(
            User.company_id ==
            current_user["company_id"]
        ).all()
    raise HTTPException(
        status_code=403,
        detail="No tienes permisos"
    )

#busca usuario por id
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    #system admin ve todo
    if current_user["role"] == "system_admin":
        return user
    #company admin solo su empresa
    if (
        current_user["role"] == "company_admin"
        and
        user.company_id == current_user["company_id"]
    ):
        return user
    raise HTTPException(
        status_code=403,
        detail="No puedes acceder a este usuario"
    )

@router.post("/users/bootstrap")
def create_first_admin(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_admin = db.query(User).filter(
        User.role == "system_admin"
    ).first()
    if existing_admin:
        raise HTTPException(
            status_code=403,
            detail="El system_admin ya existe"
        )
    hashed_password = hash_password(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role="system_admin"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user