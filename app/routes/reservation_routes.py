from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.auth import (get_current_user, require_traveler, require_route_manager, require_reservation_create, require_reservation_view)
from app.models.reservation import Reservation
from app.models.user import User
from app.models.route import Route
from app.schemas.reservation import ReservationCreate, ReservationResponse

router = APIRouter(
    prefix="/reservations",
    tags=["Reservations"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Crear reservación
# Puede hacerlo traveler (compra online) o route_manager (venta presencial)
@router.post("/", response_model=ReservationResponse)
def create_reservation(
    reservation: ReservationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_reservation_create)
):
    role = current_user["role"]
    # Si es viajero usa su propio usuario
    if role == "traveler":
        user_id = int(current_user["sub"])
    # Si es personal de empresa puede reservar para otra persona
    else:
        user_id = reservation.user_id
        user = db.query(User).filter(
            User.id == user_id
        ).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Usuario inexistente"
            )
    route = db.query(Route).filter(
        Route.id == reservation.route_id
    ).first()
    if not route:
        raise HTTPException(
            status_code=404,
            detail="Ruta inexistente"
        )
    existing = db.query(Reservation).filter(
        Reservation.route_id == reservation.route_id,
        Reservation.seat_number == reservation.seat_number
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Asiento ya reservado"
        )
    new_reservation = Reservation(
        passenger_name=reservation.passenger_name,
        seat_number=reservation.seat_number,
        user_id=user_id,
        route_id=reservation.route_id,
        status="pending"
    )
    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)
    return new_reservation

# Ver reservaciones de la empresa
# route_manager, company_admin y system_admin
@router.get("/", response_model=list[ReservationResponse])
def get_reservations(
    db: Session = Depends(get_db),
    current_user=Depends(require_reservation_view)
):
    if current_user["role"] == "system_admin":
        return db.query(Reservation).all()
    if current_user["role"] == "auditor":
        return db.query(Reservation).all()
    return (
        db.query(Reservation)
        .join(Route)
        .filter(
            Route.company_id == current_user["company_id"]
        )
        .all()
    )

# Detalles para panel administrativo
@router.get("/details")
def get_reservations_details(
    db: Session = Depends(get_db),
    current_user=Depends(require_route_manager)
):
    if current_user["role"] == "system_admin":
        reservations = db.query(Reservation).all()
    else:
        reservations = (
            db.query(Reservation)
            .join(Route)
            .filter(
                Route.company_id == current_user["company_id"]
            )
            .all()
        )
    result = []
    for reservation in reservations:
        route = db.query(Route).filter(
            Route.id == reservation.route_id
        ).first()
        result.append({
            "id": reservation.id,
            "seat_number": reservation.seat_number,
            "status": reservation.status,
            "passenger_name": reservation.passenger_name,
            "route_name": (
                f"{route.origin} → {route.destination}"
                if route else "Desconocida"
            )
        })
    return result

#estadísticas para el dashboard
@router.get("/dashboard")
def get_reservation_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    role = current_user["role"]
    #system admin y auditor pueden ver todas las reservaciones
    if role in ["system_admin", "auditor"]:
        total_reservations = db.query(Reservation).count()
        top_route = (
            db.query(
                Route.origin,
                Route.destination,
                db.func.count(Reservation.id).label("reservation_count")
            )
            .join(Reservation, Reservation.route_id == Route.id)
            .group_by(Route.id, Route.origin, Route.destination)
            .order_by(func.count(Reservation.id).desc())
            .first()
        )
        return {
            "total_reservations": total_reservations,
            "top_route": (
                {
                    "name": f"{top_route.origin} → {top_route.destination}",
                    "reservations": top_route.reservation_count
                }
                if top_route else None
            )
        }
    #company admin y route manager
    #solo ven las reservaciones de su empresa
    if role in ["company_admin", "route_manager"]:
        total_reservations = (
            db.query(Reservation)
            .join(Route)
            .filter(
                Route.company_id == current_user["company_id"]
            )
            .count()
        )
        return {
            "total_reservations": total_reservations,
            "top_route": None
        }
    #cliente
    if role == "traveler":
        total_reservations = (
            db.query(Reservation)
            .filter(
                Reservation.user_id == int(current_user["sub"])
            )
            .count()
        )
        return {
            "total_reservations": total_reservations,
            "top_route": None
        }
    raise HTTPException(
        status_code=403,
        detail="Sin permisos"
    )

