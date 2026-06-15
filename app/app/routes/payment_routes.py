from fastapi import APIRouter, HTTPException
from paypalcheckoutsdk.orders import OrdersCreateRequest
from paypalcheckoutsdk.orders import OrdersCaptureRequest
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import SessionLocal
from app.models.reservation import Reservation
from app.paypal_config import client

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)
def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

@router.post("/create")
def create_payment():

    request = OrdersCreateRequest()

    request.prefer("return=representation")

    request.request_body({
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "MXN",
                    "value": "100.00"
                }
            }
        ],
        "application_context": {
            "return_url": "http://127.0.0.1:8000/payments/success",
            "cancel_url": "http://127.0.0.1:8000/payments/cancel"
        }
    })

    try:
        response = client.execute(request)

        approval_url = None

        for link in response.result.links:
            if link.rel == "approve":
                approval_url = link.href
                break

        return {
            "order_id": response.result.id,
            "approval_url": approval_url
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.post("/capture/{order_id}/{reservation_id}")
def capture_payment(
    order_id: str,
    reservation_id: int,
    db: Session = Depends(get_db)
):

    request = OrdersCaptureRequest(order_id)

    try:
        response = client.execute(request)

        status = response.result.status

        if status == "COMPLETED":

            reservation = db.query(Reservation).filter(
                Reservation.id == reservation_id
            ).first()

            if not reservation:
                raise HTTPException(
                    status_code=404,
                    detail="Reservación inexistente"
                )

            reservation.status = "confirmed"

            db.commit()
            db.refresh(reservation)

            return {
                "message": "Pago completado y reservación confirmada",
                "paypal_status": status,
                "reservation_id": reservation.id
            }

        return {
            "message": "Pago no completado",
            "paypal_status": status
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )