from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.unit import Unit
from app.schemas.unit import UnitCreate, UnitResponse
from app.auth import require_employee, require_client

router = APIRouter(
    prefix="/units",
    tags=["Units"]
)

#conexion a la bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#router para crear una unidad
@router.post("/", response_model=UnitResponse)
def create_unit(
    unit: UnitCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_employee)
):
    #verifica el tipo de unidad y asigna el numero de asientos correspondiente
    if unit.type.lower() == "bus":
        seats = 40
    elif unit.type.lower() == "combi":
        seats = 12
    else:
        raise HTTPException(
            status_code=400,
            detail="Tipo inválido (solo bus o combi)"
        )
    # parametros para la creacion de la unidad
    new_unit = Unit(
        type=unit.type,
        model=unit.model,
        plates=unit.plates,
        seat_count=seats
    )
    #guarda en la bd
    db.add(new_unit)
    db.commit()
    db.refresh(new_unit)
    # retorna la unidad creada
    return new_unit

#obtiene todas las unidades
@router.get("/", response_model=list[UnitResponse])
def get_units(
    db: Session = Depends(get_db),
    current_user=Depends(require_employee)
):
    return db.query(Unit).all()

#obtiene 1 unidad por id
@router.get("/{unit_id}", response_model=UnitResponse)
def get_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_client)
):
    # busca la unidad en la bd por id
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    # si no la encuentra manda un error
    if not unit:
        raise HTTPException(
            status_code=404,
            detail="Unidad no encontrada"
        )
    # si la encuentra la retorna
    return unit

#actualiza la info de una unidad
@router.put("/{unit_id}", response_model=UnitResponse)
def update_unit(
    unit_id: int,
    unit_data: UnitCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_employee)
):
    # busca la unidad en la bd por id
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    # si no la encuentra manda un error
    if not unit:
        raise HTTPException(
            status_code=404,
            detail="Unidad no encontrada"
        )
    # verifica el tipo de unidad y asigna el numero de asientos correspondiente
    if unit_data.type.lower() == "bus":
        seats = 40
    elif unit_data.type.lower() == "combi":
        seats = 12
    else:
        raise HTTPException(
            status_code=400,
            detail="Tipo inválido (solo bus o combi)"
        )
    # actualiza los datos de la unidad
    unit.type = unit_data.type
    unit.model = unit_data.model
    unit.plates = unit_data.plates
    unit.seat_count = seats
    # guarda los cambios en la bd
    db.commit()
    db.refresh(unit)
    # retorna la unidad actualizada
    return unit

#borra una unidad por su id
@router.delete("/{unit_id}")
def delete_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_employee)
):
    # busca la unidad en la bd por id
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    # si no la encuentra manda un error
    if not unit:
        raise HTTPException(
            status_code=404,
            detail="Unidad no encontrada"
        )
    # borra la unidad de la bd
    db.delete(unit)
    db.commit()
    # retorna un mensaje de confirmacion
    return {
        "message": "Unidad eliminada"
    }