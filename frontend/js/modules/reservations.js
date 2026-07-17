let selectedRoute = null;
let selectedUnit = null;
let selectedSeat = null;
let occupiedSeats = [];
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
        <br>
        <input
            type="text"
            id="passenger_name"
            placeholder="Nombre del pasajero"
            style="width:300px; padding:8px;"
        >
        <input type="hidden" id="seat_number">
        <br><br>
        <button onclick="saveReservation()" style="margin-top:20px;">
            Confirmar reservación
        </button>
        <hr>
        <table id="reservationsTable">
            <thead>
                <tr>
                    <th>Pasajero</th>
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
    if (!unitId) {
        alert("Esta ruta no tiene unidad asignada");
        return;
    }
    try {
        // obtiene la unidad
        const res = await fetch(`${API_URL}/units/${unitId}`, {
            headers: authHeaders()
        });
        const unit = await res.json();
        selectedUnit = unit;
        // obtiene los asientos ocupados de la ruta actual
        let takenSeats = [];
        if (selectedRoute?.id) {
            const seatsRes = await fetch(
                `${API_URL}/reservations/route/${selectedRoute.id}/available-seats`,
                {
                    headers: authHeaders()
                }
            );
            const seatsData = await seatsRes.json();
            takenSeats = seatsData.taken_seats || [];
        }
        // renderiza el mapa con asientos ocupados
        renderSeatMap(unit, takenSeats);
    } catch (error) {
        console.error(error);
        alert("Error cargando unidad");

    }
}
// renderiza el mapa de asientos de la unidad seleccionada
function renderSeatMap(unit, takenSeats = []) {
    const container = document.getElementById("seatMap");
    const input = document.getElementById("seat_number");
    selectedSeat = null;
    input.value = "";
    const total = unit.seat_count ?? (unit.type === "bus" ? 40 : 12);
    let html = `
        <h3>Selecciona un asiento (${unit.type})</h3>

        <div class="${unit.type === "bus" ? "bus-layout" : "combi-layout"}">
    `;
    for (let i = 1; i <= total; i++) {
        const seat = `A${i}`;
        const occupied = takenSeats.includes(seat);
        let position = "";
        if (unit.type === "bus") {
            const row = Math.floor((i - 1) / 4) + 1;
            const col = ((i - 1) % 4) + 1;
            // deja espacio en la columna del pasillo
            const gridColumn = col <= 2 ? col : col + 1;
            position = `grid-row:${row}; grid-column:${gridColumn};`;
        }
        html += `
            <button 
                type="button"
                class="seat ${occupied ? "occupied" : ""}"
                ${occupied ? "disabled" : ""}
                style="${position}"
                onclick="selectSeat('${seat}', this)">
                ${seat}
            </button>
        `;
    }
    html += `
        </div>
    `;
    container.innerHTML = html;
}

function selectSeat(seat, button) {
    // quitar selección anterior
    document.querySelectorAll(".seat.selected")
        .forEach(btn => btn.classList.remove("selected"));

    selectedSeat = seat;
    document.getElementById("seat_number").value = seat;
    button.classList.add("selected");
}
// guarda la reservación en la API
async function saveReservation() {
    const user = getCurrentUser();
    const passenger_name = document.getElementById("passenger_name").value.trim();
    const seat_number = selectedSeat || document.getElementById("seat_number").value;
    const route_id = document.getElementById("route_id").value;
    let user_id;
    if (user.role === "client") {
        user_id = parseInt(user.sub);
    } else {
        user_id = parseInt(prompt("ID del usuario"));
    }
    // valida que se hayan seleccionado todos los datos necesarios (improbable que falte alguno)
    if (!passenger_name || !seat_number || !route_id || !user_id) {
        alert("Completa todos los campos");
        return;
    }
    // crea el payload para enviar a la API
    const payload = {
        passenger_name,
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
                    <td>${r.passenger_name}</td>
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