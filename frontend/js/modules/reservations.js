let selectedRoute = null;
let selectedUnit = null;
let selectedSeat = null;

async function showReservations() {
    pageTitle.textContent = "Reservaciones";
    content.innerHTML = `
        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:15px;
        ">
            <h2>Reservaciones</h2>
        </div>
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
    await loadReservations();
}

async function openReservation(routeId) {
    pageTitle.textContent = "Nueva reservación";
    selectedRoute = null;
    selectedUnit = null;
    selectedSeat = null;
    content.innerHTML = `
        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:20px;
        ">
            <h2>Reservar boleto</h2>
            <button onclick="showRoutes()">
                Volver a rutas
            </button>
        </div>
        <div class="reservation-container">
            <div class="reservation-seat-section">
                <h3>Selecciona un asiento</h3>
                <div id="seatMap">
                    Cargando asientos...
                </div>
            </div>
            <div class="reservation-info-section">
                <h3>Información de la reservación</h3>
                <div id="reservationRouteInfo">
                    Cargando información de la ruta...
                </div>
                <hr>
                <label>Nombre del pasajero</label>
                <input
                    type="text"
                    id="passenger_name"
                    placeholder="Nombre del pasajero"
                >
                <input
                    type="hidden"
                    id="seat_number"
                >
                <button
                    onclick="saveReservation()"
                    style="width:100%; margin-top:10px;"
                >
                    Confirmar reservación
                </button>
            </div>
        </div>
    `;
    await loadRouteForReservation(routeId);
}

async function loadRouteForReservation(routeId) {
    try {
        const res = await fetch(
            `${API_URL}/routes/${routeId}`,
            {
                headers: authHeaders()
            }
        );
        if (!res.ok) {
            throw new Error("Ruta no encontrada");
        }
        const route = await res.json();
        selectedRoute = route;
        const routeInfo = document.getElementById("reservationRouteInfo");
        routeInfo.innerHTML = `
            <p>
                <strong>Origen:</strong>
                ${route.origin}
            </p>
            <p>
                <strong>Destino:</strong>
                ${route.destination}
            </p>
            <p>
                <strong>Salida:</strong>
                ${route.departure_time}
            </p>
            <p>
                <strong>Precio:</strong>
                $${route.price}
            </p>
            <p>
                <strong>Unidad:</strong>
                ${route.units_id}
            </p>
        `;
        await loadUnitByRoute(route.units_id);
    } catch (error) {
        console.error(error);
        alert("Error cargando la ruta");
        showRoutes();
    }
}

async function loadUnitByRoute(unitId) {
    if (!unitId) {
        alert("Esta ruta no tiene unidad asignada");
        return;
    }
    try {
        const res = await fetch(
            `${API_URL}/units/${unitId}`,
            {
                headers: authHeaders()
            }
        );
        if (!res.ok) {
            throw new Error("Unidad no encontrada");
        }
        const unit = await res.json();
        selectedUnit = unit;
        let occupied = [];
        if (selectedRoute?.id) {
            const seatsRes = await fetch( 
                `${API_URL}/reservations/route/${selectedRoute.id}/available-seats`,
                {
                    headers: authHeaders()
                }
            );
            if (seatsRes.ok) {
                const seatsData = await seatsRes.json();
                occupied = seatsData.taken_seats || [];
            }
        }
        renderSeatMap(unit, occupied);
    } catch (error) {
        console.error(error);
        alert("Error cargando unidad");
    }
}

function renderSeatMap(unit, takenSeats = []) {
    const container = document.getElementById("seatMap");
    const input = document.getElementById("seat_number");
    if (!container || !input) {
        return;
    }
    selectedSeat = null;
    input.value = "";
    const total = unit.seat_count;
    let html = `
        <h4>
            ${unit.type}
            -
            ${total} asientos
        </h4>
        <div class="${
            unit.type === "bus"
                ? "bus-layout"
                : "combi-layout"
        }">
    `;
    for (
        let i = 1;
        i <= total;
        i++
    ) {
        const seat = `A${i}`;
        const occupied = takenSeats.includes(seat);
        let position = "";
        if (unit.type === "bus") {
            const row =
                Math.floor((i - 1) / 4) + 1;
            const col =
                ((i - 1) % 4) + 1;
            const gridColumn =
                col <= 2
                    ? col
                    : col + 1;
            position = `
                grid-row:${row};
                grid-column:${gridColumn};
            `;
        }
        html += `
            <button
                type="button"
                class="seat ${
                    occupied
                        ? "occupied"
                        : ""
                }"
                ${
                    occupied
                        ? "disabled"
                        : ""
                }
                style="${position}"
                onclick="selectSeat(
                    '${seat}',
                    this
                )"
            >
                ${seat}
            </button>
        `;
    }
    html += `
        </div>
        <div style="
            margin-top:15px;
            font-size:14px;
        ">
            <span>
            </span>
            &nbsp;&nbsp;
            <span>
            </span>
        </div>
    `;
    container.innerHTML = html;
}

function selectSeat(seat,button) {
    document.querySelectorAll(".seat.selected").forEach(btn => {
            btn.classList.remove("selected");
        });
    selectedSeat = seat;
    const input = document.getElementById("seat_number");
    if (input) {
        input.value = seat;
    }
    button.classList.add("selected");
}

async function saveReservation() {
    const user = getCurrentUser();
    if (
        user.role !== "traveler" &&
        user.role !== "route_manager" &&
        user.role !== "company_admin"
    ) {
        alert("No tienes permisos para crear reservaciones");
        return;
    }
    if (!selectedRoute) {
        alert("No hay una ruta seleccionada");
        return;
    }
    if (!selectedSeat) {
        alert("Selecciona un asiento");
        return;
    }
    const passengerInput =document.getElementById("passenger_name");
    if (!passengerInput) {
        return;
    }
    const passenger_name = passengerInput.value.trim();
    if (!passenger_name) {
        alert("Ingresa el nombre del pasajero");
        passengerInput.focus();
        return;
    }
    const user_id = parseInt(user.sub);
    const payload = {
        passenger_name,
        seat_number: selectedSeat,
        user_id,
        route_id: parseInt(selectedRoute.id)
    };
    try {
        const res = await fetch(
            `${API_URL}/reservations/`,
            {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(payload)
            }
        );
        const data = await res
                .json()
                .catch(() => ({}));
        if (!res.ok) {
            alert(data.detail || "Error creando reservación");
            return;
        }
        alert("Reservación creada correctamente");
        showRoutes();
    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
}

async function loadReservations() {
    const tbody = document.querySelector("#reservationsTable tbody");
    if (!tbody) {
        return;
    }
    const user =
        getCurrentUser();
    let url = "";
    if (user.role === "traveler") {
        url = `${API_URL}/reservations/me`;
    }
    else {
        url = `${API_URL}/reservations/`;
    }
    try {
        const res = await fetch(
                url,
                {
                    headers: authHeaders()
                }
            );
        if (!res.ok) {
            throw new Error("Error cargando reservaciones");
        }
        const data = await res.json();
        const routesRes = await fetch(
                `${API_URL}/routes/`,
                {
                    headers:authHeaders()
                }
            );
        if (!routesRes.ok) {
            throw new Error("Error cargando rutas");
        }
        const routes = await routesRes.json();
        tbody.innerHTML = "";
        data.forEach(r => {
            const route =
                routes.find(
                    rt =>
                        rt.id ===
                        r.route_id
                );
            const routeName =
                route
                    ? `${route.origin} → ${route.destination}`
                    : "Desconocida";
            let actions = "";
            if (user.role === "traveler") {
                actions += `
                    <button onclick="deleteReservation(${r.id})">
                        Cancelar
                    </button>
                `;
                if (
                    r.status === "pending"
                ) {
                    actions += `
                        <button onclick="startPayment(${r.id})">
                            Pagar
                        </button>
                    `;
                }
            }
            if (user.role === "route_manager" || user.role === "company_admin") {
                if (r.status === "pending") {
                    actions += `
                        <button onclick="confirmCashPayment(${r.id})">
                            Confirmar efectivo
                        </button>
                    `;
                }
                actions += `
                    <button onclick="deleteReservation(${r.id})">
                        Eliminar
                    </button>
                `;
            }
            tbody.innerHTML += `
                <tr>
                    <td>${r.passenger_name}</td>
                    <td>${r.seat_number}</td>
                    <td>${r.user_id}</td>
                    <td>${routeName}</td>
                    <td>${r.status}</td>
                    <td>${actions}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
        alert(
            "Error cargando reservaciones"
        );
    }
}

