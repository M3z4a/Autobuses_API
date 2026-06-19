from datetime import datetime, timedelta
from jose import jwt
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
#parametros del token
SECRET_KEY = "clave"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
security = HTTPBearer()
#crea el token de acceso
def create_access_token(data: dict):
    to_encode = data.copy()
    #tiempo de expiracion del token
    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    #codifica el token
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    #devuelve el token
    return encoded_jwt
#trae las credenciales del usario
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
    # si el token expiro, se mostrara error
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado"
        )
#autorizacion de administrador para algunas tareas
def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado. Se requiere rol de administrador."
        )
    return user
#autorizacion de empleado para algunas tareas
def require_employee(user=Depends(get_current_user)):
    if user.get("role") not in ["admin", "employee"]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado. Se requiere rol de empleado."
        )
    return user
#rol predeterminado, tiene la mayoria de cosas bloqueadas
def require_client(user=Depends(get_current_user)):
    if user.get("role") not in ["admin", "employee", "client"]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado."
        )
    return user