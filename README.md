# Autobuses API
Sistema web para la gestión de empresas de transporte, rutas, unidades, usuarios, reservaciones y pagos.
La aplicación está compuesta por un backend desarrollado con FastAPI y un frontend desarrollado con HTML, CSS y JavaScript. La información se almacena en PostgreSQL y el acceso a los diferentes módulos depende del rol del usuario autenticado.
---
# Tecnologías utilizadas
## Backend
- Python 3
- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- psycopg2-binary
- JWT para autenticación
## Frontend
- HTML5
- CSS3
- JavaScript
- Fetch API
## Base de datos
- PostgreSQL
---
# Requisitos
Para ejecutar el proyecto se necesita tener instalado:
- Python 3.10 o superior
- PostgreSQL
- Git
- Un navegador web
- Visual Studio Code o un editor de código similar
---
# Estructura general del proyecto
```text
Autobuses_API/
│
├── app/
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   │
│   ├── models/
│   │   ├── company.py
│   │   ├── route.py
│   │   ├── reservation.py
│   │   ├── unit.py
│   │   └── user.py
│   │
│   ├── routes/
│   │   ├── companies_routes.py
│   │   ├── routes_routes.py
│   │   ├── reservations_routes.py
│   │   ├── units_routes.py
│   │   ├── users_routes.py
│   │   └── payments_routes.py
│   │
│   └── schemas/
│       ├── company.py
│       ├── route.py
│       ├── reservation.py
│       ├── unit.py
│       └── user.py
│
├── frontend/
│   ├── dashboard.html
│   ├── login.html
│   ├── register.html
│   │
│   ├── css/
│   │   └── styles.css
│   │
│   └── js/
│       ├── api.js
│       ├── dashboard.js
│       │
│       └── modules/
│           ├── companies.js
│           ├── routes.js
│           ├── reservations.js
│           ├── users.js
│           ├── units.js
│           └── payments.js
│
├── requirements.txt
└── README.md
```
---
# Configuración de PostgreSQL
La aplicación utiliza PostgreSQL como sistema gestor de base de datos.
Primero se debe tener PostgreSQL instalado y ejecutándose.
Se debe crear una base de datos para el proyecto. Por ejemplo:
```sql
CREATE DATABASE autobuses_db;
```
También se puede utilizar un usuario específico para la aplicación:
```sql
CREATE USER autobuses_user WITH PASSWORD 'tu_password';
```
Después se le otorgan permisos sobre la base de datos:
```sql
GRANT ALL PRIVILEGES ON DATABASE autobuses_db TO autobuses_user;
```
Los datos necesarios para realizar la conexión son:
```text
Host: localhost
Puerto: 5432
Base de datos: autobuses_db
Usuario: autobuses_user
Contraseña: tu_password
```
---
# Conexión de la aplicación con PostgreSQL
La conexión con PostgreSQL se encuentra en:
```text
app/database.py
```
La aplicación utiliza SQLAlchemy para comunicarse con PostgreSQL.
La URL de conexión tiene la siguiente estructura:
```text
postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/BASE_DE_DATOS
```
Por ejemplo:
```text
postgresql://autobuses_user:tu_password@localhost:5432/autobuses_db
```
La configuración de SQLAlchemy utiliza esta información para crear el motor de conexión:
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
DATABASE_URL = "postgresql://autobuses_user:tu_password@localhost:5432/autobuses_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
Base = declarative_base()
```
La sesión utilizada por los endpoints se obtiene mediante:
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```
Las rutas que necesitan acceder a PostgreSQL utilizan esta sesión mediante `Depends(get_db)`.
---
# Modelos de base de datos
Los modelos de SQLAlchemy se encuentran en:
```text
app/models/
```
Los principales modelos son:
```text
Company
User
Route
Unit
Reservation
```
Las relaciones principales son:
```text
Company
   │
   ├── Users
   │
   └── Routes
          │
          └── Unit

User
   │
   └── Reservations
          │
          └── Route
```
Una empresa puede tener varios usuarios y varias rutas.
Cada ruta pertenece a una empresa y tiene una unidad asignada.
Una reservación pertenece a un usuario y a una ruta.
---
# Instalación del backend
Desde la carpeta principal del proyecto se crea el entorno virtual:
```bash
python -m venv venv
```
En Windows se activa con:
```powershell
venv\Scripts\activate
```
En Linux:
```bash
source venv/bin/activate
```
Después se instalan las dependencias:
```bash
pip install -r requirements.txt
```
Las principales dependencias utilizadas por el proyecto son:
```text
fastapi
uvicorn
sqlalchemy
psycopg2-binary
python-jose
passlib
```
---
# Configuración de la base de datos
Antes de iniciar el backend se debe comprobar que:
- PostgreSQL esté ejecutándose.
- La base de datos exista.
- El usuario tenga permisos sobre la base de datos.
- Los datos de conexión configurados en `app/database.py` sean correctos.
La aplicación utiliza SQLAlchemy para trabajar con las tablas definidas mediante los modelos del proyecto.
---
# Ejecución del backend
Con el entorno virtual activado, desde la carpeta principal del proyecto se ejecuta:
```bash
uvicorn app.main:app --reload
```
El backend estará disponible en:
```text
http://127.0.0.1:8000
```
La documentación automática de FastAPI está disponible en:
```text
http://127.0.0.1:8000/docs
```
También se puede utilizar:
```text
http://127.0.0.1:8000/redoc
```
---
# Ejecución del frontend
El frontend se encuentra dentro de:
```text
frontend/
```
El archivo principal del sistema autenticado es:
```text
frontend/dashboard.html
```
El frontend realiza las peticiones al backend mediante `fetch`.
La dirección de la API se encuentra configurada en:
```text
frontend/js/api.js
```
Actualmente:
```javascript
const API_URL = "http://127.0.0.1:8000";
```
Para ejecutar el frontend mediante un servidor HTTP local, desde la carpeta `frontend` se puede utilizar:
```bash
python -m http.server 5500
```
Después se accede mediante:
```text
http://127.0.0.1:5500
```
---
# Comunicación entre frontend y backend
El frontend no se conecta directamente con PostgreSQL.
La comunicación utiliza la siguiente estructura:
```text
Frontend
   │
   │ HTTP / JSON
   ▼
FastAPI
   │
   │ SQLAlchemy
   ▼
PostgreSQL
```
Por ejemplo, para consultar las reservaciones:
```text
Frontend
   │
   │ GET /reservations/
   ▼
FastAPI
   │
   ▼
SQLAlchemy
   │
   ▼
PostgreSQL
   │
   ▼
Reservation
   │
   ▼
JSON
   │
   ▼
Frontend
```
---
# Autenticación
La aplicación utiliza JWT para autenticar a los usuarios.
Después de iniciar sesión, el token se almacena en `localStorage`.
El archivo:
```text
frontend/js/api.js
```
contiene las funciones relacionadas con la autenticación:
```javascript
setToken()
getToken()
removeToken()
parseJwt()
getCurrentUser()
getUserRole()
```
Las peticiones autenticadas utilizan:
```javascript
authHeaders()
```
Esta función genera los encabezados:
```text
Content-Type: application/json
Authorization: Bearer TOKEN
```
El backend obtiene la información del usuario desde el token JWT y utiliza su rol para determinar los permisos disponibles.
---
# Roles del sistema
El sistema utiliza los siguientes roles:
```text
system_admin
company_admin
route_manager
traveler
auditor
```
---
# System Admin
El `system_admin` tiene acceso general al sistema.
Puede consultar:
- Empresas
- Usuarios
- Rutas
- Unidades
- Reservaciones
- Pagos
En el dashboard puede consultar:
- Número total de reservaciones.
- Ruta con mayor cantidad de reservaciones.
---
# Company Admin
El `company_admin` administra la información correspondiente a su empresa.
Puede trabajar con:
- Rutas
- Unidades
- Usuarios
- Reservaciones
- Pagos
Las reservaciones que consulta corresponden únicamente a rutas pertenecientes a su empresa.
---
# Route Manager
El `route_manager` se encarga de la gestión de rutas y de las ventas presenciales.
Puede:
- Crear rutas.
- Editar rutas.
- Consultar rutas.
- Crear reservaciones.
- Consultar reservaciones de su empresa.
- Confirmar pagos en efectivo.
- Eliminar reservaciones según los permisos establecidos.
Cuando realiza una reservación presencial, la reservación queda asociada al usuario del gestor que realizó la operación.
El gestor no necesita registrar el ID de un cliente para realizar una venta presencial.
---
# Traveler
El `traveler` representa al usuario que realiza sus propias reservaciones.
Puede:
- Consultar rutas.
- Crear reservaciones.
- Consultar sus reservaciones.
- Cancelar sus reservaciones.
- Realizar el proceso de pago.
Cuando un traveler crea una reservación, el `user_id` se obtiene directamente del usuario autenticado mediante el token JWT.
---
# Auditor
El `auditor` tiene permisos de consulta sobre la información del sistema.
Puede consultar:
- Rutas.
- Reservaciones.
- Pagos.
Puede visualizar las reservaciones de todo el sistema.
En el dashboard puede consultar:
- Número total de reservaciones.
- Ruta con mayor cantidad de reservaciones.
---
# Módulo de rutas
El módulo de rutas se encuentra en:
```text
frontend/js/modules/routes.js
```
Cada ruta contiene información como:
```text
ID
Origen
Destino
Hora de salida
Precio
Empresa
Unidad
```
Las rutas pertenecen a una empresa y tienen una unidad de transporte asociada.
Desde la tabla de rutas se puede iniciar el proceso de reservación.
Al seleccionar una ruta se obtiene la unidad correspondiente y se genera el mapa de asientos.
---
# Módulo de unidades
El módulo de unidades se encuentra en:
```text
frontend/js/modules/units.js
```
Las unidades representan los vehículos disponibles para las rutas.
Cada unidad tiene un tipo y una cantidad de asientos.
Los tipos utilizados actualmente son:
```text
bus
combi
```
La cantidad de asientos de la unidad determina la cantidad de botones que se muestran en el mapa de asientos.
---
# Módulo de reservaciones
El módulo de reservaciones se encuentra en:
```text
frontend/js/modules/reservations.js
```
Una reservación relaciona:
```text
Usuario
Pasajero
Ruta
Asiento
Estado
```
El flujo de creación es:
```text
Ruta
 │
 ▼
Unidad
 │
 ▼
Mapa de asientos
 │
 ▼
Selección de asiento
 │
 ▼
Datos del pasajero
 │
 ▼
POST /reservations/
 │
 ▼
Reservación
```
---
# Mapa de asientos
Antes de crear una reservación se consulta la unidad asociada a la ruta.
Después se consulta:
```text
GET /reservations/route/{route_id}/available-seats
```
El endpoint devuelve los asientos que ya están ocupados.
Los asientos ocupados aparecen deshabilitados.
El asiento seleccionado se marca visualmente.
Para un autobús se utiliza una distribución con pasillo:
```text
A1  A2     A3  A4
A5  A6     A7  A8
A9  A10    A11 A12
```
Las combis utilizan dos columnas.
---
# Creación de reservaciones
El endpoint utilizado es:
```text
POST /reservations/
```
La información enviada tiene la siguiente estructura:
```json
{
    "passenger_name": "Nombre del pasajero",
    "seat_number": "A5",
    "user_id": 1,
    "route_id": 2
}
```
El backend comprueba:
- Que el usuario tenga permisos.
- Que la ruta exista.
- Que el asiento no esté ocupado.
Cuando la reservación se crea correctamente, su estado inicial es:
```text
pending
```
---
# Consulta de reservaciones
El endpoint principal es:
```text
GET /reservations/
```
El resultado depende del rol autenticado.
Los roles `system_admin` y `auditor` pueden consultar todas las reservaciones.
Los roles `company_admin` y `route_manager` únicamente pueden consultar las reservaciones correspondientes a rutas de su empresa.
Los travelers utilizan:
```text
GET /reservations/me
```
para consultar únicamente sus propias reservaciones.
---
# Detalles de reservaciones
El endpoint:
```text
GET /reservations/details
```
permite obtener información adicional de las reservaciones, incluyendo el nombre de la ruta en formato:
```text
Origen → Destino
```
Esto permite mostrar el destino de la ruta en lugar de mostrar únicamente el `route_id`.
---
# Cancelación de reservaciones
El endpoint utilizado es:
```text
DELETE /reservations/{reservation_id}
```
Un traveler solamente puede cancelar sus propias reservaciones.
Un `route_manager` o `company_admin` puede cancelar reservaciones pertenecientes a su empresa.
El `system_admin` tiene acceso general.
---
# Pagos
El módulo de pagos se encuentra en:
```text
frontend/js/modules/payments.js
```
Las reservaciones comienzan con:
```text
pending
```
El traveler puede iniciar el proceso de pago.
Para las ventas presenciales, el `route_manager` y el `company_admin` pueden confirmar el pago en efectivo.
El endpoint utilizado para confirmar un pago es:
```text
POST /payments/confirm/{reservation_id}
```
---
# Dashboard
El dashboard principal se encuentra en:
```text
frontend/dashboard.html
```
La lógica se encuentra en:
```text
frontend/js/dashboard.js
```
El contenido del dashboard depende del rol.
## System Admin
Muestra:
- Número total de reservaciones.
- Ruta con mayor número de reservaciones.
## Auditor
Muestra:
- Número total de reservaciones.
- Ruta con mayor número de reservaciones.
## Company Admin
Muestra:
- Número total de reservaciones de su empresa.
## Route Manager
Muestra:
- Número total de reservaciones de su empresa.
## Traveler
Muestra:
- Número total de reservaciones realizadas por el usuario.
---
# Endpoints principales
## Empresas
```text
GET    /companies/
POST   /companies/
GET    /companies/{company_id}
PUT    /companies/{company_id}
DELETE /companies/{company_id}
```
## Usuarios
```text
POST /users/
GET  /users/
POST /users/login
```
## Rutas
```text
GET    /routes/
POST   /routes/
GET    /routes/{route_id}
PUT    /routes/{route_id}
DELETE /routes/{route_id}
```
## Unidades
```text
GET    /units/
POST   /units/
GET    /units/{unit_id}
PUT    /units/{unit_id}
DELETE /units/{unit_id}
```
## Reservaciones
```text
GET    /reservations/
GET    /reservations/me
GET    /reservations/details
POST   /reservations/
PUT    /reservations/{reservation_id}
DELETE /reservations/{reservation_id}
GET    /reservations/route/{route_id}/available-seats
```
## Pagos
Los endpoints de pagos se encuentran dentro del módulo correspondiente del backend y trabajan directamente con las reservaciones.
---
# Flujo general del sistema
```text
Usuario
   │
   ▼
Inicio de sesión
   │
   ▼
JWT
   │
   ▼
Dashboard
   │
   ├── Empresas
   ├── Usuarios
   ├── Rutas
   ├── Unidades
   ├── Reservaciones
   └── Pagos
```
---
# Flujo de una reservación
```text
Ruta
 │
 ▼
Unidad asignada
 │
 ▼
Mapa de asientos
 │
 ▼
Selección de asiento
 │
 ▼
Datos del pasajero
 │
 ▼
POST /reservations/
 │
 ▼
Reservación
 │
 ▼
pending
 │
 ├── Pago en línea
 │
 └── Pago en efectivo
        │
        ▼
    Confirmación
```
---
# Relación entre los componentes
```text
┌──────────────┐
│   Company    │
└──────┬───────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
┌──────────────┐ ┌──────────────┐
│     User     │ │     Route    │
└──────┬───────┘ └──────┬───────┘
       │                │
       │                ├──────────────┐
       │                │              │
       │                ▼              ▼
       │           ┌──────────┐   ┌──────────────┐
       │           │   Unit   │   │ Reservation  │
       │           └──────────┘   └──────┬───────┘
       │                                  │
       └──────────────────────────────────┘
```
---
# Archivos principales
## Backend
### `app/main.py`
Punto de entrada de FastAPI y registro de los routers de la aplicación.
### `app/database.py`
Contiene la configuración de PostgreSQL, el motor de SQLAlchemy y las sesiones de base de datos.
### `app/auth.py`
Contiene la autenticación mediante JWT y las funciones utilizadas para controlar los permisos de los diferentes roles.
### `app/models/`
Contiene los modelos de SQLAlchemy que representan las entidades principales de la base de datos.
### `app/schemas/`
Contiene los esquemas Pydantic utilizados para validar la información enviada y recibida por la API.
### `app/routes/`
Contiene los endpoints de la aplicación.
---
# Frontend
### `frontend/js/api.js`
Contiene la URL de la API, manejo del token JWT, autenticación y funciones relacionadas con el usuario actual.
### `frontend/js/dashboard.js`
Controla el dashboard, menú lateral, navegación y contenido mostrado según el rol.
### `frontend/js/modules/routes.js`
Controla la consulta, creación, edición y eliminación de rutas.
### `frontend/js/modules/reservations.js`
Controla la creación y consulta de reservaciones, selección de rutas, unidades y asientos.
### `frontend/js/modules/units.js`
Controla la gestión de las unidades de transporte.
### `frontend/js/modules/users.js`
Controla las operaciones relacionadas con usuarios.
### `frontend/js/modules/companies.js`
Controla las operaciones relacionadas con empresas.
### `frontend/js/modules/payments.js`
Controla las operaciones relacionadas con pagos.
### `frontend/css/styles.css`
Contiene los estilos generales de la aplicación, tablas, botones, formularios y mapa de asientos.
### `frontend/dashboard.html`
Contiene la estructura principal de la interfaz autenticada.
---
# Desarrollo local
Para trabajar con el proyecto se deben ejecutar los siguientes componentes:
### PostgreSQL
Debe estar ejecutándose y tener disponible la base de datos configurada en:
```text
app/database.py
```
### Backend
Con el entorno virtual activado:
```bash
uvicorn app.main:app --reload
```
### Frontend
Desde `frontend/`:
```bash
python -m http.server 5500
```
### Direcciones
Frontend:
```text
http://127.0.0.1:5500
```
Backend:
```text
http://127.0.0.1:8000
```
Documentación de FastAPI:
```text
http://127.0.0.1:8000/docs
```
---
# Solución de problemas
## Error de conexión con PostgreSQL
Comprobar:
```text
Host
Puerto
Usuario
Contraseña
Nombre de la base de datos
```
La configuración se encuentra en:
```text
app/database.py
```
También se debe comprobar que PostgreSQL esté ejecutándose.
---
## Error de conexión entre frontend y backend
Comprobar la variable:
```javascript
const API_URL = "http://127.0.0.1:8000";
```
en:
```text
frontend/js/api.js
```
También comprobar que FastAPI esté ejecutándose.
---
## Error 401 Unauthorized
Indica que el token JWT no está presente, expiró o no es válido.
Se debe iniciar sesión nuevamente.
---
## Error 403 Forbidden
Indica que el usuario autenticado no tiene permisos para realizar la operación solicitada.
Se debe comprobar el rol del usuario y los permisos definidos en `app/auth.py`.
---
## Error 404
Indica que el recurso solicitado no existe.
Puede ocurrir al intentar acceder a:
```text
Ruta inexistente
Unidad inexistente
Reservación inexistente
Usuario inexistente
```
Se debe comprobar el ID utilizado en la petición.
---
## Error 400 al crear una reservación
Uno de los casos principales ocurre cuando se intenta reservar un asiento que ya está ocupado.
El frontend consulta previamente:
```text
GET /reservations/route/{route_id}/available-seats
```
para obtener los asientos ocupados.
---
# Inicio rápido
Una vez configurado PostgreSQL:
```bash
python -m venv venv
```
Windows:
```powershell
venv\Scripts\activate
```
Linux:
```bash
source venv/bin/activate
```
Instalar dependencias:
```bash
pip install -r requirements.txt
```
Iniciar backend:
```bash
uvicorn app.main:app --reload
```
En otra terminal, iniciar frontend:
```bash
cd frontend
python -m http.server 5500
```
Abrir:

```text
http://127.0.0.1:5500
```
API:

```text
http://127.0.0.1:8000
```
Documentación:
```text
http://127.0.0.1:8000/docs
```