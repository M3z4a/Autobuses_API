async function showPayments() {
    const pageTitle = document.getElementById("pageTitle");
    const content = document.getElementById("content");
    pageTitle.textContent = "Pagos";
    content.innerHTML = `
        <h2>Pagos confirmados</h2>
        <br>
        <table id="paymentsTable">
            <thead>
                <tr>
                    <th>ID Reserva</th>
                    <th>ID Usuario</th>
                    <th>ID Ruta</th>
                    <th>Asiento</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    const tbody = document.querySelector("#paymentsTable tbody");
    try {
        const response = await fetch(`${API_URL}/payments`, {
            headers: authHeaders()
        });
        if (!response.ok) {
            throw new Error("Error cargando pagos");
        }
        const payments = await response.json();
        tbody.innerHTML = "";
        if (!payments.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">No hay pagos registrados</td>
                </tr>
            `;
            return;
        }
        payments.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.reservation_id ?? "-"}</td>
                    <td>${p.user_id ?? "-"}</td>
                    <td>${p.route_id ?? "-"}</td>
                    <td>${p.seat_number ?? "-"}</td>
                    <td>${p.status ?? "-"}</td>
                </tr>
            `;
        });
    } catch(error) {
        console.error(error);
        alert("Error cargando pagos");
    }
}