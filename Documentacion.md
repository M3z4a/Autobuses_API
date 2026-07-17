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

# Api.js
## setToken(token)
Archivo: `frontend/api.js`
Guarda el token JWT generado después de que el usuario inicia sesión correctamente. El token se almacena en el `localStorage` para poder utilizarlo en las solicitudes que requieren autenticación.
Parámetros:
* token: token JWT generado por el backend.
Retorna:
* No retorna ningún valor.

## getToken()
Archivo: `frontend/api.js`
Obtiene el token JWT almacenado en el navegador para utilizarlo en las peticiones autenticadas.
Parámetros:
* No recibe parámetros.
Retorna:
* El token almacenado o `null` si no existe.

## removeToken()
Archivo: `frontend/api.js`
Elimina el token JWT almacenado en el navegador. Se utiliza cuando el usuario cierra sesión para evitar que la sesión continúe activa.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## authHeaders()
Archivo: `frontend/api.js`
Genera los encabezados necesarios para realizar solicitudes autenticadas a la API. Agrega el token JWT en el encabezado `Authorization` utilizando el formato **Bearer**.
Parámetros:
* No recibe parámetros.
Retorna:
* Un objeto con los encabezados necesarios para las peticiones autenticadas.

## parseJwt(token)
Archivo: `frontend/api.js`
Decodifica el contenido de un token JWT para obtener la información almacenada en él, como el identificador del usuario o su rol. Si el token es inválido, devuelve `null`.
Parámetros:
* token: token JWT que será decodificado.
Retorna:
* Un objeto con la información del token o `null` si ocurre un error.

## getCurrentUser()
Archivo: `frontend/api.js`
Obtiene la información del usuario autenticado utilizando el token almacenado en el navegador.
Parámetros:
* No recibe parámetros.
Retorna:
* Un objeto con la información del usuario autenticado.

## getUserRole()
Archivo: `frontend/api.js`
Obtiene el rol del usuario autenticado a partir de la información contenida en el token JWT.
Parámetros:
* No recibe parámetros.
Retorna:
* El rol del usuario o `null` si no existe un usuario autenticado.

## requireAuth()
Archivo: `frontend/api.js`
Verifica que exista un token de autenticación antes de permitir el acceso a una página protegida. Si no existe un token válido, redirige al usuario al inicio de sesión.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## logout()
Archivo: `frontend/api.js`
Cierra la sesión del usuario eliminando el token almacenado y redirigiendo nuevamente a la pantalla de inicio de sesión.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

# Auth.js
## login()
Archivo: `frontend/auth.js`
Realiza el proceso de autenticación del usuario. Obtiene las credenciales ingresadas, las envía al backend y, si son correctas, guarda el token recibido para permitir el acceso al sistema.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

# Dashboard.js
## createMenuButton
Archivo: `frontend/dashboard.js`
Crea un botón dentro del menú lateral del dashboard y le asigna la función que se ejecutará cuando el usuario haga clic sobre él.
Parámetros:
* text: texto que se mostrará en el botón.
* callback: función que se ejecutará al hacer clic en el botón.
Retorna:
* No retorna ningún valor.

## showAdminDashboard()
Archivo: `frontend/dashboard.js`
Carga la vista principal del dashboard para los usuarios con rol de administrador.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## showEmployeeDashboard()
Archivo: `frontend/dashboard.js`
Carga la vista principal del dashboard para los usuarios con rol de empleado.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## showClientDashboard()
Archivo: `frontend/dashboard.js`
Carga la vista principal del dashboard para los usuarios con rol de cliente.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

