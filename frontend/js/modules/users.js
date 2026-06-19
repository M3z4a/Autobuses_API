//funcion que muestra usuarios
async function showUsers() {
    const pageTitle = document.getElementById("pageTitle");
    const content = document.getElementById("content");
    //titulo de la pagina
    pageTitle.textContent = "Usuarios";
    //contenedor HTML
    content.innerHTML = `
        <h2>Usuarios</h2>
        <br>
        <table border="1" width="100%" id="usersTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    const tbody = document.querySelector("#usersTable tbody");
    //manda a llamar a la API
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: authHeaders()
        });
        //si no logra conectar, mandara error
        if (!response.ok) {
            throw new Error("Error cargando usuarios");
        }
        const users = await response.json();
        tbody.innerHTML = "";
        users.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
        alert("Error cargando usuarios");
    }
}