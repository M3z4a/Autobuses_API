# Documentacion Backend
---
# Auth.py
## create_access_token()
Archivo: `app/auth.py`
Esta función crea un token JWT cuando un usuario inicia sesión correctamente. Dentro del token se guarda la información del usuario para que el sistema pueda identificarlo mientras su sesión siga activa.
Parámetros:
* data: información que se almacenará dentro del token.
* expires_delta: tiempo que durará el token antes de expirar (opcional).
Retorna:
* El token JWT generado.

## get_current_user()
Archivo: `app/auth.py`
Esta función revisa el token que envía el usuario en cada petición protegida. Si el token es válido, obtiene la información del usuario y la devuelve para que el sistema sepa quién está realizando la petición.
Parámetros:
* token: token JWT enviado por el usuario.
Retorna:
* La información del usuario autenticado.

## require_admin()
Archivo: `app/auth.py`
Verifica que el usuario autenticado tenga el rol de administrador. Si no tiene ese rol, no permite continuar con la petición.
Parámetros:
* current_user: usuario autenticado.
Retorna:
* El usuario autenticado si tiene permisos de administrador.

## require_employee()
Archivo: `app/auth.py`
Comprueba que el usuario tenga el rol de empleado antes de permitir el acceso a las funciones destinadas para ese tipo de usuario.
Parámetros:
* current_user: usuario autenticado.
Retorna:
* El usuario autenticado si cumple con el rol requerido.

## require_client()
Archivo: `app/auth.py`
Comprueba que el usuario tenga el rol de cliente. Si el rol es correcto, permite continuar con la ejecución de la función.
Parámetros:
* current_user: usuario autenticado.
Retorna:
* El usuario autenticado.

# User_routes.py
## get_db()
Archivo: `app/routes/user_routes.py`
Esta función crea una conexión con la base de datos para que las demás funciones del módulo puedan realizar consultas o guardar información. Cuando termina de utilizarse, la conexión se cierra automáticamente.
Parámetros:
* Ninguno.
Retorna:
* Una sesión de la base de datos.

## register_user()
Archivo: `app/routes/user_routes.py`
Esta función registra un nuevo usuario en el sistema. Primero verifica que el correo no esté registrado, después cifra la contraseña utilizando bcrypt y finalmente guarda el usuario en la base de datos.
Parámetros:
* user: información del usuario que se va a registrar.
* db: conexión con la base de datos.
Retorna:
* Los datos del usuario registrado.

## login()
Archivo: `app/routes/user_routes.py`
Esta función inicia sesión. Busca un usuario con el correo proporcionado, verifica que la contraseña sea correcta y, si todo está bien, genera un token JWT para que pueda acceder al sistema.
Parámetros:
* request: correo y contraseña enviados desde el formulario de inicio de sesión.
* db: conexión con la base de datos.
Retorna:
* El token de acceso junto con la información básica del usuario.

## get_users()
Archivo: `app/routes/user_routes.py`
Obtiene todos los usuarios registrados en la base de datos. Se utiliza para mostrar la lista de usuarios dentro del sistema.
Parámetros:
* db: conexión con la base de datos.
Retorna:
* Una lista con todos los usuarios registrados.

## get_user()
Archivo: `app/routes/user_routes.py`
Busca un usuario utilizando su identificador. Si existe, devuelve toda su información; si no existe, devuelve un error indicando que el usuario no fue encontrado.
Parametros:
* user_id: identificador del usuario.
* db: conexión con la base de datos.
Retorna:
* La información del usuario solicitado.

# Companies.py
## create_company()
Archivo: `app/routes/companies.py`
Esta función registra una empresa nueva en la base de datos. Recibe la información enviada desde el frontend, crea el registro y lo guarda para que pueda utilizarse en el sistema.
Parámetros:
* company: información de la empresa.
* db: conexión con la base de datos.
Retorna:
* La empresa registrada.

## get_companies()
Archivo: `app/routes/companies.py`
Obtiene todas las empresas registradas en la base de datos. Se utiliza para mostrar la lista de empresas en el frontend.
Parámetros:
* db: conexión con la base de datos.
Retorna:
* Una lista con todas las empresas.

## update_company()
Archivo: `app/routes/companies.py`
Actualiza la información de una empresa existente. Busca la empresa por su identificador, modifica los datos enviados y guarda los cambios.
Parámetros:
* company_id: identificador de la empresa.
* company: nueva información de la empresa.
* db: conexión con la base de datos.
Retorna:
* La empresa con la información actualizada.

## delete_company()
Archivo: `app/routes/companies.py`
Elimina una empresa registrada de la base de datos utilizando su identificador.
Parámetros:
* company_id: identificador de la empresa.
* db: conexión con la base de datos.
Retorna:
* Un mensaje confirmando que la empresa fue eliminada.