# Companies.js
## showCompanies()
Archivo: `frontend/js/modules/companies.js`
Muestra la sección de administración de empresas dentro del dashboard. Además de generar la estructura de la vista, prepara la tabla y el formulario necesarios para administrar los registros y posteriormente llama a la función encargada de cargar las empresas existentes.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## loadCompanies()
Archivo: `frontend/js/modules/companies.js`
Obtiene desde la API la lista de empresas registradas y actualiza la tabla mostrada en el dashboard. También genera las acciones disponibles para editar o eliminar cada empresa.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## openCompanyModal()
Archivo: `frontend/js/modules/companies.js`
Abre la ventana modal utilizada para registrar una nueva empresa o editar una existente. Además, prepara el formulario para que el usuario pueda ingresar la información correspondiente.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## closeCompanyModal()
Archivo: `frontend/js/modules/companies.js`
Cierra la ventana modal utilizada para registrar o editar empresas y limpia la información temporal del formulario.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## saveCompany()
Archivo: `frontend/js/modules/companies.js`
Obtiene los datos capturados en el formulario y los envía al backend para crear una nueva empresa o actualizar una existente, dependiendo del modo en que se encuentre el formulario. Una vez completada la operación, actualiza la tabla de empresas.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## editCompany()
Archivo: `frontend/js/modules/companies.js`
Recupera la información de una empresa seleccionada y la carga en el formulario de edición para que el usuario pueda modificar sus datos.
Parámetros:
* Recibe el identificador de la empresa que será editada.
Retorna:
* No retorna ningún valor.

## deleteCompany()
Archivo: `frontend/js/modules/companies.js`
Elimina una empresa registrada mediante su identificador. Antes de realizar la eliminación solicita una confirmación al usuario y, al finalizar, actualiza la lista de empresas mostrada en el dashboard.
Parámetros:
* Recibe el identificador de la empresa que será eliminada.
Retorna:
* No retorna ningún valor.

# Routes.js
## showRoutes()
Archivo: `frontend/js/modules/routes.js`
Muestra la sección destinada a la administración de rutas dentro del dashboard. Genera la interfaz correspondiente y posteriormente carga la información de las rutas registradas.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## loadRoutes()
Archivo: `frontend/js/modules/routes.js`
Obtiene desde la API todas las rutas registradas y llena la tabla correspondiente. También agrega las acciones para editar o eliminar cada una de ellas.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## openRouteModal()
Archivo: `frontend/js/modules/routes.js`
Abre la ventana modal utilizada para registrar una nueva ruta o modificar una ya existente.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## closeRouteModal()
**Archivo:** `frontend/js/modules/routes.js`
Cierra la ventana modal de rutas y limpia la información capturada en el formulario.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## saveRoute()
Archivo: `frontend/js/modules/routes.js`
Obtiene la información ingresada en el formulario y la envía al backend para crear una nueva ruta o actualizar una existente. Al finalizar la operación, actualiza automáticamente la lista de rutas.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## editRoute()
Archivo: `frontend/js/modules/routes.js`
Carga la información de una ruta seleccionada dentro del formulario para que el usuario pueda modificar sus datos.
Parámetros:
* Recibe el identificador de la ruta que será editada.
Retorna:
* No retorna ningún valor.

## deleteRoute()
Archivo: `frontend/js/modules/routes.js`
Elimina una ruta registrada utilizando su identificador. Antes de hacerlo solicita una confirmación al usuario y, una vez eliminada, actualiza la tabla de rutas.
Parámetros:
* Recibe el identificador de la ruta que será eliminada.
Retorna:
* No retorna ningún valor.

# RSeservations.js
## showReservations()
Archivo: `frontend/js/modules/reservations.js`
Muestra la sección de reservaciones dentro del dashboard. Genera la interfaz necesaria para crear nuevas reservaciones, visualizar los asientos disponibles y consultar las reservaciones registradas.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## loadRoutesForSelect()
Archivo: `frontend/js/modules/reservations.js`
Obtiene desde la API las rutas disponibles y llena el selector de rutas que utiliza el formulario de reservaciones.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## onRouteChange()
Archivo: `frontend/js/modules/reservations.js`
Se ejecuta cuando el usuario selecciona una ruta diferente. Actualiza la información relacionada con la ruta seleccionada y carga los datos necesarios para mostrar los asientos correspondientes.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## loadUnitByRoute()
Archivo: `frontend/js/modules/reservations.js`
Obtiene la unidad asignada a una ruta específica para conocer la cantidad de asientos disponibles y generar correctamente el mapa de asientos.
Parámetros:
* Recibe el identificador de la ruta seleccionada.
Retorna:
* No retorna ningún valor.

