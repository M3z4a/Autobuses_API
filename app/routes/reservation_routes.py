from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.auth import get_current_user, require_employee, require_client

from app.models.reservation import Reservation
from app.models.user import User
from app.models.route import Route

from app.schemas.reservation import ReservationCreate, ReservationResponse
#router de reservaciones
router = APIRouter(
    prefix="/reservations",
    tags=["Reservations"]
)
#sesion de la bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#crear reservacion
@router.post("/", response_model=ReservationResponse)
def create_reservation(
    reservation: ReservationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_client)
):
    #si el usuario no existe (id) no se creara la reservacion
    user = db.query(User).filter(User.id == reservation.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario inexistente")
    #si la ruta no existe (id) no se creara la reservacion
    route = db.query(Route).filter(Route.id == reservation.route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Ruta inexistente")
    #chequea los asientos disponibles
    existing = db.query(Reservation).filter(
        Reservation.route_id == reservation.route_id,
        Reservation.seat_number == reservation.seat_number
    ).first()
    #si el asiento ya esta reservado mostrara un mensaje
    if existing:
        raise HTTPException(status_code=400, detail="Asiento ya reservado")
    #parametros para la creacion de una reservacion
    new_reservation = Reservation(
        seat_number=reservation.seat_number,
        user_id=reservation.user_id,
        route_id=reservation.route_id,
        status="pending"
    )
    #guarda en bd
    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)

    return new_reservation

#obtiene todas las reservaciones (rol  de empleado o admin)
@router.get("/", response_model=list[ReservationResponse])
def get_reservations(
    db: Session = Depends(get_db),
    current_user=Depends(require_employee)
):
    return db.query(Reservation).all()

#obtiene los detalles de la reservacion (empleado o admin)
@router.get("/details")
def get_reservations_details(
    db: Session = Depends(get_db),
    current_user=Depends(require_employee)
):
    reservations = db.query(Reservation).all()
    result = []
    for reservation in reservations:
        user = db.query(User).filter(User.id == reservation.user_id).first()
        route = db.query(Route).filter(Route.id == reservation.route_id).first()
        result.append({
            "id": reservation.id,
            "seat_number": reservation.seat_number,
            "status": reservation.status,
            "user_name": user.name if user else "Desconocido",
            "route_name": f"{route.origin} → {route.destination}" if route else "Desconocida"
        })
    return result

#confirma la reservacion(lo quite y dejo de funcionar mi codigo, vere como lo quito y en que interfiere para quitarlo)
#ya no es necesario, al pagar se confirma automaticamente
@router.put("/{reservation_id}")
def update_reservation(
    reservation_id: int,
    reservation: ReservationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_employee)
):
    r = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="No existe")
    r.seat_number = reservation.seat_number
    r.user_id = reservation.user_id
    r.route_id = reservation.route_id
    db.commit()
    db.refresh(r)

    return r

#borrar reservacion (rol de empleado o admin)
@router.delete("/{reservation_id}")
def delete_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_client)
):
    #obtiene la reservacion de la bd
    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()
    #si no existe o ya fue borrada mostrara un mensaje de error
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")
    #borra la reservacion de la bd
    db.delete(reservation)
    db.commit()
    #si existia y se elimino con exito se mostrara un mensaje de confirmacion
    return {"message": "Reservación eliminada"}

#muestra los asientos disponibles
@router.get("/route/{route_id}/available-seats")
def get_available_seats(
    route_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_client)
):
    #el formato es A(numero) del 1 al 30
    total_seats = [f"A{i}" for i in range(1, 30)]
    #muestra los asientos por ruta
    reservations = db.query(Reservation).filter(
        Reservation.route_id == route_id
    ).all()
    #oculta los ocupados
    taken_seats = [r.seat_number for r in reservations]
    #muestra los disponibles
    available = [s for s in total_seats if s not in taken_seats]
    #devuelve losa sientos disponibles de la ruta
    return {
        "route_id": route_id,
        "available_seats": available
    }

#ruta del dashboars
#tambien ya es inecesario
@router.get("/dashboard/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_employee)
):
    return {
        "total_reservations": db.query(Reservation).count(),
        "pending": db.query(Reservation).filter(Reservation.status == "pending").count(),
        "confirmed": db.query(Reservation).filter(Reservation.status == "confirmed").count()
    }

#muestra las reservaciones de un usuario segun su id
@router.get("/me")
def get_my_reservations(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Reservation).filter(
        Reservation.user_id == int(user["sub"])
    ).all()