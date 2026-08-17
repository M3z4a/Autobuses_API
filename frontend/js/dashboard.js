const token = getToken();
if (!token) {
    window.location.href = "login.html";
}
const user = getCurrentUser();
if (!user) {
    removeToken();
    window.location.href = "login.html";
}
document.getElementById("userName").textContent = user.name || user.email;
const menu = document.getElementById("menu");
const content = document.getElementById("content");
const pageTitle = document.getElementById("pageTitle");
function createMenuButton(text, callback) {
    const button = document.createElement("button");
    button.className = "menu-button";
    button.textContent = text;
    button.onclick = callback;
    menu.appendChild(button);
}
const role = getUserRole();
if (role === "system_admin") {
    createMenuButton("Dashboard", showSystemDashboard);
    createMenuButton("Empresas", showCompanies);
    createMenuButton("Rutas", showRoutes);
    createMenuButton("Unidades", showUnits);
    createMenuButton("Usuarios", showUsers);
    createMenuButton("Reservaciones", showReservations);
    createMenuButton("Pagos", showPayments);
}
if (role === "company_admin") {
    createMenuButton("Dashboard", showCompanyDashboard);
    createMenuButton("Rutas", showRoutes);
    createMenuButton("Unidades", showUnits);
    createMenuButton("Usuarios", showUsers);
    createMenuButton("Reservaciones", showReservations);
    createMenuButton("Pagos", showPayments);
}
if (role === "route_manager") {
    createMenuButton("Dashboard", showManagerDashboard);
    createMenuButton("Rutas", showRoutes);
    createMenuButton("Reservaciones", showReservations);
}
if (role === "traveler") {
    createMenuButton("Dashboard", showTravelerDashboard);
    createMenuButton("Ver rutas", showRoutes);
    createMenuButton("Mis reservaciones", showReservations);
}
if (role === "auditor") {
    createMenuButton("Dashboard", showAuditorDashboard);
    createMenuButton("Rutas", showRoutes);
    createMenuButton("Reservaciones", showReservations);
    createMenuButton("Pagos", showPayments);
}
createMenuButton("Cerrar sesión", () => {
    logout();
});
function showSystemDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Administración del Sistema</h2>
    `;
}
function showCompanyDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Empresa</h2>
    `;
}
function showManagerDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Gestión de Rutas</h2>
    `;
}
function showTravelerDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Usuario</h2>
    `;
}
function showAuditorDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Auditoría</h2>
    `;
}
const params = new URLSearchParams(window.location.search);
const page = params.get("page");
if (page === "reservations") {
    showReservations();
} else {
    if (role === "system_admin") showSystemDashboard();
    if (role === "company_admin") showCompanyDashboard();
    if (role === "route_manager") showManagerDashboard();
    if (role === "traveler") showTravelerDashboard();
    if (role === "auditor") showAuditorDashboard();
}