## renderSeatMap()
Archivo: `frontend/js/modules/reservations.js`
Genera de manera dinámica el mapa de asientos de la unidad. Además, marca cuáles están disponibles, ocupados o seleccionados para facilitar el proceso de reservación.
Parámetros:
* Recibe la información de la unidad y los asientos ocupados.
Retorna:
* No retorna ningún valor.

## selectSeat()
Archivo: `frontend/js/modules/reservations.js`
Permite seleccionar o deseleccionar un asiento dentro del mapa generado. También actualiza visualmente el asiento elegido para indicar cuál será reservado.
Parámetros:
* Recibe el asiento seleccionado.
Retorna:
* No retorna ningún valor.

## saveReservation()
Archivo: `frontend/js/modules/reservations.js`
Obtiene la información capturada en el formulario y la envía al backend para registrar una nueva reservación. Si el proceso finaliza correctamente, actualiza la lista de reservaciones y el estado de los asientos.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## loadReservations()
Archivo: `frontend/js/modules/reservations.js`
Obtiene todas las reservaciones registradas y las muestra en la tabla correspondiente dentro del dashboard.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## deleteReservation()
Archivo: `frontend/js/modules/reservations.js`
Elimina una reservación utilizando su identificador. Antes de realizar la operación solicita una confirmación al usuario y posteriormente actualiza la tabla de reservaciones.
Parámetros:
* Recibe el identificador de la reservación.
Retorna:
* No retorna ningún valor.

## startPayment()
Archivo: `frontend/js/modules/reservations.js`
Inicia el proceso de pago de una reservación enviando la información correspondiente al módulo de pagos para completar la operación.
Parámetros:
* Recibe el identificador de la reservación.
Retorna:
* No retorna ningún valor.

# Units.js
## showUnits()
Archivo: `frontend/js/modules/units.js`
Muestra la sección de administración de unidades dentro del dashboard. Además, genera la interfaz para registrar, editar y consultar las unidades existentes.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## loadUnits()
Archivo: `frontend/js/modules/units.js`
Obtiene desde la API todas las unidades registradas y actualiza la tabla mostrada en el dashboard.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## openUnitModal()
Archivo: `frontend/js/modules/units.js`
Abre la ventana modal utilizada para registrar una nueva unidad o editar una existente.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## closeUnitModal()
Archivo: `frontend/js/modules/units.js`
Cierra la ventana modal de unidades y limpia la información capturada en el formulario.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## saveUnit()
Archivo: `frontend/js/modules/units.js`
Obtiene la información ingresada por el usuario y la envía al backend para registrar una nueva unidad o actualizar una existente. Al finalizar, actualiza la lista de unidades.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

## editUnit()
Archivo: `frontend/js/modules/units.js`
Carga la información de una unidad seleccionada en el formulario para permitir su edición.
Parámetros:
* Recibe el identificador de la unidad.
Retorna:
* No retorna ningún valor.

## deleteUnit()
Archivo: `frontend/js/modules/units.js`
Elimina una unidad registrada utilizando su identificador. Una vez completada la operación, actualiza la tabla de unidades mostrada en el dashboard.
Parámetros:
* Recibe el identificador de la unidad.
Retorna:
* No retorna ningún valor.

# Users.js
## showUsers()
Archivo: `frontend/js/modules/users.js`
Muestra la sección de usuarios dentro del dashboard. Además de actualizar el título de la página, genera la tabla donde se muestran los usuarios registrados y realiza una petición a la API para obtener la información. Si la consulta es exitosa, llena la tabla con el identificador, nombre, correo electrónico y rol de cada usuario. En caso de ocurrir un error durante la consulta, muestra un mensaje indicando que no fue posible cargar los usuarios.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.

# Payments.js
## showPayments()
Archivo: `frontend/js/modules/payments.js`
Muestra la sección de pagos dentro del dashboard. Actualiza el título de la página, genera la tabla donde se muestran los pagos confirmados y realiza una petición a la API para obtener la información registrada. Si la consulta se realiza correctamente, llena la tabla con el identificador de la reservación, el usuario, la ruta, el asiento y el estado del pago. Si ocurre un error al consultar la API, muestra un mensaje indicando que no fue posible cargar los pagos.
Parámetros:
* No recibe parámetros.
Retorna:
* No retorna ningún valor.