async function confirmCashPayment(id) {
    if (
        !confirm("¿Confirmar pago en efectivo?")
    ) {
        return;
    }
    try {
        const res = await fetch(`${API_URL}/payments/confirm/${id}`,
                {
                    method: "POST",
                    headers: authHeaders()
                }
            );
        const data = await res.json();
        if (!res.ok) {
            alert(data.detail ||"Error confirmando pago");
            return;
        }
        alert("Pago confirmado");
        loadReservations();
    } catch (error) {
        console.error(error);
        alert(
            "Error de conexión"
        );
    }
}

async function deleteReservation(id) {
    if (
        !confirm("¿Eliminar esta reservación?")
    ) {
        return;
    }
    try {
        const res = await fetch(`${API_URL}/reservations/${id}`,
                {
                    method: "DELETE",
                    headers: authHeaders()
                }
            );
        if (!res.ok) {
            alert("Error eliminando reservación");
            return;
        }
        loadReservations();
    } catch (error) {
        console.error(error);
        alert(
            "Error de conexión"
        );
    }
}

async function startPayment(
    reservation_id
) {
    const user =
        getCurrentUser();
    if (
        user.role !== "traveler"
    ) {
        return;
    }
    try {
        const res =
            await fetch(
                `${API_URL}/payments/create/${reservation_id}`,
                {
                    method: "POST",
                    headers: authHeaders()
                }
            );
        const data = await res.json();
        if (!res.ok) {
            alert( data.detail || "Error creando pago");
            return;
        }
        localStorage.setItem( "paypal_order_id", data.order_id);
        localStorage.setItem( "paypal_reservation_id", reservation_id);
        window.location.href = data.approval_url;
    } catch (error) {
        console.error(error);
        alert(
            "Error de conexión"
        );
    }
}

window.openReservation = openReservation;
window.selectSeat = selectSeat;
window.saveReservation = saveReservation;
window.confirmCashPayment = confirmCashPayment;
window.deleteReservation = deleteReservation;
window.startPayment = startPayment;