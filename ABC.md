# Documentación ABC de Variables del Sistema
Este documento describe las principales variables utilizadas en el sistema, organizadas por categorías.
## A - AUTENTICACIÓN
### SECRET_KEY
Clave secreta utilizada para firmar los tokens JWT. Debe mantenerse privada y segura.
Ejemplo:
SECRET_KEY = "secret_key"
### ALGORITHM
Algoritmo utilizado para la generación del token JWT.
Valor utilizado:
HS256
### ACCESS_TOKEN_EXPIRE_MINUTES
Tiempo de expiración del token de acceso expresado en minutos.
Valor actual:
60
## B - BASE DE DATOS
### engine
Motor de conexión con la base de datos. Permite la comunicación entre SQLAlchemy y la base de datos.
### Base
Clase base utilizada para la definición de modelos de base de datos.
### SessionLocal
Generador de sesiones de base de datos utilizado en las rutas mediante dependencia.
## C - CONTROL DEL SISTEMA
### role (User.role)
Define el tipo de usuario dentro del sistema.
Valores posibles:
- admin
- employee
- client
### status (Reservation.status)
Define el estado de una reservación.
Valores posibles:
- pending
- confirmed
### seat_number
Identificador del asiento asignado dentro de una reservación.
Formato:
A1, A2, A3, etc.
## Consideraciones finales
Estas variables son fundamentales para el funcionamiento del sistema, ya que controlan la autenticación, la persistencia de datos y la lógica de negocio basada en roles.