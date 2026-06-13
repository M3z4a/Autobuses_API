#importa funciones necesarias
from datetime import datetime, timedelta
from jose import jwt
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
security = HTTPBearer()
#crea un token de acceso
def create_access_token(data: dict):
    to_encode = data.copy()
    # busca el tiempo de expiracion del token
    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    # asegura la identidad del usuario
    if "sub" not in to_encode and "id" in to_encode:
        to_encode["sub"] = str(to_encode["id"])

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt

# verifica el token del usuario
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
    
# verifica que el usuario sea administrador para ciertas funciones
def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado. Se requiere rol de administrador."
        )

    return user

# verifica que el usuario sea empleado para ciertas funciones
def require_employee(user=Depends(get_current_user)):
    if user.get("role") not in ["admin", "employee"]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado. Se requiere rol de empleado."
        )

    return user

# verifica que el usuario sea cliente para ciertas funciones
def require_client(user=Depends(get_current_user)):
    if user.get("role") not in ["admin", "employee", "client"]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado."
        )

    return user