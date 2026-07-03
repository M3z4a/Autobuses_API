let editingUnitId = null;
// funcion para mostrar la lista de unidades
async function showUnits() {
    const user = getCurrentUser();
    pageTitle.textContent = "Unidades";
    // crea el boton de nueva unidad solo si el usuario es empleado o admin
    const newButton =
        user.role !== "client"
            ? `<button onclick="openUnitModal()">Nueva unidad</button>`
            : "";
    // crea la tabla de unidades y el modal para crear/editar unidades
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2>Unidades</h2>
            ${newButton}
        </div>
        <table id="unitsTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Modelo</th>
                    <th>Placas</th>
                    <th>Asientos</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <div id="unitModal"
            style="display:none;
                   position:fixed;
                   top:0;
                   left:0;
                   width:100%;
                   height:100%;
                   background:rgba(0,0,0,.5);
                   justify-content:center;
                   align-items:center;">
            <div style="background:white; padding:20px; border-radius:10px; width:340px;">
                <h3 id="unitModalTitle">Unidad</h3>
                <label>Tipo</label><br>
                <select id="unit_type">
                    <option value="bus">Autobús</option>
                    <option value="combi">Combi</option>
                </select>
                <br><br>
                <label>Modelo</label><br>
                <input
                    id="model"
                    type="text"
                    placeholder="Ej. Mercedes O500, Volvo 9700..."
                >
                <br><br>
                <label>Placas</label><br>
                <input
                    id="plates"
                    type="text"
                    placeholder="ABC-123"
                >
                <br><br>
                <button onclick="saveUnit()">Guardar</button>
                <button onclick="closeUnitModal()">Cancelar</button>
            </div>
        </div>
    `;
    // carga las unidades desde la API
    loadUnits();
}
// funcion para cargar las unidades desde la API y mostrarlas en la tabla
async function loadUnits() {    
    // obtiene el usuario actual para determinar si puede editar/eliminar unidades
    const user = getCurrentUser();
    const tbody = document.querySelector("#unitsTable tbody");
    try {
        const res = await fetch(`${API_URL}/units/`, {
            headers: authHeaders()
        });
        const data = await res.json();
        tbody.innerHTML = "";
        data.forEach(u => {
            const type = (u.type || "").replace(/'/g, "\\'");
            const model = (u.model || "").replace(/'/g, "\\'");
            const plates = (u.plates || "").replace(/'/g, "\\'");
            let acciones = "";
            // si el usuario es admin o empleado, puede editar/eliminar unidades
            if (user.role === "admin" || user.role === "employee") {
                acciones = `
                    <button onclick="editUnit(${u.id}, '${type}', '${model}', '${plates}')">
                        Editar
                    </button>
                    <button onclick="deleteUnit(${u.id})">
                        Eliminar
                    </button>
                `;
            // si el usuario es cliente, solo puede ver las unidades (implementado a medias)
            } else {
                acciones = `<span>Solo lectura</span>`;
            }
            // agrega la fila de la unidad a la tabla
            tbody.innerHTML += `
                <tr>
                    <!-- Muestra los datos de la unidad en la tabla -->
                    <td>${u.id}</td>
                    <td>${u.type}</td>
                    <td>${u.model}</td>
                    <td>${u.plates}</td>
                    <td>${u.seat_count}</td>
                    <td>${acciones}</td>
                </tr>
            `;
        });
    // si no hay unidades, muestra un mensaje
    } catch (error) {
        console.error(error);
        alert("Error cargando unidades");
    }
}
// funciones para abrir/cerrar el modal de unidad, guardar, editar y eliminar unidades
function openUnitModal() {
    editingUnitId = null;
    document.getElementById("unitModalTitle").textContent = "Nueva unidad";
    document.getElementById("unit_type").value = "bus";
    document.getElementById("plates").value = "";
    const modelInput = document.getElementById("model");
    if (modelInput) modelInput.value = "";
    document.getElementById("unitModal").style.display = "flex";
}
// cierra el modal de unidad
function closeUnitModal() {
    document.getElementById("unitModal").style.display = "none";
}
// guarda la unidad (edicion o creacion) en la APISS
async function saveUnit() {
    const type = document.getElementById("unit_type").value;
    const plates = document.getElementById("plates").value;
    const model = document.getElementById("model").value;
    // si falta algun campo, muestra un mensaje de error y no hace nada
    if (!type || !plates || !model) {
        alert("Completa todos los campos");
        return;
    }
    // si es un bus, tiene 40 asientos, si es una combi, tiene 12 asientos (predeterminado)
    const seats = type === "bus" ? 40 : 12;
    const payload = {
        type,
        plates,
        model,
        seats
    };
    // verifica si es una nueva unidad o edicion de una ya existente
    let url = `${API_URL}/units/`;
    let method = "POST";
    if (editingUnitId) {
        url = `${API_URL}/units/${editingUnitId}`;
        method = "PUT";
    }
    // envia la solicitud a la API para guardar la unidad
    try {
        const res = await fetch(url, {
            method,
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        // si hay algun error, muestra un mensaje de error y no hace nada
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            console.error(error);
            alert(error.detail || "Error guardando unidad");
            return;
        }
        // si todo sale bien, cierra el modal y recarga la lista de unidades
        closeUnitModal();
        loadUnits();
    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor");
    }
}
// edita una unidad, abre el modal con los datos de la unidad
function editUnit(id, type, model, plates) {
    editingUnitId = id;
    document.getElementById("unitModalTitle").textContent = "Editar unidad";
    document.getElementById("unit_type").value = type;
    const modelInput = document.getElementById("model");
    if (modelInput) modelInput.value = model;
    document.getElementById("plates").value = plates;
    document.getElementById("unitModal").style.display = "flex";
}
// borra una unidad, pide confirmacion y envia la solicitud a la API
async function deleteUnit(id) {
    if (!confirm("¿Eliminar esta unidad?")) return;
    const res = await fetch(`${API_URL}/units/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });
    if (!res.ok) {
        alert("Error eliminando unidad");
        return;
    }
    // si todo sale bien, recarga la lista de unidades
    loadUnits();
}