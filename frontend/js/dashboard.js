//verifica la sesion y el rol
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}
//obtiene el usuario
const user = getCurrentUser();
if (!user) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
//muestra el nombre (sin terminar)
document.getElementById("userName").textContent = user.sub;
//los contenedores dinamicos
const menu = document.getElementById("menu");
const content = document.getElementById("content");
const pageTitle = document.getElementById("pageTitle");
//crea el boton menu
function createMenuButton(text, callback) {
    const button = document.createElement("button");
    button.className = "menu-button";
    button.textContent = text;
    button.onclick = callback;
    menu.appendChild(button);
}
//vista de admin
if (user.role === "admin") {
    createMenuButton("Dashboard", showAdminDashboard);
    createMenuButton("Empresas", showCompanies);
    createMenuButton("Rutas", showRoutes);
    createMenuButton("Usuarios", showUsers);
    createMenuButton("Reservaciones", showReservations);
    createMenuButton("Pagos", showPayments);
}
//vista de empleado
if (user.role === "employee") {
    createMenuButton("Dashboard", showEmployeeDashboard);
    createMenuButton("Rutas", showRoutes);
    createMenuButton("Reservaciones", showReservations);
}
//vista de cliente
if (user.role === "client") {
    createMenuButton("Dashboard", showClientDashboard);
    createMenuButton("Ver rutas", showRoutes);
    createMenuButton("Mis reservaciones", showReservations);
}
//boton de cerrar sesion (disponible en todas las vistas)
createMenuButton("Cerrar sesión", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

//funciones temporales segun los roles
//el dashboard del admin
function showAdminDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Administración</h2>
        <p>Bienvenido al sistema.</p>
    `;
}
//el daschboard del empleado
function showEmployeeDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Empleado</h2>
        <p>Bienvenido.</p>
    `;
}
//el dashboard del cliente
function showClientDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel del Cliente</h2>
        <p>Bienvenido.</p>
    `;
}
//muestra el dashboard segun el rol
//admin
if (user.role === "admin") {
    showAdminDashboard();

}
//empleado
if (user.role === "employee") {

    showEmployeeDashboard();

}
//usuario
if (user.role === "client") {

    showClientDashboard();

}