let editingRouteId = null;
// muestra la vista de rutas y carga las rutas en la tabla
async function showRoutes() {
    const user = getCurrentUser();
    pageTitle.textContent = "Rutas";
    const newButton =
        user.role !== "client"
            ? `<button onclick="openRouteModal()">Nueva ruta</button>`
            : "";
    // carga la tabla de rutas
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
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
        <div id="routeModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.5); justify-content:center; align-items:center;">
            <div style="background:white; padding:20px; border-radius:10px; width:320px;">
                <h3 id="routeModalTitle">Ruta</h3>
                <input id="origin" placeholder="Origen">
                <input id="destination" placeholder="Destino">
                <input id="departure_time" placeholder="Hora de salida">
                <input id="price" placeholder="Precio" type="number">
                <input id="company_id" placeholder="ID Empresa" type="number">
                <input id="units_id" placeholder="ID Unidad" type="number">
                <br><br>
                <button onclick="saveRoute()">Guardar</button>
                <button onclick="closeRouteModal()">Cancelar</button>
            </div>
        </div>
    `;
    // carga las rutas desde la API
    loadRoutes();
}
// carga las ritas desde API y muestra en tabla
async function loadRoutes() {
    const user = getCurrentUser();
    const tbody = document.querySelector("#routesTable tbody");

    try {
        const res = await fetch(`${API_URL}/routes/`, {
            headers: authHeaders()
        });
        const data = await res.json();
        tbody.innerHTML = "";
        data.forEach(r => {
            let acciones = "";
            // edicion y eliminacion de una ruta para empleado y admin
            if (user.role === "admin" || user.role === "employee") {
                acciones = `
                    <button onclick="editRoute(
                        ${r.id},
                        '${r.origin}',
                        '${r.destination}',
                        '${r.departure_time}',
                        ${r.price},
                        ${r.company_id},
                        ${r.units_id || 0}
                    )">Editar</button>
                    <button onclick="deleteRoute(${r.id})">Borrar</button>
                `;
                //si es cliente solo puede ver la ruta
            } else {
                acciones = `<span>Solo lectura</span>`;
            }
            //parametros que se muestran en la tabla de rutas
            tbody.innerHTML += `
                <tr>
                    <td>${r.id}</td>
                    <td>${r.origin}</td>
                    <td>${r.destination}</td>
                    <td>${r.departure_time}</td>
                    <td>${r.price}</td>
                    <td>${r.company_id}</td>
                    <td>${r.units_id || "Sin unidad"}</td>
                    <td>${acciones}</td>
                </tr>
            `;
        });
    // si hay un error cargando las rutas, simplemente dara error y no cargara nada
    } catch (error) {
        console.error(error);
        alert("Error cargando rutas");
    }
}
// abre el modal de las rutas para crear una nueva ruta
function openRouteModal() {
    editingRouteId = null;
    document.getElementById("routeModalTitle").textContent = "Nueva ruta";
    document.getElementById("origin").value = "";
    document.getElementById("destination").value = "";
    document.getElementById("departure_time").value = "";
    document.getElementById("price").value = "";
    document.getElementById("company_id").value = "";
    document.getElementById("units_id").value = "";
    document.getElementById("routeModal").style.display = "flex";
}
// cierra el modal  de las rutas
function closeRouteModal() {
    document.getElementById("routeModal").style.display = "none";
}
// funcion que guarda las rutas, ya sea una nueva ruta o la edicion de una existente
async function saveRoute() {
    // obtiene los valores de los campos del modal
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const departure_time = document.getElementById("departure_time").value;
    const price = document.getElementById("price").value;
    const company_id = document.getElementById("company_id").value;
    const units_id = document.getElementById("units_id").value;
    // valida que todos los campos esten completos
    if (!origin || !destination || !departure_time || !price || !company_id || !units_id) {
        alert("Completa todos los campos");
        return;
    }
    // crea el payload para enviar a la API
    const payload = {
        origin,
        destination,
        departure_time,
        company_id: parseInt(company_id),
        price: parseInt(price),
        units_id: parseInt(units_id)
    };
    // verifica si es nueva ruta o edicion de una
    let url = `${API_URL}/routes/`;
    let method = "POST";
    if (editingRouteId) {
        url = `${API_URL}/routes/${editingRouteId}`;
        method = "PUT";
    }
    // envia la solicitud a la API para guardar la ruta
    const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    // si hay algun error, muestra un mensaje de error y no hace nada
    if (!res.ok) {
        alert("Error guardando ruta");
        return;
    }
    closeRouteModal();
    loadRoutes();
}
// edita una ruta, abre el modal con los datos de la ruta
function editRoute(id, origin, destination, departure_time, price, company_id, units_id) {
    editingRouteId = id;
    document.getElementById("routeModalTitle").textContent = "Editar ruta";
    document.getElementById("origin").value = origin;
    document.getElementById("destination").value = destination;
    document.getElementById("departure_time").value = departure_time;
    document.getElementById("company_id").value = company_id;
    document.getElementById("price").value = price;
    document.getElementById("units_id").value = units_id;
    document.getElementById("routeModal").style.display = "flex";
}
// borra una ruta, pide confirmacion y envia la solicitud a la API
async function deleteRoute(id) {
    if (!confirm("¿Eliminar esta ruta?")) return;
    const res = await fetch(`${API_URL}/routes/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });
    if (!res.ok) {
        alert("Error eliminando ruta");
        return;
    }
    // si todo sale bien, recarga la lista de rutas
    loadRoutes();
}

window.editRoute = editRoute;
window.deleteRoute = deleteRoute;
window.openRouteModal = openRouteModal;
window.closeRouteModal = closeRouteModal;
window.saveRoute = saveRoute;