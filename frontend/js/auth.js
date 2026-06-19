//funcion login
async function login() {
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    //si no se llenan los campos necesarios, dara una alerta y error
    if (!email || !password) {
        alert("Completa todos los campos.");
        return;
    }
    //conecya a la API
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
        //si no logra conectar sera imposible inicar sesion y dara una alerta y error
        if (!response.ok) {
            alert(data.detail || "Error al iniciar sesión.");
            return;
        }
        setToken(data.access_token);
        //si se accede, mostrara la pagina dashboard.html
        window.location.href = "dashboard.html";
    //mensaje de error si no logra conectar con la API
    } catch (error) {
        console.error(error);
        alert("No fue posible conectar con la API");
    }
}   