## get_company_routes()
Archivo: `app/routes/companies.py`
Obtiene todas las rutas que pertenecen a una empresa en específico. Es útil para consultar únicamente las rutas registradas por esa empresa.
Parámetros:
* company_id: identificador de la empresa.
* db: conexión con la base de datos.
Retorna:
* Una lista con las rutas de la empresa.

# Route_routes.py
## get_db()
Archivo: `app/routes/route_routes.py`
Crea una sesión de conexión con la base de datos para que las funciones del módulo de rutas puedan realizar consultas y guardar información. Al finalizar, la conexión se cierra automáticamente.
Parámetros:
* Ninguno.
Retorna:
* Una sesión de la base de datos.

## create_route()
Archivo: `app/routes/route_routes.py`
Registra una nueva ruta en la base de datos. Guarda la información enviada desde el frontend para que después pueda ser utilizada en las reservaciones.
Parámetros:
* route: información de la ruta.
* db: conexión con la base de datos.
Retorna:
* La ruta registrada.

## get_routes()
Archivo: `app/routes/route_routes.py`
Obtiene todas las rutas registradas para mostrarlas en el sistema.
Parámetros:
* db: conexión con la base de datos.
Retorna:
* Una lista con todas las rutas.

## get_route()
Archivo: `app/routes/route_routes.py`
Busca una ruta utilizando su identificador y devuelve toda su información.
Parámetros:
* route_id: identificador de la ruta.
* db: conexión con la base de datos.
Retorna:
* La información de la ruta encontrada.

## update_route()
Archivo: `app/routes/route_routes.py`
Actualiza la información de una ruta existente. Modifica únicamente los datos enviados y guarda los cambios en la base de datos.
Parámetros:
* route_id: identificador de la ruta.
* route: nueva información de la ruta.
* db: conexión con la base de datos.
Retorna:
* La ruta actualizada.

## delete_route()
Archivo: `app/routes/route_routes.py`
Elimina una ruta de la base de datos utilizando su identificador.
Parámetros:
* route_id: identificador de la ruta.
* db: conexión con la base de datos.
Retorna:
* Un mensaje indicando que la ruta fue eliminada correctamente.

# Main.py
## paypal_return()
Archivo: `app/main.py`
Esta función se ejecuta cuando PayPal devuelve al usuario al sistema después de intentar realizar un pago. Se encarga de recibir esa respuesta y continuar con el proceso correspondiente.
Parámetros:
* Ninguno.
Retorna:
* La respuesta correspondiente después del regreso desde PayPal.

# Payment_routes.py
## get_db()
Archivo: `app/routes/payment_routes.py`
Crea una conexión con la base de datos para que las funciones del módulo de pagos puedan realizar consultas o guardar información. Al terminar, la conexión se cierra automáticamente.
Parámetros:
* Ninguno.
Retorna:
* Una sesión de la base de datos.

## create_payment()
Archivo: `app/routes/payment_routes.py`
Esta función crea un pago para una reservación. Recibe el identificador de la reservación y genera el proceso necesario para iniciar el pago.
Parámetros:
* reservation_id: identificador de la reservación.
Retorna:
* La información del pago generado o la respuesta correspondiente del proceso.

## capture_payment()
Archivo: app/routes/payment_routes.py
Esta función confirma el pago realizado en PayPal. Si el pago fue exitoso, busca la reservación correspondiente, cambia su estado a confirmed y guarda los cambios en la base de datos.
Parámetros:
* order_id: identificador de la orden generada por PayPal.
* reservation_id: identificador de la reservación.
* db: conexión con la base de datos.
Retorna:
* Un mensaje indicando si el pago fue completado correctamente y el estado final de la reservación.

## get_payments()
Archivo: app/routes/payment_routes.py
Obtiene todas las reservaciones que ya fueron pagadas. Solo devuelve aquellas cuyo estado sea confirmed, para que puedan mostrarse en el apartado de pagos del sistema.
Parámetros:
* db: conexión con la base de datos.
* current_user: usuario autenticado con permisos de empleado.
Retorna:
* Una lista con todas las reservaciones confirmadas junto con su información principal.

# Reservation_routes.py
## get_db()
Archivo: `app/routes/reservation_routes.py`
Esta función crea una conexión con la base de datos para que las demás funciones del módulo de reservaciones puedan consultar o guardar información. Cuando termina de utilizarse, la conexión se cierra automáticamente.
Parámetros:
* Ninguno.
Retorna:
* Una sesión de la base de datos.

## create_reservation()
Archivo: `app/routes/reservation_routes.py`
Esta función crea una nueva reservación. Primero verifica que el usuario exista, después comprueba que la ruta también exista y revisa que el asiento no esté ocupado. Si todo es correcto, guarda la reservación con estado **pending**.
Parámetros:
* reservation: información de la reservación.
* db: conexión con la base de datos.
* current_user: usuario autenticado con rol de cliente.
Retorna:
* La reservación creada.

