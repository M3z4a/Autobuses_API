from datetime import datetime, timedelta
from jose import jwt
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "tu_clave_super_secreta_cambiala_despues"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
security = HTTPBearer()


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado"
        )
    
def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado. Se requiere rol de administrador."
        )

    return user

def require_employee(user=Depends(get_current_user)):
    if user.get("role") not in ["admin", "employee"]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado. Se requiere rol de empleado."
        )

    return user

def require_client(user=Depends(get_current_user)):
    if user.get("role") not in ["admin", "employee", "client"]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado."
        )

    return user

