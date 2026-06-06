from app.schemas.users import UserCreate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
# importa el modelo usuario y la sesion de la bd
from app.database import SessionLocal
from app.models.user import User
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

@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email ya registrado"
        )

    new_user = User(
        name=user.name,
        email=user.email
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
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