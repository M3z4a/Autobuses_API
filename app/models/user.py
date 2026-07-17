from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

# importa la bd
from app.database import Base

# crea la tabla users (usuarios) en bd
class User(Base):
    __tablename__ = "users"

    # parametros de la bd
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    #rol del usuario
    role = Column(String, nullable=False, default="client")

    # relaciona la tabla users (usuarios) con la tabla reservations (reservaciones)
    reservations = relationship(
        "Reservation",
        back_populates="user"
    )
