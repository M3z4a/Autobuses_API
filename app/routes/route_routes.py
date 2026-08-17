from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.route import Route
from app.models.company import Company
from app.models.unit import Unit 
from app.schemas.route import RouteCreate, RouteResponse
from app.auth import require_company_admin, require_route_access, require_route_manager

router = APIRouter(
    prefix="/routes",
    tags=["Routes"]
)

# conexion a la bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#crea una ruta
@router.post("/", response_model=RouteResponse)
def create_route(
    route: RouteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_route_manager)
):
    #valida la unidad asociada a la ruta, si no existe lanza un error 404
    unit = db.query(Unit).filter(
    Unit.id == route.units_id,
    Unit.company_id == current_user["company_id"]
    ).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unidad inexistente")
    # crea la ruta en la bd
    new_route = Route(
        origin=route.origin,
        destination=route.destination,
        departure_time=route.departure_time,
        price=route.price,
        company_id=current_user["company_id"],
        units_id=route.units_id 
    )
    # agrega la ruta a la bd y confirma la transaccion
    db.add(new_route)
    db.commit()
    db.refresh(new_route)
    # retorna la ruta creada
    return new_route

#deja ver todas las rutas
@router.get("/", response_model=list[RouteResponse])
def get_routes(
    db: Session = Depends(get_db),
    current_user=Depends(require_route_access)
):
    # system_admin, traveler y auditor pueden ver todas las rutas
    if current_user["role"] in [
        "system_admin",
        "traveler",
        "auditor"
    ]:
        return db.query(Route).all()

    # company_admin y route_manager solo ven las rutas de su empresa
    return db.query(Route).filter(
        Route.company_id == current_user["company_id"]
    ).all()

@router.get("/{route_id}", response_model=RouteResponse)
def get_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_route_access)
):
    # system_admin, traveler y auditor pueden ver cualquier ruta
    if current_user["role"] in [
        "system_admin",
        "traveler",
        "auditor"
    ]:
        route = db.query(Route).filter(
            Route.id == route_id
        ).first()
    else:
        # company_admin y route_manager solo ven rutas de su empresa
        route = db.query(Route).filter(
            Route.id == route_id,
            Route.company_id == current_user["company_id"]
        ).first()
    if not route:
        raise HTTPException(
            status_code=404,
            detail="Ruta no encontrada"
        )
    return route

#borra una ruta por su id
@router.delete("/{route_id}")
def delete_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_company_admin)
):
    # busca la ruta por su id en la bd
    route = db.query(Route).filter(
    Route.id == route_id,
    Route.company_id == current_user["company_id"]
    ).first()
    # si no existe la ruta, lanza un error 404
    if not route:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    # borra la
    db.delete(route)
    db.commit()
    # retorna un mensaje de confirmacion
    return {"message": "Ruta eliminada exitosamente"}

#actualiza una ruta por su id
@router.put("/{route_id}", response_model=RouteResponse)
def update_route(
    route_id: int,
    route_data: RouteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_route_manager)
):
    # busca la ruta por su id en la bd
    route = db.query(Route).filter(
    Route.id == route_id,
    Route.company_id == current_user["company_id"]
    ).first()
    # si no existe la ruta, lanza un error 404
    if not route:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    # valida la unidad asociada a la ruta, si no existe lanza un error 404
    unit = db.query(Unit).filter(
    Unit.id == route_data.units_id,
    Unit.company_id == current_user["company_id"]
    ).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unidad inexistente")
    # actualiza los datos de la ruta
    route.origin = route_data.origin
    route.destination = route_data.destination
    route.departure_time = route_data.departure_time
    route.price = route_data.price
    route.company_id = current_user["company_id"]
    route.units_id = route_data.units_id  
    # guarda los cambios en la bd
    db.commit()
    db.refresh(route)
    # retorna la ruta actualizada
    return route