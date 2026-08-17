async function login() {
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    if (!email || !password) {
        alert("Completa todos los campos.");
        return;
    }
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const data = await response.json();
        if (!response.ok) {
            alert(data.detail || "Error al iniciar sesión.");
            return;
        }
        if (!data.access_token) {
            alert("No se recibió token de acceso.");
            return;
        }
        setToken(data.access_token);
        window.location.href = "dashboard.html";
    } catch(error) {
        console.error(error);
        alert("No fue posible conectar con la API");
    }
}