## get_reservations()
Archivo: `app/routes/reservation_routes.py`
Obtiene todas las reservaciones registradas en la base de datos. Esta función solo puede ser utilizada por empleados o administradores.
Parámetros:
* db: conexión con la base de datos.
* current_user: usuario autenticado con permisos de empleado.
Retorna:
* Una lista con todas las reservaciones.

## get_reservations_details()
Archivo: `app/routes/reservation_routes.py`
Obtiene una lista de reservaciones con información más detallada. Además del número de asiento y el estado, también muestra el nombre del usuario y el nombre de la ruta correspondiente.
Parámetros:
* db: conexión con la base de datos.
* current_user: usuario autenticado con permisos de empleado.
Retorna:
* Una lista con la información detallada de cada reservación.

## update_reservation()
Archivo: `app/routes/reservation_routes.py`
Actualiza la información de una reservación existente. Permite modificar el asiento, el usuario y la ruta asociados a la reservación.
Parámetros:
* reservation_id: identificador de la reservación.
* reservation: nueva información de la reservación.
* db: conexión con la base de datos.
* current_user: usuario autenticado con permisos de empleado.
Retorna:
* La reservación actualizada.

## delete_reservation()
Archivo: `app/routes/reservation_routes.py`
Elimina una reservación utilizando su identificador. Antes de eliminarla verifica que exista en la base de datos.
Parámetros:
* reservation_id: identificador de la reservación.
* db: conexión con la base de datos.
* current_user: usuario autenticado con permisos de cliente.
Retorna:
* Un mensaje confirmando que la reservación fue eliminada.

## get_available_seats()
Archivo: `app/routes/reservation_routes.py`
Obtiene los asientos disponibles de una ruta. Genera la lista de asientos, consulta cuáles ya están ocupados y devuelve únicamente los que siguen libres.
Parámetros:
* route_id: identificador de la ruta.
* db: conexión con la base de datos.
* current_user: usuario autenticado con permisos de cliente.
Retorna:
* El identificador de la ruta y la lista de asientos disponibles.

## dashboard_summary()
Archivo: `app/routes/reservation_routes.py`
Genera un pequeño resumen de las reservaciones registradas. Cuenta el total de reservaciones, cuántas están pendientes y cuántas ya fueron confirmadas.
Parámetros:
* db: conexión con la base de datos.
* current_user: usuario autenticado con permisos de empleado.
Retorna:
* Un resumen con el total de reservaciones, las pendientes y las confirmadas.

## get_my_reservations()
Archivo: `app/routes/reservation_routes.py`
Obtiene únicamente las reservaciones que pertenecen al usuario que inició sesión. Utiliza el identificador almacenado en el token para realizar la búsqueda.
Parámetros:
* user: usuario autenticado.
* db: conexión con la base de datos.
Retorna:
* Una lista con las reservaciones del usuario.

# Unit_routes.py
## get_db()
Archivo: `app/routes/unit_routes.py`
Esta función crea una conexión con la base de datos para que las demás funciones del módulo de unidades puedan realizar consultas o guardar información. Cuando termina de utilizarse, la conexión se cierra automáticamente.
Parámetros:
* Ninguno.
Retorna:
* Una sesión de la base de datos.

## create_unit()
Archivo: `app/routes/unit_routes.py`
Esta función registra una nueva unidad de transporte. Recibe la información enviada desde el frontend, verifica que la empresa exista y guarda la unidad en la base de datos.
Parámetros:
* unit: información de la unidad.
* db: conexión con la base de datos.
* current_user: usuario autenticado con permisos de administrador.
Retorna:
* La unidad registrada.

## get_units()
Archivo: `app/routes/unit_routes.py`
Obtiene todas las unidades registradas en la base de datos para mostrarlas en el sistema.
Parámetros:
* db: conexión con la base de datos.
* current_user: usuario autenticado.
Retorna:
* Una lista con todas las unidades registradas.

## get_unit()
Archivo: `app/routes/unit_routes.py`
Busca una unidad utilizando su identificador. Si existe, devuelve toda su información.
Parámetros:
* unit_id: identificador de la unidad.
* db: conexión con la base de datos.
* current_user: usuario autenticado.
Retorna:
* La información de la unidad encontrada.

## update_unit()
Archivo: `app/routes/unit_routes.py`
Actualiza la información de una unidad existente. Busca la unidad por su identificador, modifica los datos enviados y guarda los cambios en la base de datos.
Parámetros:
* unit_id: identificador de la unidad.
* unit: nueva información de la unidad.
* db: conexión con la base de datos.
* current_user: usuario autenticado con permisos de administrador.
Retorna:
* La unidad con la información actualizada.

## delete_unit()
Archivo: `app/routes/unit_routes.py`
Elimina una unidad registrada utilizando su identificador. Antes de eliminarla verifica que exista en la base de datos.
Parámetros:
* unit_id: identificador de la unidad.
* db: conexión con la base de datos.
* current_user: usuario autenticado con permisos de administrador.
Retorna:
* Un mensaje confirmando que la unidad fue eliminada correctamente.