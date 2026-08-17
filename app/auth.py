from datetime import datetime, timedelta
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

#nuevo (temporal)
# autorización de administrador del sistema
def require_system_admin(user=Depends(get_current_user)):
    if user.get("role") != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado."
        )
    return user
# autorización de administrador de empresa
def require_company_admin(user=Depends(get_current_user)):
    if user.get("role") not in ["system_admin", "company_admin"]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado."
        )
    return user
# autorización de encargado de ruta
def require_route_manager(user=Depends(get_current_user)):
    if user.get("role") not in [
        "system_admin",
        "company_admin",
        "route_manager"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado."
        )
    return user

# autorización para consultar rutas
def require_route_access(user=Depends(get_current_user)):
    if user.get("role") not in [
        "system_admin",
        "company_admin",
        "route_manager",
        "traveler",
        "auditor"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado."
        )
    return user

# autorización de auditor
def require_auditor(user=Depends(get_current_user)):
    if user.get("role") not in [
        "system_admin",
        "company_admin",
        "route_manager",
        "auditor"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado."
        )
    return user
# autorización de viajero
def require_traveler(user=Depends(get_current_user)):
    if user.get("role") != "traveler":
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado."
        )
    return user

# autorización para crear reservaciones
# permite compras normales y reservas presenciales
def require_reservation_create(user=Depends(get_current_user)):

    if user.get("role") not in [
        "system_admin",
        "company_admin",
        "route_manager",
        "traveler"
    ]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear reservaciones."
        )

    return user

# gestión de reservaciones
# usada para modificar/cancelar reservas administrativas
def require_reservation_manager(user=Depends(get_current_user)):

    if user.get("role") not in [
        "system_admin",
        "company_admin",
        "route_manager"
    ]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para gestionar reservaciones."
        )
    return user

def require_authenticated(user=Depends(get_current_user)):
    return user

#def require_only_traveler(user=Depends(get_current_user)):
    #if user.get("role") != "traveler":
       # raise HTTPException(
        #    status_code=403,
        #    detail="Solo disponible para viajeros."
      #  )
   # return user

from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str):
    return pwd_context.hash(password)

# autorización para consultar unidades
def require_unit_access(user=Depends(get_current_user)):
    if user.get("role") not in [
        "system_admin",
        "company_admin",
        "route_manager",
        "auditor",
        "traveler"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado."
        )
    return user

def require_reservation_view(user=Depends(get_current_user)):
    if user.get("role") not in [
        "traveler",
        "route_manager",
        "company_admin",
        "system_admin",
        "auditor"
    ]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para ver reservaciones"
        )
    return user