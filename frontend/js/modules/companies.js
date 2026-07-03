let editingCompanyId = null;
//funcion que carga las empresas
async function showCompanies() {
    // titulo de la pagina
    pageTitle.textContent = "Empresas";
    //contenedor html
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2>Empresas</h2>
            <!-- Boton de creacion de empresa -->
            <button onclick="openCompanyModal()">
                Nueva empresa
            </button>
        </div>
        <!-- Tabla de compañias -->
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
        <!-- Modelo del renglon que muestra emoresa -->
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
// carga y lista las empresas (compañias)
async function loadCompanies() {
    const tbody = document.querySelector("#companiesTable tbody");
    //llama a las empresas a listarse
    const res = await fetch(`${API_URL}/companies`, {
        headers: authHeaders()
    });
    const data = await res.json();
    tbody.innerHTML = "";
    data.forEach(c => {
        tbody.innerHTML += `
        <!--Tabla html-->
            <tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>
                    <!--botones de editar empresa y borrar empresa, solo visibles para admin-->
                    <button onclick="editCompany(${c.id}, '${c.name}', '${c.email}', '${c.phone}')">Editar</button>
                    <button onclick="deleteCompany(${c.id})">Borrar</button>
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
//creacion de compañias
async function saveCompany() {
    //campos necesarios para la creacion de compañias
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const payload = { name, email, phone };
    //si se deja un campo vacio, lanzara un error y no se creara la empresa
    if (!name || !email || !phone) {
        alert("Completa todos los campos");
        return;
    }
    //llamados a la API
    let url = `${API_URL}/companies`;
    let method = "POST";
    if (editingCompanyId) {
        url = `${API_URL}/companies/${editingCompanyId}`;
        method = "PUT";
    }
    const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    //en caso de no conectar con la api, la empresa no se guardara y sera un error
    if (!res.ok) {
        alert("Error guardando empresa");
        return;
    }
    closeCompanyModal();
    loadCompanies();
}

//edicion de compañias
function editCompany(id, name, email, phone) {
    //se edita la compañia por medio de su id (campo fundamental y principal para poder editar)
    editingCompanyId = id;
    document.getElementById("modalTitle").textContent = "Editar empresa";
    document.getElementById("name").value = name;
    document.getElementById("email").value = email;
    document.getElementById("phone").value = phone;
    document.getElementById("companyModal").style.display = "flex";
}

//borrar compañia
async function deleteCompany(id) {
    //mensaje de confirmacion
    if (!confirm("¿Eliminar esta empresa?")) return;
    //manda a llamar a la API
    const res = await fetch(`${API_URL}/companies/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });
    // si no existe la compañia o no conecta a la API no se eliminara y sera error
    if (!res.ok) {
        alert("Error eliminando empresa");
        return;
    }
    loadCompanies();
}