# Transport API - Sistema de Gestión de Autobuses
## Descripción del proyecto
Este proyecto consiste en una API desarrollada con FastAPI para la gestión de un sistema de transporte de autobuses. Permite administrar usuarios, compañías, rutas y reservaciones, incorporando autenticación mediante JWT y control de acceso basado en roles.
La API está diseñada para ser consumida por un frontend (por problemas con el frontend, esta vez lo quite, lo agregare pronto ya bien hecho) o herramientas como Swagger UI.
## Tecnologías utilizadas
- Python 3.12
- FastAPI
- SQLAlchemy
- SQLite o PostgreSQL (según configuración)
- JWT (JSON Web Tokens)
- Passlib (hash de contraseñas)
- Uvicorn
## Funcionalidades principales
### Usuarios
- Registro de usuarios
- Inicio de sesión mediante JWT
- Gestión de roles: administrador, empleado y cliente
### Compañías
- Creación de compañías
- Consulta de compañías registradas
- Consulta de rutas asociadas a una compañía
### Rutas
- Creación de rutas (administrador)
- Consulta de rutas
- Actualización de rutas
- Eliminación de rutas
### Reservaciones
- Creación de reservaciones
- Consulta de reservaciones
- Confirmación de reservaciones
- Consulta de asientos disponibles
- Resumen general de reservaciones (dashboard)
## Autenticación
El sistema utiliza autenticación basada en JWT.
El token se envía en las peticiones protegidas mediante el siguiente encabezado:
Authorization: Bearer <token>
## Roles del sistema
- admin: acceso completo al sistema
- employee: acceso operativo limitado
- client: acceso básico para creación de reservaciones
## Ejecución del proyecto
Para ejecutar el servidor se utiliza el siguiente comando:
uvicorn app.main:app --reload
La doumentación interactiva de la API se encuentra en:
http://127.0.0.1:8000/docs
## Estructura del proyecto
app/
├── models/
├── routes/
├── schemas/
├── database/
├── auth.py
└── main.py
## Notas importantes
- El proyecto se encuentra en entorno de desarrollo
- Las tablas se crean automáticamente al iniciar la aplicación
- No incluye frontend, únicamente la API
