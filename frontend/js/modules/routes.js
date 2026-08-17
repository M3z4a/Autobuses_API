let editingRouteId = null;

async function showRoutes() {
    const user = getCurrentUser();
    pageTitle.textContent = "Rutas";
    const canManage = ["route_manager"].includes(user.role);
    const newButton = canManage
        ? `<button onclick="openRouteModal()">Nueva ruta</button>`
        : "";
    content.innerHTML = `
        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:15px;
        ">
            <h2>Rutas</h2>
            ${newButton}
        </div>
        <table id="routesTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Salida</th>
                    <th>Precio</th>
                    <th>Empresa</th>
                    <th>Unidad</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <div
            id="routeModal"
            style="
                display:none;
                position:fixed;
                top:0;
                left:0;
                width:100%;
                height:100%;
                background:rgba(0,0,0,.5);
                justify-content:center;
                align-items:center;
            "
        >
            <div style="
                background:white;
                padding:20px;
                border-radius:10px;
                width:320px;
            ">
                <h3 id="routeModalTitle">Ruta</h3>
                <input
                    id="origin"
                    placeholder="Origen"
                >
                <input
                    id="destination"
                    placeholder="Destino"
                >
                <input
                    id="departure_time"
                    placeholder="Hora de salida"
                >
                <input
                    id="price"
                    placeholder="Precio"
                    type="number"
                >
                <input
                    id="units_id"
                    placeholder="ID Unidad"
                    type="number"
                >
                <br><br>
                <button onclick="saveRoute()">
                    Guardar
                </button>
                <button onclick="closeRouteModal()">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    loadRoutes();
}

async function loadRoutes() {
    const user = getCurrentUser();
    const tbody = document.querySelector("#routesTable tbody");
    try {
        const res = await fetch(`${API_URL}/routes/`, {
            headers: authHeaders()
        });
        if (!res.ok) {
            throw new Error("Error cargando rutas");
        }
        const data = await res.json();
        tbody.innerHTML = "";
        data.forEach(r => {
            let acciones = "";

            if (
                user.role === "traveler" ||
                user.role === "route_manager" ||
                user.role === "company_admin"
            ) {
                acciones += `
                    <button
                        onclick="openReservation(${r.id})"
                    >
                        Reservar
                    </button>
                `;
            }
            if (user.role === "route_manager") {
                acciones += `
                    <button
                        onclick="editRoute(
                            ${r.id},
                            '${r.origin}',
                            '${r.destination}',
                            '${r.departure_time}',
                            ${r.price},
                            ${r.units_id}
                        )"
                    >
                        Editar
                    </button>
                `;
            }
            if (user.role === "company_admin") {
                acciones += `
                    <button
                        onclick="deleteRoute(${r.id})"
                    >
                        Borrar
                    </button>
                `;
            }
            if (!acciones) {
                acciones = "Solo lectura";
            }
            tbody.innerHTML += `
                <tr>
                    <td>${r.id}</td>
                    <td>${r.origin}</td>
                    <td>${r.destination}</td>
                    <td>${r.departure_time}</td>
                    <td>$${r.price}</td>
                    <td>${r.company.name}</td>
                    <td>${r.units_id}</td>
                    <td>${acciones}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
        alert("Error cargando rutas");
    }
}

function openRouteModal() {
    editingRouteId = null;
    document.getElementById("routeModalTitle").textContent = "Nueva ruta";
    document.getElementById("origin").value = "";
    document.getElementById("destination").value = "";
    document.getElementById("departure_time").value = "";
    document.getElementById("price").value = "";
    document.getElementById("units_id").value = "";
    document.getElementById("routeModal").style.display = "flex";
}

function closeRouteModal() {
    document.getElementById("routeModal").style.display = "none";
}

async function saveRoute() {
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const departure_time = document.getElementById("departure_time").value;
    const price = document.getElementById("price").value;
    const units_id = document.getElementById("units_id").value;
    if (!origin || !destination || !departure_time || !price || !units_id) 
    {
        alert("Completa todos los campos");
        return;
    }
    const payload = {
        origin,
        destination,
        departure_time,
        price: parseInt(price),
        units_id: parseInt(units_id)
    };
    let url = `${API_URL}/routes/`;
    let method = "POST";
    if (editingRouteId) {
        url = `${API_URL}/routes/${editingRouteId}`;
        method = "PUT";
    }
    const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        alert("Error guardando ruta");
        return;
    }
    closeRouteModal();
    loadRoutes();
}

function editRoute(
    id,
    origin,
    destination,
    departure_time,
    price,
    units_id
) {
    editingRouteId = id;
    document.getElementById("routeModalTitle").textContent = "Editar ruta";
    document.getElementById("origin").value = origin;
    document.getElementById("destination").value = destination;
    document.getElementById("departure_time").value = departure_time;
    document.getElementById("price").value = price;
    document.getElementById("units_id").value = units_id;
    document.getElementById("routeModal").style.display = "flex";
}

async function deleteRoute(id) {
    if (!confirm("¿Eliminar esta ruta?")) {
        return;
    }
    const res = await fetch(
        `${API_URL}/routes/${id}`,
        {
            method: "DELETE",
            headers: authHeaders()
        }
    );
    if (!res.ok) {
        alert("Error eliminando ruta");
        return;
    }
    loadRoutes();
}
window.editRoute = editRoute;
window.deleteRoute = deleteRoute;
window.openRouteModal = openRouteModal;
window.closeRouteModal = closeRouteModal;
window.saveRoute = saveRoute;