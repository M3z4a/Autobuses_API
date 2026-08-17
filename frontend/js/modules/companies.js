let editingCompanyId = null;
//funcion que carga las empresas
async function showCompanies() {
    const user = getCurrentUser();
    // titulo de la pagina
    pageTitle.textContent = "Empresas";
    // boton de crear empresa solo para system_admin
    const newButton = user.role === "system_admin"
        ? `
            <button onclick="openCompanyModal()">
                Nueva empresa
            </button>
          `
        : "";
    //contenedor html
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2>Empresas</h2>
            ${newButton}
        </div>
        <table id="companiesTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <div id="companyModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.5); justify-content:center; align-items:center;">
            <div style="background:white; padding:20px; border-radius:10px; width:300px;">
                <h3 id="modalTitle">Empresa</h3>
                <input id="name" placeholder="Nombre">
                <input id="email" placeholder="Email">
                <input id="phone" placeholder="Teléfono">
                <br><br>
                <button onclick="saveCompany()">Guardar</button>
                <button onclick="closeCompanyModal()">Cancelar</button>
            </div>
        </div>
    `;
    loadCompanies();
}
// carga y lista las empresas
async function loadCompanies() {
    const user = getCurrentUser();
    const tbody = document.querySelector("#companiesTable tbody");
    //llama a las empresas a listarse
    const res = await fetch(`${API_URL}/companies`, {
        headers: authHeaders()
    });
    const data = await res.json();
    tbody.innerHTML = "";
    data.forEach(c => {
        let actions = "Solo lectura";
        //solo system_admin puede editar y eliminar empresas
        if (user.role === "system_admin") {
            actions = `
                <button onclick="editCompany(${c.id}, '${c.name}', '${c.email}', '${c.phone}')">
                    Editar
                </button>
                <button onclick="deleteCompany(${c.id})">
                    Borrar
                </button>
            `;
        }
        tbody.innerHTML += `
            <tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>
                    ${actions}
                </td>
            </tr>
        `;
    });

}
//ventana de control de compañias
function openCompanyModal() {
    editingCompanyId = null;
    document.getElementById("modalTitle").textContent = "Nueva empresa";
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("companyModal").style.display = "flex";
}
// cierra el modal
function closeCompanyModal() {
    document.getElementById("companyModal").style.display = "none";
}
//creacion y edicion de compañias
async function saveCompany() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    //campos necesarios para la creacion de compañias
    if (!name || !email || !phone) {
        alert("Completa todos los campos");
        return;
    }
    const payload = {
        name,
        email,
        phone
    };
    let url = `${API_URL}/companies`;
    let method = "POST";
    //si existe id, actualiza empresa
    if (editingCompanyId) {
        url = `${API_URL}/companies/${editingCompanyId}`;
        method = "PUT";
    }
    const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    //si hay error al guardar
    if (!res.ok) {
        alert("Error guardando empresa");
        return;
    }
    closeCompanyModal();
    loadCompanies();
}
//edicion de compañias
function editCompany(id, name, email, phone) {
    editingCompanyId = id;
    document.getElementById("modalTitle").textContent = "Editar empresa";
    document.getElementById("name").value = name;
    document.getElementById("email").value = email;
    document.getElementById("phone").value = phone;
    document.getElementById("companyModal").style.display = "flex";
}
//borrar compañia
async function deleteCompany(id) {
    if (!confirm("¿Eliminar esta empresa?")) return;
    const res = await fetch(`${API_URL}/companies/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });
    if (!res.ok) {
        alert("Error eliminando empresa");
        return;
    }
    loadCompanies();
}