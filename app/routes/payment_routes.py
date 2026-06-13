from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
# importa lo necesario para realizar los pagos
from app.database import SessionLocal
from app.models.payment import Payment
from app.models.reservation import Reservation
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.auth import require_client, require_employee
# app
router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)
# base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# el cliente crea el pago (router de pago)
@router.post("/", response_model=PaymentResponse)
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    # cualquiera puede crear un pago
    current_user=Depends(require_client)
):
    #verifica que el pago esta asociado a una reservacion
    reservation = db.query(Reservation).filter(
        Reservation.id == payment.reservation_id
    ).first()
    # si no esta asociado a ninguna devuelve error y el mensaje "reservacion no encontrada"
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")
    # evita pagos duplicados
    existing = db.query(Payment).filter(
        Payment.reservation_id == payment.reservation_id
    ).first()
    # si ya hay un pago, devuelve error y el mensaje "esta reservacion ya tiene pago"
    if existing:
        raise HTTPException(status_code=400, detail="Esta reservación ya tiene pago")
    # parametros necesarios para realizar un pago
    new_payment = Payment(
        reservation_id=payment.reservation_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        status="pending"
    )
    # guarda los datos en la bd
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    # devuelve el pago
    return new_payment

# deja ver todos los pagos que se han hecho
@router.get("/", response_model=list[PaymentResponse])
def get_payments(
    db: Session = Depends(get_db),
    # solo empleado y admin pueden ver los pagos
    current_user=Depends(require_employee)
):
    return db.query(Payment).all()

# confirma el pago
@router.put("/{payment_id}/confirm")
def confirm_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    # solo admin y empleado puede confirmar los pagos
    current_user=Depends(require_employee)
):
    #busca el pago por su id
    payment = db.query(Payment).filter(
        Payment.id == payment_id
    ).first()
    # si no esta asociado a ninguno, devuelve error y el mensaje "pago no encontrado"
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    #obtiene la reservacion asociada al pago
    reservation = db.query(Reservation).filter(
        Reservation.id == payment.reservation_id
    ).first()
    # si no hay ninguna reservacion asociada devuelve error y el mensaje "reservacion no encontrada"
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")
    #actualiza el estado del pago
    payment.status = "paid"
    #actualiza el estado de la reservacion
    reservation.status = "confirmed"
    #guarda en la base de datos
    db.commit()
    db.refresh(payment)
    db.refresh(reservation)
    # devuelve el mensaje de confirmacion y los datos de id de pago e id de reservacion
    return {
        "message": "Pago confirmado y reservación activada",
        "payment_id": payment.id,
        "reservation_id": reservation.id
    }