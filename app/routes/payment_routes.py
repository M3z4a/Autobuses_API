from fastapi import APIRouter, HTTPException, Depends
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from sqlalchemy.orm import Session
from app.auth import get_current_user, require_employee, require_client
from app.database.database import SessionLocal
from app.models.reservation import Reservation
from app.paypal_config import client
from app.models.route import Route
#router de pagos
router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)
#sesion de la bd
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#crea la orden de paypal por medio del id de la reservacion
@router.post("/create/{reservation_id}")
def create_payment(
    reservation_id: int,
    db: Session = Depends(get_db)
):
    # busca la reservacion
    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()
    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservación inexistente"
        )
    # obtiene el precio de la ruta asociada
    route = reservation.route
    if not route:
        raise HTTPException(
            status_code=404,
            detail="Ruta inexistente"
        )
    request = OrdersCreateRequest()
    request.prefer("return=representation")
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
            "return_url": f"http://127.0.0.1:8000/frontend/paypal_return.html?reservation_id={reservation_id}",
            "cancel_url": "http://127.0.0.1:8000/frontend/dashboard.html"
        }
    })
    try:
        response = client.execute(request)
        approval_url = None
        for link in response.result.links:
            if link.rel == "approve":
                approval_url = link.href
                break
        if not approval_url:
            raise HTTPException(
                status_code=500,
                detail="No approval_url generated"
            )
        return {
            "order_id": response.result.id,
            "approval_url": approval_url
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
#captura el pago y confirma la reservacion
@router.post("/capture/{order_id}/{reservation_id}")
def capture_payment(order_id: str, reservation_id: int, db: Session = Depends(get_db)):
    #pide el id de orden
    request = OrdersCaptureRequest(order_id)
    try:
        response = client.execute(request)
        status = response.result.status
        if status == "COMPLETED":
            #pide el id de reservacion a la bd
            reservation = db.query(Reservation).filter(
                Reservation.id == reservation_id
            ).first()
            #si no existe el id lanzara mensaje de error
            if not reservation:
                raise HTTPException(
                    status_code=404,
                    detail="Reservación inexistente"
                )
            #si si existe, la reservacion automaticamente se confirmara
            reservation.status = "confirmed"
            #guarda en labd
            db.commit()
            db.refresh(reservation)
            #devuelve mensaje de exito y cambia el estado de la reservacion
            return {
                "message": "Pago completado y reservación confirmada",
                "paypal_status": status,
                "reservation_id": reservation.id
            }
        #si algo falla, el pago no se completara y la reservacion seguira pendiente
        return {
            "message": "Pago no completado",
            "paypal_status": status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#obtiene los pagos hechos
@router.get("/")
def get_payments(
    db: Session = Depends(get_db),
    current_user=Depends(require_employee)
):
    #pide a la bd las reservaciones confirmadas
    payments = db.query(Reservation).filter(
        Reservation.status == "confirmed"
    ).all()
    #la bd devuelve los datos requeridos
    return [
        {
            "reservation_id": p.id,
            "user_id": p.user_id,
            "route_id": p.route_id,
            "seat_number": p.seat_number,
            "status": p.status
        }
        for p in payments
    ]