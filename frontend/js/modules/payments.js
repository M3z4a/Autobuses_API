// funcion que muestra los pagos
async function showPayments() {
    const pageTitle = document.getElementById("pageTitle");
    const content = document.getElementById("content");
    //titulo de la pagina
    pageTitle.textContent = "Pagos";
    content.innerHTML = `
        <h2>Pagos confirmados</h2>
        <br>
        <table border="1" width="100%" id="paymentsTable">
            <thead>
                <tr>
                    <th>ID Reserva</th>
                    <th>ID Usuario</th>
                    <th>ID Ruta</th>
                    <th>Asiento</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    const tbody = document.querySelector("#paymentsTable tbody");
    //conecta coon la API
    try {
        const response = await fetch(`${API_URL}/payments`, {
            headers: authHeaders()
        });
        //si no se conecta con la api mostrar un error
        if (!response.ok) {
            throw new Error("Error cargando pagos");
        }
        const payments = await response.json();
        tbody.innerHTML = "";
        payments.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.reservation_id}</td>
                    <td>${p.user_id}</td>
                    <td>${p.route_id}</td>
                    <td>${p.seat_number}</td>
                    <td>${p.status}</td>
                </tr>
            `;
        });
        //si no conecta con la API mostrara un error
    } catch (error) {
        console.error(error);
        alert("Error cargando pagos");
    }
}