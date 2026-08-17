let editingUnitId = null;
async function showUnits() {
    const user = getCurrentUser();
    pageTitle.textContent = "Unidades";
    const canEdit = user.role === "system_admin" || user.role === "company_admin";
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2>Unidades</h2>
            ${canEdit ? `<button onclick="openUnitModal()">Nueva unidad</button>` : ""}
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
        ${canEdit ? `
        <div id="unitModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.5); justify-content:center; align-items:center;">
            <div style="background:white; padding:20px; border-radius:10px; width:340px;">
                <h3 id="unitModalTitle">Unidad</h3>
                <label>Tipo</label><br>
                <select id="unit_type">
                    <option value="bus">Autobús</option>
                    <option value="combi">Combi</option>
                </select>
                <br><br>
                <label>Modelo</label><br>
                <input id="model" type="text">
                <br><br>
                <label>Placas</label><br>
                <input id="plates" type="text">
                <br><br>
                <button onclick="saveUnit()">Guardar</button>
                <button onclick="closeUnitModal()">Cancelar</button>
            </div>
        </div>
        ` : ""}
    `;
    loadUnits();
}
async function loadUnits() {
    const user = getCurrentUser();
    const tbody = document.querySelector("#unitsTable tbody");
    const canEdit = user.role === "system_admin" || user.role === "company_admin";
    try {
        const res = await fetch(`${API_URL}/units/`, {
            headers: authHeaders()
        });
        if (!res.ok) {
            throw new Error("Error cargando unidades");
        }
        const data = await res.json();
        tbody.innerHTML = "";
        data.forEach(u => {
            let acciones = "Solo lectura";
            if (canEdit) {
                acciones = `
                    <button onclick="editUnit(${u.id}, '${u.type}', '${u.model}', '${u.plates}')">
                        Editar
                    </button>
                    <button onclick="deleteUnit(${u.id})">
                        Eliminar
                    </button>
                `;
            }
            tbody.innerHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.type}</td>
                    <td>${u.model}</td>
                    <td>${u.plates}</td>
                    <td>${u.seat_count}</td>
                    <td>${acciones}</td>
                </tr>
            `;
        });
    } catch(error) {
        console.error(error);
        alert("Error cargando unidades");
    }
}
function openUnitModal() {
    editingUnitId = null;
    document.getElementById("unitModalTitle").textContent = "Nueva unidad";
    document.getElementById("unit_type").value = "bus";
    document.getElementById("model").value = "";
    document.getElementById("plates").value = "";
    document.getElementById("unitModal").style.display = "flex";
}
function closeUnitModal() {
    document.getElementById("unitModal").style.display = "none";
}
async function saveUnit() {
    const type = document.getElementById("unit_type").value;
    const model = document.getElementById("model").value;
    const plates = document.getElementById("plates").value;
    if (!type || !model || !plates) {
        alert("Completa todos los campos");
        return;
    }
    const payload = {
        type,
        model,
        plates
    };
    let url = `${API_URL}/units/`;
    let method = "POST";
    if (editingUnitId) {
        url = `${API_URL}/units/${editingUnitId}`;
        method = "PUT";
    }
    try {
        const res = await fetch(url, {
            method,
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            alert(error.detail || "Error guardando unidad");
            return;
        }
        closeUnitModal();
        loadUnits();
    } catch(error) {
        console.error(error);
        alert("Error de conexión");
    }
}
function editUnit(id, type, model, plates) {
    editingUnitId = id;
    document.getElementById("unitModalTitle").textContent = "Editar unidad";
    document.getElementById("unit_type").value = type;
    document.getElementById("model").value = model;
    document.getElementById("plates").value = plates;
    document.getElementById("unitModal").style.display = "flex";
}
async function deleteUnit(id) {
    if (!confirm("¿Eliminar esta unidad?")) return;
    const res = await fetch(`${API_URL}/units/${id}`, {
        method:"DELETE",
        headers:authHeaders()
    });
    if (!res.ok) {
        alert("Error eliminando unidad");
        return;
    }
    loadUnits();
}
window.openUnitModal = openUnitModal;
window.closeUnitModal = closeUnitModal;
window.saveUnit = saveUnit;
window.editUnit = editUnit;
window.deleteUnit = deleteUnit;