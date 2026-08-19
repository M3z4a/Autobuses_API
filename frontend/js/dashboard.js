const token = getToken();
if (!token) {
    window.location.href = "login.html";
}
const user = getCurrentUser();
if (!user) {
    removeToken();
    window.location.href = "login.html";
}
document.getElementById("userName").textContent =
    user.name || user.email;
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

async function loadDashboardStats() {
    const user = getCurrentUser();
    try {
        const res = await fetch(
            `${API_URL}/reservations/dashboard-stats`,
            {
                headers: authHeaders()
            }
        );
        if (!res.ok) {
            throw new Error("Error cargando estadísticas");
        }
        return await res.json();
    } catch (error) {
        console.error("Error cargando estadísticas:", error);
        return {
            total_reservations: 0,
            top_route: null
        };
    }
}

async function showSystemDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Administración del Sistema</h2>
        <div class="dashboard-cards">
            <div class="dashboard-card">
                <h3>Reservaciones</h3>
                <span id="totalReservations">0</span>
                <p>Total de reservaciones</p>
            </div>
            <div class="dashboard-card">
                <h3>Ruta más reservada</h3>
                <strong id="topRoute">Cargando...</strong>
                <p id="topRouteCount"></p>
            </div>
        </div>
    `;
    const stats = await loadDashboardStats();
    document.getElementById("totalReservations").textContent =
        stats.total_reservations;
    if (stats.top_route) {
        document.getElementById("topRoute").textContent =
            stats.top_route.route_name;
        document.getElementById("topRouteCount").textContent =
            `${stats.top_route.reservations} reservación(es)`;
    } else {
        document.getElementById("topRoute").textContent =
            "Sin reservaciones";
        document.getElementById("topRouteCount").textContent =
            "";
    }
}

async function showCompanyDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Empresa</h2>
        <div class="dashboard-cards">
            <div class="dashboard-card">
                <h3>Reservaciones</h3>
                <span id="totalReservations">0</span>
                <p>Reservaciones de tu empresa</p>
            </div>
        </div>
    `;
    const stats = await loadDashboardStats();
    document.getElementById("totalReservations").textContent =
        stats.total_reservations;
}

async function showManagerDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Gestión de Rutas</h2>
        <div class="dashboard-cards">
            <div class="dashboard-card">
                <h3>Reservaciones</h3>
                <span id="totalReservations">0</span>
                <p>Reservaciones de tu empresa</p>
            </div>
        </div>
    `;
    const stats = await loadDashboardStats();
    document.getElementById("totalReservations").textContent =
        stats.total_reservations;
}

async function showTravelerDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Usuario</h2>
        <div class="dashboard-cards">
            <div class="dashboard-card">
                <h3>Mis reservaciones</h3>
                <span id="totalReservations">0</span>
                <p>Reservaciones realizadas</p>
            </div>

        </div>
    `;
    const stats = await loadDashboardStats();
    document.getElementById("totalReservations").textContent =
        stats.total_reservations;
}

async function showAuditorDashboard() {
    pageTitle.textContent = "Dashboard";
    content.innerHTML = `
        <h2>Panel de Auditoría</h2>
        <div class="dashboard-cards">

            <div class="dashboard-card">
                <h3>Reservaciones</h3>
                <span id="totalReservations">0</span>
                <p>Total de reservaciones</p>
            </div>
            <div class="dashboard-card">
                <h3>Ruta más reservada</h3>
                <strong id="topRoute">Cargando...</strong>
                <p id="topRouteCount"></p>
            </div>
        </div>
    `;
    const stats = await loadDashboardStats();
    document.getElementById("totalReservations").textContent =
        stats.total_reservations;
    if (stats.top_route) {
        document.getElementById("topRoute").textContent =
            stats.top_route.route_name;
        document.getElementById("topRouteCount").textContent =
            `${stats.top_route.reservations} reservación(es)`;
    } else {
        document.getElementById("topRoute").textContent =
            "Sin reservaciones";

        document.getElementById("topRouteCount").textContent =
            "";
    }
}

const params = new URLSearchParams(
    window.location.search
);
const page = params.get("page");

if (page === "reservations") {
    showReservations();
} else {
    if (role === "system_admin") {
        showSystemDashboard();
    }
    if (role === "company_admin") {
        showCompanyDashboard();
    }
    if (role === "route_manager") {
        showManagerDashboard();
    }
    if (role === "traveler") {
        showTravelerDashboard();
    }
    if (role === "auditor") {
        showAuditorDashboard();
    }
}