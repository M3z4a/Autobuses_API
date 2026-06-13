from fastapi import FastAPI
from app.models.route import Route
# importa los modelos necesarios para la creacion de las tablas en bd
from app.database.database import Base
from app.database.database import engine
from app.models.company import Company
from app.routes.companies import router as company_router
from app.routes.route_routes import router as route_router
from app.models.user import User
from app.models.reservation import Reservation
# importa los routers de las rutas para incluirlos en la aplicacion
from app.routes.user_routes import router as user_router
from app.routes.reservation_routes import router as reservation_router
# crea la app de fastAPI
app = FastAPI(
    #asigna el titulo de la app
    title="Transport API"
)
# crea las tablas en la bd a partir de modelos ya definidos
Base.metadata.create_all(bind=engine)
# incluyo routers para que sean utilizables por la app
app.include_router(company_router)
app.include_router(route_router)
app.include_router(user_router)
app.include_router(reservation_router)