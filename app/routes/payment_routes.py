from fastapi import APIRouter, HTTPException, Depends
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from sqlalchemy.orm import Session
from app.auth import (get_current_user, require_route_manager, require_authenticated, require_reservation_view)
from app.database.database import SessionLocal
from app.models.reservation import Reservation
from app.models.payment import Payment
from app.paypal_config import client
from app.schemas.payment import PaymentResponse

# router de pagos 
router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)
# sesion de la bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# crea la orden de paypal por medio del id de la reservacion
@router.post("/create/{reservation_id}")
def create_payment(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_authenticated)
):
    # busca la reservacion asociada al pago
    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()
    # si no existe la reservacion mostrara un error
    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservación inexistente"
        )
    # verifica que la reservacion pertenezca al usuario que esta pagando
    if current_user["role"] == "traveler":
        if reservation.user_id != int(current_user["sub"]):
            raise HTTPException(
                status_code=403,
                detail="No puedes pagar una reservación que no te pertenece"
            )
    # obtiene el precio de la ruta asociada
    route = reservation.route
    # si no existe la ruta mostrara un error
    if not route:
        raise HTTPException(
            status_code=404,
            detail="Ruta inexistente"
        )
    # crea la orden de pago en paypal
    request = OrdersCreateRequest()
    request.prefer(
        "return=representation"
    )
    request.request_body({
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "MXN",
                    "value": str(route.price)
                }
            }
        ],
        "application_context": {
            "return_url":
            f"http://127.0.0.1:8000/frontend/paypal_return.html?reservation_id={reservation_id}",
            "cancel_url":
            "http://127.0.0.1:8000/frontend/dashboard.html"
        }
    })
    try:
        response = client.execute(request)
        approval_url = None
        # busca la url donde el usuario aprobara el pago
        for link in response.result.links:
            if link.rel == "approve":
                approval_url = link.href
                break
        # si paypal no genera la url mostrara un error
        if not approval_url:
            raise HTTPException(
                status_code=500,
                detail="No se pudo generar la URL de pago"
            )
        # guarda la orden creada en la bd
        new_payment = Payment(
            paypal_order_id=response.result.id,
            status="pending",
            amount=route.price,
            reservation_id=reservation.id
        )
        db.add(new_payment)
        db.commit()
        db.refresh(new_payment)
        return {
            "payment_id": new_payment.id,
            "order_id": response.result.id,
            "approval_url": approval_url
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# captura el pago y confirma la reservacion
@router.post("/capture/{order_id}")
def capture_payment(
    order_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_authenticated)
):
    # solicita la captura del pago a paypal
    request = OrdersCaptureRequest(order_id)
    try:
        response = client.execute(request)
        status = response.result.status
        # busca el pago asociado a la orden
        payment = db.query(Payment).filter(
            Payment.paypal_order_id == order_id
        ).first()
        # si no existe el pago mostrara error
        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Pago inexistente"
            )
        # si paypal confirma el pago cambia el estado
        if status == "COMPLETED":
            payment.status = "completed"
            reservation = db.query(Reservation).filter(
                Reservation.id == payment.reservation_id
            ).first()
            # confirma la reservacion automaticamente
            if reservation:
                reservation.status = "confirmed"
            db.commit()
            return {
                "message":
                "Pago completado y reservación confirmada",
                "paypal_status":
                status,
                "reservation_id":
                payment.reservation_id
            }
        # si algo falla el pago seguira pendiente
        return {
            "message":
            "Pago no completado",
            "paypal_status":
            status
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
# obtiene los pagos realizados
@router.get("/", response_model=list[PaymentResponse])
def get_payments(
    db: Session = Depends(get_db),
    current_user=Depends(require_reservation_view)
):
    payments = db.query(Payment).filter(
        Payment.status == "completed"
    ).all()
    result = []
    for payment in payments:
        reservation = payment.reservation
        result.append({
            "id": payment.id,
            "paypal_order_id": payment.paypal_order_id,
            "status": payment.status,
            "amount": payment.amount,
            "reservation_id": payment.reservation_id,
            "user_id": reservation.user_id,
            "route_id": reservation.route_id,
            "seat_number": reservation.seat_number
        })
    return result

@router.post("/confirm/{reservation_id}")
def confirm_cash_payment(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_route_manager)
):
    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()
    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservación no encontrada"
        )
    reservation.status = "confirmed"
    db.commit()
    db.refresh(reservation)
    return {
        "message": "Pago confirmado",
        "reservation_id": reservation.id
    }