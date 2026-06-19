let editingReservationId = null;
//muestra las reservaciones
async function showReservations() {
    //titulo de la pagina
    pageTitle.textContent = "Reservaciones";
        //cambios que tuve que hacer o si no no se podia ver desde la vista cliente
    const user = getCurrentUser();
    const isClient = user.role === "client";
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2>Reservaciones</h2>
            ${!isClient ? `
                <button onclick="openReservationModal()">
                    Nueva reservación
                </button>
            ` : ``}
        </div>
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
        <!-- Ventana solo si son Administradores o empleados -->
        ${!isClient ? `
        <div id="reservationModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.5); justify-content:center; align-items:center;">
            <div style="background:white; padding:20px; border-radius:10px; width:320px;">
                <h3 id="reservationModalTitle">Reservación</h3>
                <input id="seat_number" placeholder="Número de asiento">
                <input id="user_id" placeholder="ID Usuario" type="number">
                <input id="route_id" placeholder="ID Ruta" type="number">
                <br><br>
                <!--botones para guardar y cancelar una reservacion-->
                <button onclick="saveReservation()">Guardar</button>
                <button onclick="closeReservationModal()">Cancelar</button>
            </div>
        </div>
        ` : ``}
    `;

    loadReservations();
}

//lista y muestra las reservaciones
async function loadReservations() {
    const tbody = document.querySelector("#reservationsTable tbody");
    const user = getCurrentUser();
    //llama a la API, si es un cliente usa /reservations/me si no solo usa /reservations/
    try {

        const url = user.role === "client"
        //evita que los clientes vean las reservaciones de los demas clientes
            ? `${API_URL}/reservations/me`
            //muestra todas las reservaciones, solo lo ven admin y empleado
            : `${API_URL}/reservations/`;
        const res = await fetch(url, {
            headers: authHeaders()
        });
        const data = await res.json();
        tbody.innerHTML = "";
        data.forEach(r => {
            tbody.innerHTML += `
                <tr>
                    <td>${r.id}</td>
                    <td>${r.seat_number}</td>
                    <td>${r.user_id ?? "me"}</td>
                    <td>${r.route_id}</td>
                    <td>${r.status || "pending"}</td>
                    <td>
                        <!-- boton para editar reservacion -->
                        ${user.role !== "client" ? `
                            <button onclick="editReservation(${r.id}, '${r.seat_number}', ${r.user_id}, ${r.route_id})">
                                Editar
                            </button>
                            <!--boton para eliminar reservacion-->
                            <button onclick="deleteReservation(${r.id})">
                                Eliminar
                            </button>
                        ` : ``}
                        <!-- boton para pagar, automaticamente despues del pago, se confirma la reservacion -->
                        ${r.status === "pending" ? `
                            <button onclick="payReservation(${r.id})">
                                Pagar
                            </button>
                        ` : `
                            <span style="color:green;">Pagado</span>
                        `}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        //si no logra conectar con la API, se muestra una alerta y error
        console.error(error);
        alert("Error cargando reservaciones");
    }
}
//pago de paypal (sandbox)
async function payReservation(reservation_id) {
    //manda a llamar a la API
    try {
        const res = await fetch(`${API_URL}/payments/create/${reservation_id}`, {
            method: "POST",
            headers: authHeaders()
        });
        const data = await res.json();
        // si no logra conectar se mostrara una alerta y error
        if (!res.ok) {
            alert("Error creando pago");
            return;
        }
        //los datos se guardan de manera local aun
        localStorage.setItem("paypal_order_id", data.order_id);
        localStorage.setItem("paypal_reservation_id", reservation_id);
        //redireccion a ventana de aprovacion de datos
        window.location.href = data.approval_url;
    // si no se logra concretar el pago se mostrara un error y alerta
    } catch (error) {
        console.error(error);
        alert("Error en pago");
    }
}

//ventana de reservacion
function openReservationModal() {
    editingReservationId = null;
    document.getElementById("reservationModalTitle").textContent = "Nueva reservación";
    document.getElementById("seat_number").value = "";
    document.getElementById("user_id").value = "";
    document.getElementById("route_id").value = "";
    document.getElementById("reservationModal").style.display = "flex";
}
function closeReservationModal() {
    document.getElementById("reservationModal").style.display = "none";
}

//crear o editar una reservacion
async function saveReservation() {
    //datos necesarios para la creacion de una ruta
    const seat_number = document.getElementById("seat_number").value;
    const user_id = document.getElementById("user_id").value;
    const route_id = document.getElementById("route_id").value;
    // si no se llenan los datos necesarios no se creara la reservacion y se mostrara una alerta y error
    if (!seat_number || !user_id || !route_id) {
        alert("Completa todos los campos");
        return;
    }
    const payload = {
        seat_number,
        user_id: parseInt(user_id),
        route_id: parseInt(route_id)
    };
    //llama a la API
    let url = `${API_URL}/reservations/`;
    let method = "POST";
    if (editingReservationId) {
        url = `${API_URL}/reservations/${editingReservationId}`;
        method = "PUT";
    }
    const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    //si no se logra conectar se mostrara una alerta y dara error
    if (!res.ok) {
        alert("Error guardando reservación");
        return;
    }
    closeReservationModal();
    loadReservations();
}
//editar una reservacion
function editReservation(id, seat, user, route) {
    editingReservationId = id;
    document.getElementById("reservationModalTitle").textContent = "Editar reservación";
    document.getElementById("seat_number").value = seat;
    document.getElementById("user_id").value = user;
    document.getElementById("route_id").value = route;
    document.getElementById("reservationModal").style.display = "flex";
}
//borrar una reservacion 
async function deleteReservation(id) {
    //mensaje de confirmacion
    if (!confirm("¿Eliminar esta reservación?")) return;
    //conecta a la API
    const res = await fetch(`${API_URL}/reservations/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });
    //si no se conecta se mostrar una alerta y dara error
    if (!res.ok) {
        alert("Error eliminando reservación");
        return;
    }
    loadReservations();
}