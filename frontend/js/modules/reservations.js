let selectedRoute = null;
let selectedUnit = null;
let selectedSeat = null;
// carga las rutas para el select de reservaciones
async function showReservations() {
    pageTitle.textContent = "Reservaciones";
    // muestra el contenido de reservaciones
    content.innerHTML = `
        <h2>Reservaciones</h2>
        <div style="margin-bottom:15px;">
            <h3>Selecciona una ruta</h3>
            <select id="route_id" onchange="onRouteChange()">
                <option value="">Cargando rutas...</option>
            </select>
        </div>
        <div id="seatMap" style="margin-top:20px;"></div>
        <input type="hidden" id="seat_number">
        <button onclick="saveReservation()" style="margin-top:20px;">
            Confirmar reservación
        </button>
        <hr>
        <table id="reservationsTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Asiento</th>
                    <th>Usuario</th>
                    <th>Ruta</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    // carga las rutas para el select y las reservaciones en la tabla
    await loadRoutesForSelect();
    await loadReservations();
}
// carga las rutas para el select de reservaciones
async function loadRoutesForSelect() {
    const select = document.getElementById("route_id");
    if (!select) return;
    // obtiene las rutas desde la API
    const res = await fetch(`${API_URL}/routes/`, {
        headers: authHeaders()
    });
    const data = await res.json();
    // limpia el select y agrega las rutas obtenidas
    select.innerHTML = `<option value="">Selecciona una ruta</option>`;
    data.forEach(r => {
        select.innerHTML += `
            <option value="${r.id}">
                ${r.origin} → ${r.destination}
            </option>
        `;
    });
}
// maneja el cambio de ruta seleccionada, carga la unidad y el mapa de asientos
async function onRouteChange() {
    const routeId = document.getElementById("route_id").value;
    // si no hay ruta seleccionada, limpia la unidad y el mapa de asientos (infuncional aun)
    if (!routeId) return;
    // obtiene la ruta seleccionada desde la API
    try {
        const resRoute = await fetch(`${API_URL}/routes/${routeId}`, {
            headers: authHeaders()
        });
        // si la ruta no existe, muestra un error
        const route = await resRoute.json();
        selectedRoute = route;
        await loadUnitByRoute(route.units_id);
    // si la ruta no tiene unidad asignada, muestra un mensaje
    } catch (error) {
        console.error(error);
        alert("Error cargando ruta");
    }
}
// carga la unidad de la ruta seleccionada y renderiza el mapa de asientos
async function loadUnitByRoute(unitId) {
    // si la ruta no tiene unidad asignada, muestra un mensaje y no hace nada
    if (!unitId) {
        alert("Esta ruta no tiene unidad asignada");
        return;
    }
    // obtiene la unidad desde la API y renderiza el mapa de asientos
    try {
        const res = await fetch(`${API_URL}/units/${unitId}`, {
            headers: authHeaders()
        });
        // si la unidad no existe, muestra un error
        const unit = await res.json();
        selectedUnit = unit;
        renderSeatMap(unit);
    } catch (error) {
        // si hay un error cargando la unidad, muestra un mensaje de error
        console.error(error);
        alert("Error cargando unidad");
    }
}
// renderiza el mapa de asientos de la unidad seleccionada
function renderSeatMap(unit) {
    const container = document.getElementById("seatMap");
    const input = document.getElementById("seat_number");
    selectedSeat = null;
    input.value = "";
    //Si la unidad es un bus muestra 40 asientos, si es una combi muestra 12
    const total = unit.seat_count ?? (unit.type === "bus" ? 40 : 12);
    // genera el HTML del mapa de asientos con botones para cada asiento
    let html = `
        <h3>Selecciona un asiento (${unit.type})</h3>
        <div style="
            display:grid;
            grid-template-columns:repeat(4,60px);
            gap:8px;
            max-width:260px;
        ">
    `;
    for (let i = 1; i <= total; i++) {
        html += `
            <button type="button"
                onclick="selectSeat('A${i}')"
                style="padding:10px;">
                A${i}
            </button>
        `;
    }
    html += `</div>`;
    container.innerHTML = html;
}
// selecciona un asiento y lo guarda en la variable selectedSeat y en el input oculto
function selectSeat(seat) {
    selectedSeat = seat;
    document.getElementById("seat_number").value = seat;
}
// guarda la reservación en la API
async function saveReservation() {
    const user = getCurrentUser();
    const seat_number = selectedSeat || document.getElementById("seat_number").value;
    const route_id = document.getElementById("route_id").value;
    let user_id;
    if (user.role === "client") {
        user_id = parseInt(user.sub);
    } else {
        user_id = parseInt(prompt("ID del usuario"));
    }
    // valida que se hayan seleccionado todos los datos necesarios (improbable que falte alguno)
    if (!seat_number || !route_id || !user_id) {
        alert("Faltan datos");
        return;
    }
    // crea el payload para enviar a la API
    const payload = {
        seat_number,
        user_id,
        route_id: parseInt(route_id)
    };
    // envía la solicitud POST a la API para crear la reservación
    try {
        const res = await fetch(`${API_URL}/reservations/`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            alert(data.detail || "Error guardando reservación");
            return;
        }
        // si todo sale bien, mostrar una alerta de reservacion creada
        alert("Reservación creada");
        showReservations();
        // si no conecta con la API, muestra un error de conexión
    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
}
// carga las reservaciones del usuario actual o de todos los usuarios si es admin
async function loadReservations() {
    const tbody = document.querySelector("#reservationsTable tbody");
    // si no existe la tabla de reservaciones, muestra un error y retorna (improbable que pase, pero por si acaso)
    if (!tbody) {
        console.error("No existe tabla de reservaciones");
        return;
    }
    // obtiene el usuario actual desde el token decodificado
    let user;
    try {
        user = getCurrentUser();
    } catch (e) {
        console.error("Error decodificando usuario:", e);
        user = null;
    }

    const role = user?.role || "client";
    // el usuario cliente solo ve sus propias reservaciones, el admin ve todas
    try {
        const url = role === "client"
            ? `${API_URL}/reservations/me`
            : `${API_URL}/reservations/`;

        const res = await fetch(url, {
            headers: authHeaders()
        });
        // si algo falla mostrara error
        if (!res.ok) {
            console.error("HTTP error:", res.status);
            tbody.innerHTML = `<tr><td colspan="6">Error cargando reservaciones</td></tr>`;
            return;
        }
        const data = await res.json();
        // si la respuesta no es un array, muestra un error y retorna
        if (!Array.isArray(data)) {
            console.error("Respuesta inválida:", data);
            return;
        }
        tbody.innerHTML = "";
        data.forEach(r => {
            // si el usuario es cliente, solo muestra sus reservaciones, solo puede cancelar y eliminar su reservacion, cencelar antes de pagar y eliminar despues de pagar (aun no hay reembolso)
            const acciones = role === "client"
                ? `<button onclick="deleteReservation(${r.id})">Cancelar</button>`
                : `<button onclick="deleteReservation(${r.id})">Eliminar</button>`;
            // si el cliente tiene su reservacion en pendiente, mostrara le boton de pagar y se redirigira
            const payBtn = role === "client"
                ? (r.status === "pending"
                    ? `<button onclick="startPayment(${r.id})">Pagar</button>`
                    : `<span style="color:green;">Pagado</span>`)
                : "";
            // muestra el contenedor con los datos de la reservacion
            tbody.innerHTML += `
                <tr>
                    <td>${r.id}</td>
                    <td>${r.seat_number}</td>
                    <td>${r.user_id ?? "-"}</td>
                    <td>${r.route_id ?? "-"}</td>
                    <td>${r.status ?? "pending"}</td>
                    <td>${acciones} ${payBtn}</td>
                </tr>
            `;
        });
        //si hay algun error, cargara un mensaje de error y no se mostrara nada
    } catch (error) {
        console.error("Error loadReservations:", error);
    }
}
// borra una reservacion, si es un cliente solo es la suya, si es admin puede borrar cualquiera 
async function deleteReservation(id) {
    // confirma que el usuario quiere eliminar la reservacion
    if (!confirm("¿Eliminar esta reservación?")) return;
    try {
        // envia la solicitud DELETE a la API para eliminar la reservacion
        const res = await fetch(`${API_URL}/reservations/${id}`, {
            method: "DELETE",
            headers: authHeaders()
        });
        // Si no conecta con API o la API no confirma mostrara un error
        if (!res.ok) {
            alert("Error eliminando");
            return;
        }
        // si todo sale bien, recarga la lista de reservaciones
        loadReservations();
    } catch (error) {
        console.error(error);
    }
}
// inicia el proceso de pago de una reservacion, redirige a la apgina de paypal
async function startPayment(reservation_id) {
    const user = getCurrentUser();
    // si el usuario no es cliente, no puede pagar
    if (user.role !== "client") return;
    // envia la solicitud POST a la API para crear el pago y obtener la URL de aprobación de PayPal
    try {
        const res = await fetch(`${API_URL}/payments/create/${reservation_id}`, {
            method: "POST",
            headers: authHeaders()
        });
        // si no conecta con la API, muestra un error
        const data = await res.json();
        if (!res.ok) {
            alert("Error creando pago");
            return;
        }
        // guarda el ID del pedido para despues verificar el pago
        localStorage.setItem("paypal_order_id", data.order_id);
        localStorage.setItem("paypal_reservation_id", reservation_id);
        window.location.href = data.approval_url;
    } catch (error) {
        console.error(error);
    }
}