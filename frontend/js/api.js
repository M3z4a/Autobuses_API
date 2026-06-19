const API_URL = "http://127.0.0.1:8000";
// Guardar token
function setToken(token) {
    localStorage.setItem("token", token);
}
// Obtener token
function getToken() {
    return localStorage.getItem("token");
}
// Eliminar token
function removeToken() {
    localStorage.removeItem("token");
}
// Headers con autenticación
function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}
// Decodificar JWT
function parseJwt(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c =>
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                )
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}
// Obtener usuario actual desde el JWT
function getCurrentUser() {
    return parseJwt(getToken());
}
// Obtener rol
function getUserRole() {
    const user = getCurrentUser();

    return user?.role || null;
}
// Verificar autenticación
function requireAuth() {
    if (!getToken()) {
        window.location.href = "login.html";
    }
}
// Cerrar sesión
function logout() {
    removeToken();
    window.location.href = "index.html";
}