# importaciones necesarias para el funcionamiento
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import Base
from app.database.database import engine
# importaciones de los modelos
from app.models.route import Route
from app.models.company import Company
from app.models.user import User
from app.models.reservation import Reservation
# importacion de las rutas
from app.routes.companies import router as company_router
from app.routes.route_routes import router as route_router
from app.routes.user_routes import router as user_router
from app.routes.reservation_routes import router as reservation_router

# cracion de la app
app = FastAPI(title="Transport API")

# crea las tablas
Base.metadata.create_all(bind=engine)

# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers
app.include_router(company_router)
app.include_router(route_router)
app.include_router(user_router)
app.include_router(reservation_router)