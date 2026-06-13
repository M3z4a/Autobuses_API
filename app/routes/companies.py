from fastapi import APIRouter, Depends, HTTPException
from app.auth import require_admin, require_client
from sqlalchemy.orm import Session
# importa la función get_db
from app.database.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyCreate
# importa l modelo Route y el esquema RouteResponse
from app.models.route import Route
from app.schemas.route import RouteResponse
from sqlalchemy.orm import Session
from fastapi import Depends
#importa la función get_db
from app.database import SessionLocal
from app.models.company import Company

router = APIRouter()
# ruta para crear una nueva compañía
@router.post("/companies")
def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    # crear una compañia requiere el rol de administrador
    current_user=Depends(require_admin)
):
    # chequea si la compañía ya existe
    new_company = Company(
        name=company.name,
        email=company.email,
        phone=company.phone
    )
    # agrega la nueva compañía a la base de datos
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    # muestra la compañia que se acaba de crar
    return new_company
# obtiene la sesion de la bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# obtiene todas las compañias de la tabla companies (compañias) de la bd
@router.get("/companies")
def get_companies(
    db: Session = Depends(get_db),
    # cualquiera puede consultar las empresas activas
    current_user=Depends(require_client)
):
    companies = db.query(Company).all()
    #muestra las compañias de la bd
    return companies
# obtiene todas las rutas de una compañia ya registrada
@router.get("/{company_id}/routes", response_model=list[RouteResponse])
def get_company_routes(
    company_id: int,
    db: Session = Depends(get_db),
    # cualquiera puede ver las rutas de una compañia
    current_user=Depends(require_client)
):
    company = db.query(Company).filter(Company.id == company_id).first()
    #si la compañia no existe muestra un error 404
    if not company:
        raise HTTPException(status_code=404, detail="Compañia inexistente")
    # si la compañia si existe muestra todas las rutas de la compañia seleccionada
    return db.query(Route).filter(Route.company_id == company_id).all()