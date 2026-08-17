const API_URL = "http://127.0.0.1:8000";
function setToken(token) {
    localStorage.setItem("token", token);
}
function getToken() {
    return localStorage.getItem("token");
}
function removeToken() {
    localStorage.removeItem("token");
}
function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}
function parseJwt(token) {
    if (!token) return null;
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(c =>
                    "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch(error) {
        console.error("Error leyendo token:", error);
        return null;
    }
}
function getCurrentUser() {
    return parseJwt(getToken());
}
function getUserRole() {
    const user = getCurrentUser();
    return user?.role || null;
}
function requireAuth() {
    if (!getToken()) {
        window.location.href = "login.html";
    }
}
function isSystemAdmin() {
    return getUserRole() === "system_admin";
}
function isCompanyAdmin() {
    return getUserRole() === "company_admin";
}
function isRouteManager() {
    return getUserRole() === "route_manager";
}
function isTraveler() {
    return getUserRole() === "traveler";
}
function isAuditor() {
    return getUserRole() === "auditor";
}
function canManageRoutes() {
    const role = getUserRole();
    return (
        role === "system_admin" ||
        role === "company_admin" ||
        role === "route_manager"
    );
}
function canManageUnits() {
    const role = getUserRole();
    return (
        role === "system_admin" ||
        role === "company_admin"
    );
}
function canManageCompany() {
    const role = getUserRole();
    return (
        role === "system_admin" ||
        role === "company_admin"
    );
}
function isReadOnly() {
    return isAuditor();
}
function logout() {
    removeToken();
    window.location.href = "index.html";
}