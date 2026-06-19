from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth import require_admin, require_client
from app.database.database import get_db
from app.models.company import Company
from app.models.route import Route
from app.schemas.company import CompanyCreate
from app.schemas.route import RouteResponse
#router de compañias (empresas)
router = APIRouter()
#crea la empresa (requeire de administrador)
@router.post("/companies")
def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    #parametros para la creacion de compañias
    new_company = Company(
        name=company.name,
        email=company.email,
        phone=company.phone
    )
    #se guarda en la bd
    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return new_company

#obtiene todas las empresas registradas (cualquiera puede verlo)
@router.get("/companies")
def get_companies(
    db: Session = Depends(get_db),
    current_user=Depends(require_client)
):
    return db.query(Company).all()

#edita los datos de la empresa (requiere de administrador)
@router.put("/companies/{company_id}")
def update_company(
    company_id: int,
    company: CompanyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    #pide el id como primer filtro
    company_db = db.query(Company).filter(
        Company.id == company_id
    ).first()
    #si el id no esta asociado a ninguna empresa, lanzara un mensaje de error
    if not company_db:
        raise HTTPException(
            status_code=404,
            detail="Compañía inexistente"
        )
    #parametros de la  bd a cambiar
    company_db.name = company.name
    company_db.email = company.email
    company_db.phone = company.phone
    #se actualiza y se guarda en bd
    db.commit()
    db.refresh(company_db)

    return company_db

#eliminar una empresa (requiere administrador)
@router.delete("/companies/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    #como primer filtro requiere el id de la empresa
    company = db.query(Company).filter(
        Company.id == company_id
    ).first()
    #si el id no esta asociado a ninguna empresa, lanzara mensaje de error
    if not company:
        raise HTTPException(
            status_code=404,
            detail="Compañía inexistente"
        )
    #si el id esta asociado, se borrara la empresa
    db.delete(company)
    db.commit()
    #mensaje que se da al eliminar con exito una empresa
    return {
        "message": "Compañía eliminada correctamente"
    }

#obtener las rutas de una empresa
@router.get(
    "/companies/{company_id}/routes",
    response_model=list[RouteResponse]
)
#cualquiera puede verlo
def get_company_routes(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_client)
):
    #se busca por medio del id de la empresa
    company = db.query(Company).filter(
        Company.id == company_id
    ).first()
    #si el id no esta asociado a una empresa, lanzara un mensaje de error
    if not company: 
        raise HTTPException(
            status_code=404,
            detail="Compañía inexistente"
        )
    #si el id es correcto mostrara las rutas de la empresa seleccionada
    return db.query(Route).filter(
        Route.company_id == company_id
    ).all()