# Actualizar reservación
# Solo personal autorizado
@router.put("/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: int,
    reservation: ReservationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_route_manager)
):
    r = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()
    if not r:
        raise HTTPException(
            status_code=404,
            detail="Reservación no encontrada"
        )
    r.passenger_name = reservation.passenger_name
    r.seat_number = reservation.seat_number
    if reservation.user_id:
        r.user_id = reservation.user_id
    if reservation.route_id:
        r.route_id = reservation.route_id
    db.commit()
    db.refresh(r)
    return r

# Cancelar reservación
# Traveler solo puede cancelar las suyas
# Personal puede cancelar reservaciones de su empresa
@router.delete("/{reservation_id}")
def delete_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()
    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservación no encontrada"
        )
    role = current_user["role"]
    if role == "traveler":
        if reservation.user_id != int(current_user["sub"]):
            raise HTTPException(
                status_code=403,
                detail="No puedes cancelar esta reservación"
            )
    elif role in [
        "route_manager",
        "company_admin"
    ]:
        route = db.query(Route).filter(
            Route.id == reservation.route_id
        ).first()
        if (
            not route or
            route.company_id != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=403,
                detail="Reservación fuera de tu empresa"
            )
    elif role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Sin permisos"
        )
    db.delete(reservation)
    db.commit()
    return {
        "message": "Reservación eliminada"
    }

# Asientos ocupados
@router.get("/route/{route_id}/available-seats")
def get_available_seats(
    route_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_reservation_view)
):
    reservations = db.query(Reservation).filter(
        Reservation.route_id == route_id
    ).all()
    return {
        "route_id": route_id,
        "taken_seats": [
            r.seat_number
            for r in reservations
        ]
    }

# Estadísticas de reservaciones para el dashboard
@router.get("/dashboard-stats")
def get_reservation_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    role = current_user["role"]
    # Traveler: solamente sus reservaciones
    if role == "traveler":
        total = db.query(Reservation).filter(
            Reservation.user_id == int(current_user["sub"])
        ).count()

        return {
            "total_reservations": total
        }
    # System admin y auditor: todas
    if role in ["system_admin", "auditor"]:
        reservations = db.query(Reservation).all()
    # Admin de empresa y gestor de rutas:
    # solamente reservaciones de su empresa
    elif role in ["company_admin", "route_manager"]:
        reservations = (
            db.query(Reservation)
            .join(Route)
            .filter(
                Route.company_id == current_user["company_id"]
            )
            .all()
        )
    else:
        raise HTTPException(
            status_code=403,
            detail="Sin permisos"
        )
    total = len(reservations)
    result = {
        "total_reservations": total
    }
    # La ruta más reservada SOLO la ven system_admin y auditor
    if role in ["system_admin", "auditor"]:
        route_counts = {}
        for reservation in reservations:
            route_counts[reservation.route_id] = (
                route_counts.get(reservation.route_id, 0) + 1
            )
        if route_counts:
            top_route_id = max(
                route_counts,
                key=route_counts.get
            )
            route = db.query(Route).filter(
                Route.id == top_route_id
            ).first()
            if route:
                result["top_route"] = {
                    "id": route.id,
                    "route_name": f"{route.origin} → {route.destination}",
                    "reservations": route_counts[top_route_id]
                }
            else:
                result["top_route"] = None
        else:
            result["top_route"] = None

    return result

# Reservaciones del usuario actual
@router.get("/me")
def get_my_reservations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Reservation).filter(
        Reservation.user_id == int(current_user["sub"])
    ).all()