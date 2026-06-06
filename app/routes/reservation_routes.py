from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
# importa todos lo modelos necesarios para reservar
from app.database import SessionLocal
from app.models.reservation import Reservation
from app.models.user import User
from app.models.route import Route
from app.schemas.reservation import ReservationCreate, ReservationResponse
# El router de reservas
router = APIRouter(
    prefix="/reservations",
    tags=["Reservations"]
)
# manda a llamar la sesion de la bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# endponit de reserva
@router.post("/", response_model=ReservationResponse)
def create_reservation(reservation: ReservationCreate, db: Session = Depends(get_db)):
    # verifica que el usuario existe
    user = db.query(User).filter(User.id == reservation.user_id).first()
    if not user:
        #si no existe devuelve error
        raise HTTPException(status_code=404, detail="Usuario inexistente")
    # verifica si la ruta existe
    route = db.query(Route).filter(Route.id == reservation.route_id).first()
    if not route:
        #si no existe devuelve error
        raise HTTPException(status_code=404, detail="Ruta inexistente")
    # verifica si el asiento ya esta reservado en esa corrida para evitar duplicidades
    existing = db.query(Reservation).filter(
        Reservation.route_id == reservation.route_id,
        Reservation.seat_number == reservation.seat_number
    ).first()
    # si ya esta reservado, devuelve error
    if existing:
        raise HTTPException(status_code=400, detail="Asiento ya reservado")
    # si todo es correcto crea la reserva del asiento, quedando pendiente
    new_reservation = Reservation(
        seat_number=reservation.seat_number,
        user_id=reservation.user_id,
        route_id=reservation.route_id,
        status="pendiente"
    )
    # respalda la reservacion en la bd
    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)
    # devuelve la reservacion creada
    return new_reservation

# endpoint para ver las reservas
@router.get("/", response_model=list[ReservationResponse])
def get_reservations(db: Session = Depends(get_db)):
    return db.query(Reservation).all()

@router.get("/details")
def get_reservations_details(db: Session = Depends(get_db)):

    reservations = db.query(Reservation).all()

    result = []

    for reservation in reservations:

        user = db.query(User).filter(
            User.id == reservation.user_id
        ).first()

        route = db.query(Route).filter(
            Route.id == reservation.route_id
        ).first()

        result.append({
            "id": reservation.id,
            "seat_number": reservation.seat_number,
            "status": reservation.status,
            "user_name": user.name if user else "Desconocido",
            "route_name": f"{route.origin} → {route.destination}" if route else "Desconocida"
        })

    return result
# endpoint para confirmar la reservacion
@router.put("/{reservation_id}/confirm")
def confirm_reservation(reservation_id: int, db: Session = Depends(get_db)):
    # busca la reservacion por su id
    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()
    # si no existe, devuelve error
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservacion inexistente")
    # si la reservacion existe, cambia a confirmado (pendiente a confirmado)
    reservation.status = "confirmed"
    # guarda los cambios en la bd
    db.commit()
    db.refresh(reservation)
    # muestra un mensaje de confirmacion junto al id de la reservacion
    return {"message": "Reservacion confirmada", "reservation_id": reservation.id}

# endponit para ver los asientod disponibles en una ruta
@router.get("/route/{route_id}/available-seats")
def get_available_seats(route_id: int, db: Session = Depends(get_db)):
    # muestra  el total de asientos disponibles
    total_seats = [f"A{i}" for i in range(1, 30)]
    # busca las reservaciones de esa ruta
    reservations = db.query(Reservation).filter(
        Reservation.route_id == route_id
    ).all()
    # obtiene los asientos ya apartados
    taken_seats = [r.seat_number for r in reservations]
    # devuelve los asientos disponibles, sin mostrar los ocupados
    available = [s for s in total_seats if s not in taken_seats]
    # devuelve la ruta y asientos disponibles
    return {
        "route_id": route_id,
        "available_seats": available
    }

# endpoint para mostrar un dashboard con las reservaciones totales, pendientes y ya confirmadas
@router.get("/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    # muestra todas las reservaciones hechas
    total_reservations = db.query(Reservation).count()
    # muestra las reservaciones que estan pendietnes
    pending = db.query(Reservation).filter(
        Reservation.status == "pending"
    ).count()
    # muestra las reservaciones confirmadas
    confirmed = db.query(Reservation).filter(
        Reservation.status == "confirmed"
    ).count()
    # devuelve un resumen completo de todas las reservaciones, tanto confirmadas como pendientes
    return {
        "total_reservations": total_reservations,
        "pending": pending,
        "confirmed": confirmed
    }