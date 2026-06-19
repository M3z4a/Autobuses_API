let editingRouteId = null;
//funcion que muestra las rutas
async function showRoutes() {
    //titulo de la pagina
    pageTitle.textContent = "Rutas";
    //contenedor HTML
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2>Rutas</h2>
            <button onclick="openRouteModal()">
                Nueva ruta
            </button>
        </div>
        <!-- Tabla que muestra rutas -->
        <table id="routesTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Salida</th>
                    <th>Empresa</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <!-- cuadro de dialogo-->
        <div id="routeModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.5); justify-content:center; align-items:center;">
            <div style="background:white; padding:20px; border-radius:10px; width:320px;">
                <h3 id="routeModalTitle">Ruta</h3>
                <input id="origin" placeholder="Origen">
                <input id="destination" placeholder="Destino">
                <input id="departure_time" placeholder="Hora de salida (DD-MM-YYYY HH:MM)">
                <input id="company_id" placeholder="ID Empresa" type="number">
                <br><br>
                <!-- boton de guardar y cancelar -->
                <button onclick="saveRoute()">Guardar</button>
                <button onclick="closeRouteModal()">Cancelar</button>
            </div>

        </div>
    `;
    loadRoutes();
}

//lista y muestra las rutas
async function loadRoutes() {
    const tbody = document.querySelector("#routesTable tbody");
    //manda a llamar a la Api
    try {
        const res = await fetch(`${API_URL}/routes/`, {
            headers: authHeaders()
        });
        const data = await res.json();
        tbody.innerHTML = "";
        data.forEach(r => {
            tbody.innerHTML += `
                <tr>
                    <td>${r.id}</td>
                    <td>${r.origin}</td>
                    <td>${r.destination}</td>
                    <td>${r.departure_time}</td>
                    <td>${r.company_id}</td>
                    <td>
                        <!--boton de editar ruta y sus parametros necesarios para hacerlo-->
                        <button onclick="editRoute(
                            ${r.id},
                            '${r.origin}',
                            '${r.destination}',
                            '${r.departure_time}',
                            ${r.company_id}
                        )">Editar</button>
                        <!--boton para borrar ruta-->
                        <button onclick="deleteRoute(${r.id})">Borrar</button>
                    </td>
                </tr>
            `;
        });
        //en caso de no poder llamar la API se mostrara un mensaje de error como alerta y el error en la consola
    } catch (error) {
        console.error(error);
        alert("Error cargando rutas");
    }
}

//ventana para crear una ruta
function openRouteModal() {
    editingRouteId = null;
    document.getElementById("routeModalTitle").textContent = "Nueva ruta";
    document.getElementById("origin").value = "";
    document.getElementById("destination").value = "";
    document.getElementById("departure_time").value = "";
    document.getElementById("company_id").value = "";
    document.getElementById("routeModal").style.display = "flex";
}
function closeRouteModal() {
    document.getElementById("routeModal").style.display = "none";
}
//crear y editar una ruta
async function saveRoute() {
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const departure_time = document.getElementById("departure_time").value;
    const company_id = document.getElementById("company_id").value;
    //si no se llenan los campos necesarios para la creacion o edicion de una ruta sera imposible crearla y mandara una alerta
    if (!origin || !destination || !departure_time || !company_id) {
        alert("Completa todos los campos");
        return;
    }
    const payload = {
        origin,
        destination,
        departure_time,
        company_id: parseInt(company_id)
    };
    //manda a llamar a la API
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
    //en caso de no conectar la API se mostrara una alerta y error
    if (!res.ok) {
        alert("Error guardando ruta");
        return;
    }
    closeRouteModal();
    loadRoutes();
}
//editar ruta
function editRoute(id, origin, destination, departure_time, company_id) {
    editingRouteId = id;
    document.getElementById("routeModalTitle").textContent = "Editar ruta";
    document.getElementById("origin").value = origin;
    document.getElementById("destination").value = destination;
    document.getElementById("departure_time").value = departure_time;
    document.getElementById("company_id").value = company_id;
    document.getElementById("routeModal").style.display = "flex";
}
//eliminar ruta
async function deleteRoute(id) {
    //mensaje para confirmar la eliminacion
    if (!confirm("¿Eliminar esta ruta?")) return;
    //conecta con la API
    const res = await fetch(`${API_URL}/routes/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });
    //si no conecta con la API o el Id no coincide, sera imposble borrarla y mandara una alerta y un error
    if (!res.ok) {
        alert("Error eliminando ruta");
        return;
    }
    loadRoutes();
}