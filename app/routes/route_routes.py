from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
# impor la sesion local y los modelos necesarios para rutas y compañias
from app.database import SessionLocal
from app.models.route import Route
from app.models.company import Company
from app.schemas.route import RouteCreate, RouteResponse
from app.auth import require_admin, require_client
# crea el routes de las rutas
router = APIRouter(
    prefix="/routes",
    tags=["Routes"]
)
# obtiene la sesion de la bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# crea una nueva ruta, y verifica si la compañia existe para dicha ruta
@router.post("/", response_model=RouteResponse)
def create_route(
    route: RouteCreate,
    db: Session = Depends(get_db),
    # ser administrador es necesario para la creacion de rutas
    current_user=Depends(require_admin)
):
    company = db.query(Company).filter(
        Company.id == route.company_id
    ).first()
    # si la compañia es inexistente, lanza error
    if not company:
        raise HTTPException(status_code=404, detail="Compañia inexistente")
    # crea una ruta con los datos proporcionados
    new_route = Route(
        origin=route.origin,
        destination=route.destination,
        departure_time=route.departure_time,
        company_id=route.company_id
    )
    #guarda la ruta en la bd
    db.add(new_route)
    db.commit()
    db.refresh(new_route)
    # devuelve la ruta creada
    return new_route

# obtiene las rutas disponibles
@router.get("/", response_model=list[RouteResponse])
def get_routes(
    db: Session = Depends(get_db),
    # todos pueden ver las rutas 
    current_user=Depends(require_client)
):
    return db.query(Route).all()
# obtiene solo una ruta, gracias a su id
@router.get("/{route_id}", response_model=RouteResponse)
def get_route(
    route_id: int,
    db: Session = Depends(get_db),
    # todos pueden consultar las rutas (los tres roles) por medio de su id
    current_user=Depends(require_client)
):
    route = db.query(Route).filter(Route.id == route_id).first()
    # si es inexistente, devuelve error
    if not route:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    # si si existe, devuelve la ruta
    return route
# elimina una ruta por su id
@router.delete("/{route_id}")
def delete_route(
    route_id: int,
    db: Session = Depends(get_db),
    # se requiere ser administrador para eliminar una ruta
    current_user=Depends(require_admin)
):
    route = db.query(Route).filter(Route.id == route_id).first()
    # si el id no existe, devolvera error
    if not route:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    # si si existe, borra la rutade la bd
    db.delete(route)
    db.commit()
    # devuelve el mensaje de ruta eliminada con exito
    return {"message": "Ruta eliminada exitosamente"}

# actualiza una ruta
@router.put("/{route_id}", response_model=RouteResponse)
def update_route(
    route_id: int,
    route_data: RouteCreate,
    db: Session = Depends(get_db),
    # se requiere ser admin para modificar los datos de una ruta
    current_user=Depends(require_admin)
):
      # busca la ruta por su id
    route = db.query(Route).filter(Route.id == route_id).first()
    # si no existe, devuelve error
    if not route:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    # verifica que la compañia de dicha ruta exista
    company = db.query(Company).filter(
        Company.id == route_data.company_id
    ).first()
    # si es inexistente, devuelve error
    if not company:
        raise HTTPException(status_code=404, detail="Compañia inexistente")
    # actualiza los datos de la ruta a actualizar y los reemplaza por los nuevos
    route.origin = route_data.origin
    route.destination = route_data.destination
    route.departure_time = route_data.departure_time
    route.company_id = route_data.company_id
    # guarda cambios en bd
    db.commit()
    db.refresh(route)
    # devuelve la ruta ya actualizada
    return route