// guarda el token del login en el localStorage
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}
// Obtiene el usuario ligado el token
const user = getCurrentUser();
if (!user) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
// Muestra el nombre (id aún) del usuario en el header
document.getElementById("userName").textContent = user.name;
const menu = document.getElementById("menu");
const content = document.getElementById("content");
const pageTitle = document.getElementById("pageTitle");
// Crea los botones dinamicos segun el rol del token
function createMenuButton(text, callback) {
    const button = document.createElement("button");
    button.className = "menu-button";
    button.textContent = text;
    button.onclick = () => callback();
    menu.appendChild(button);
}
// agrega botones al menu segun el rol (admin)
if (user.role === "admin") {
    createMenuButton("Dashboard", showAdminDashboard);
    createMenuButton("Empresas", showCompanies);
    createMenuButton("Rutas", showRoutes);
    createMenuButton("Unidades", showUnits);
    createMenuButton("Usuarios", showUsers);
    createMenuButton("Reservaciones", showReservations);
    createMenuButton("Pagos", showPayments);
}
// agrega los botones al menu del rol empleado
if (user.role === "employee") {
    createMenuButton("Dashboard", showEmployeeDashboard);
    createMenuButton("Rutas", showRoutes);
    createMenuButton("Unidades", showUnits); 
    createMenuButton("Reservaciones", showReservations);
}
// agrega los botones al menu del rol cliente
if (user.role === "client") {
    createMenuButton("Dashboard", showClientDashboard);
    createMenuButton("Ver rutas", showRoutes);
    createMenuButton("Mis reservaciones", showReservations);
}
// agrega el boton cerrar sesion para todos los roles
createMenuButton("Cerrar sesión", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});
// titulo de la apgina fijo por rol
function showAdminDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `<h2>Panel de Administración</h2>`;
}
function showEmployeeDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `<h2>Panel de Empleado</h2>`;
}
function showClientDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `<h2>Panel de Cliente</h2>`;
}
// muestra el dashboard segun el rol del usuario
if (user.role === "admin") showAdminDashboard();
if (user.role === "employee") showEmployeeDashboard();
if (user.role === "client") showClientDashboard();