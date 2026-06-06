// Empresas
const button = document.getElementById("createCompanyBtn");
// Agrega el evento de click al boton crear empresa
if (button) {
    // se inicia al hacer click en el boton
    button.addEventListener("click", async () => {
        // Se traen los valores de los inputs al form
        const name = document.getElementById("companyName").value;
        const email = document.getElementById("companyEmail").value;
        const phone = document.getElementById("companyPhone").value;
        // Se trae el POST a la ruta de empresas, con datos del formulario
        const response = await fetch(
            "http://127.0.0.1:8000/companies/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone
                })
            }
        );
        // Se convierte la respuesta del JSON
        const data = await response.json();
        // Se muestra el mensaje de empresa registrada correctamente si todo sale bien
        document.getElementById("companyMessage").innerText =
            "Empresa registrada correctamente";
    });

}
// Agrega el evento de click al boton cargar empresas
const loadButton = document.getElementById("loadCompaniesBtn");
// Se inicia al hacer click en el boton
if (loadButton) {
    // Se trae los datos del GET a la ruta empresas
    loadButton.addEventListener("click", async () => {
        // Se convierte la respuesta del JSON
        const response = await fetch(
            "http://127.0.0.1:8000/companies"
        );
        
        const companies = await response.json();

        const list = document.getElementById("companiesList");
        // Se reinicia (limpia) la lista para mostrar actualizaciones
        list.innerHTML = "";
        // se recorre el array y crea un elemnto de la lista por cada una de las empresas
        companies.forEach(company => {

            const item = document.createElement("li");
            // se muestra nombre y email de las empresas de la lista
            item.innerText =
                `${company.name} - ${company.email}`;

            list.appendChild(item);
        });

    });

}

//usuarios
const createUserBtn = document.getElementById("createUserBtn");
// Agrega el evento de click al boton crear usuario
if (createUserBtn) {
    // se inicia al hacer click en el boton
    createUserBtn.addEventListener("click", async () => {
        // Se traen los valores de los inputs al form
        const name = document.getElementById("userName").value;
        const email = document.getElementById("userEmail").value;
        // Se trae el POST a la ruta de usuarios, con datos del formulario
        const response = await fetch(
            "http://127.0.0.1:8000/users/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email
                })
            }
        );
        // Se convierte la respuesta del JSON
        const data = await response.json();
        // Se muestra el mensaje de usuario registrado correctamente si todo sale bien
        document.getElementById("userMessage").innerText =
            "Usuario registrado correctamente";
    });

}
// Agrega el evento de click al boton cargar usuarios
const loadUsersBtn = document.getElementById("loadUsersBtn");
// Se inicia al hacer click en el boton
if (loadUsersBtn) {
    // Se trae los datos del GET a la ruta usuarios
    loadUsersBtn.addEventListener("click", async () => {
        // Se convierte la respuesta del JSON
        const response = await fetch(
            "http://127.0.0.1:8000/users/"
        );

        const users = await response.json();

        const list = document.getElementById("usersList");

        list.innerHTML = "";
        // se recorre el array y crea un elemnto de la lista por cada uno de los usuarios
        users.forEach(user => {

            const item = document.createElement("li");
            // se muestra nombre y email de los usuarios de la lista
            item.innerText =
                `${user.name} - ${user.email}`;

            list.appendChild(item);

        });

    });

}
//rutas
const createRouteBtn = document.getElementById("createRouteBtn");
// Agrega el evento de click al boton crear ruta
if (createRouteBtn) {
    // se inicia al hacer click en el boton
    createRouteBtn.addEventListener("click", async () => {
        // Se traen los valores de los inputs al form
        const origin =
            document.getElementById("routeOrigin").value;

        const destination =
            document.getElementById("routeDestination").value;

        const departure_time =
            document.getElementById("routeDepartureTime").value;

        const company_id =
            parseInt(
                document.getElementById("routeCompanyId").value
            );
        // Se trae el POST a la ruta de rutas, con datos del formulario
        const response = await fetch(
            "http://127.0.0.1:8000/routes/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    origin,
                    destination,
                    departure_time,
                    company_id
                })
            }
        );
        // Se convierte la respuesta del JSON
        const data = await response.json();
        // Se muestra el mensaje de ruta registrada correctamente si todo sale bien
        document.getElementById("routeMessage").innerText =
            "Ruta registrada correctamente";

    });

}
// Agrega el evento de click al boton cargar rutas
const loadRoutesBtn = document.getElementById("loadRoutesBtn");
// Se inicia al hacer click en el boton
if (loadRoutesBtn) {
    // Se trae los datos del GET a la ruta rutas
    loadRoutesBtn.addEventListener("click", async () => {
        // Se convierte la respuesta del JSON
        const response = await fetch(
            "http://127.0.0.1:8000/routes/"
        );

        const routes = await response.json();
        // se reinicia (limpia) la lista para mostrar actualizaciones
        const list =
            document.getElementById("routesList");

        list.innerHTML = "";
        // se recorre el array y crea un elemnto de la lista por cada una de las rutas
        routes.forEach(route => {
            // se crea un elemento de la lista por cada ruta
            const item =
                document.createElement("li");
            // se muestra origen, destino, hora de salida y empresa de las rutas de la lista
            item.innerText =
                `${route.origin} → ${route.destination} | ${route.departure_time} | Empresa ID: ${route.company_id}`;

            list.appendChild(item);

        });

    });

}
//reservas
const createReservationBtn =
    document.getElementById("createReservationBtn");
    // Agrega el evento de click al boton crear reserva
    if (createReservationBtn) {
        // se inicia al hacer click en el boton
        createReservationBtn.addEventListener("click", async () => {

            const seat_number =
                document.getElementById("seatNumber").value;

            const user_id =
                parseInt(
                    document.getElementById("userId").value
                );

            const route_id =
                parseInt(
                    document.getElementById("routeId").value
                );
            // Se trae el POST a la ruta de reservas, con datos del formulario
            const response = await fetch(
                "http://127.0.0.1:8000/reservations/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        seat_number,
                        user_id,
                        route_id
                    })
                }
            );
            // Se convierte la respuesta del JSON
            const data = await response.json();
            // Se muestra el mensaje de reserva creada correctamente si todo sale bien
            document.getElementById("reservationMessage").innerText =
                "Reserva creada correctamente";

        });
}

// Agrega el evento de click al boton cargar reservas
const loadReservationsBtn =
    document.getElementById("loadReservationsBtn");
// Se inicia al hacer click en el boton
if (loadReservationsBtn) {
    // Se trae los datos del GET a la ruta reservas
    loadReservationsBtn.addEventListener("click", async () => {
        // Se convierte la respuesta del JSON
        const response = await fetch(
            "http://127.0.0.1:8000/reservations/details"
        );

        const reservations =
            await response.json();

        const list =
            document.getElementById("reservationsList");

        list.innerHTML = "";
        // se recorre el array y crea un elemnto de la lista por cada una de las reservas
        reservations.forEach(reservation => {

            const item =
                document.createElement("li");
            // se muestra ID, asiento, usuario, ruta y estado de las reservas de la lista
           item.innerText =
            `ID: ${reservation.id} | Asiento: ${reservation.seat_number} | Usuario: ${reservation.user_name} | Ruta: ${reservation.route_name} | Estado: ${reservation.status}`;

            list.appendChild(item);

        });

    });

}
// Agrega el evento de click al boton confirmar reserva
const confirmReservationBtn =
    document.getElementById("confirmReservationBtn");
// Se inicia al hacer click en el boton
if (confirmReservationBtn) {
    // Se trae los datos del PUT a la ruta de confirmación de reserva
    confirmReservationBtn.addEventListener("click", async () => {
        // Se trae el ID de la reserva a confirmar del formulario
        const reservationId =
            document.getElementById(
                "reservationIdConfirm"
            ).value;
        // Se hace el PUT a la ruta de confirmación de reserva con el ID
        const response = await fetch(
            `http://127.0.0.1:8000/reservations/${reservationId}/confirm`,
            {
                method: "PUT"
            }
        );
        // Se convierte la respuesta del JSON
        const data = await response.json();
        // Se muestra el mensaje de reserva confirmada correctamente si todo sale bien
        document.getElementById(
            "confirmMessage"
        ).innerText =
            "Reserva confirmada correctamente";

    });

}

//asientos disponibles
// Agrega el evento de click al boton cargar asientos disponibles
const loadSeatsBtn =
    document.getElementById("loadSeatsBtn");
//  Se inicia al hacer click en el boton
if (loadSeatsBtn) {
    // Se trae los datos del GET a la ruta de asientos disponibles por ruta
    loadSeatsBtn.addEventListener("click", async () => {
        // Se trae el ID de la ruta del formulario
        const routeId =
            document.getElementById(
                "routeSeatsId"
            ).value;
        // Se hace el GET a la ruta de asientos disponibles por ruta con el ID
        const response = await fetch(
            `http://127.0.0.1:8000/reservations/route/${routeId}/available-seats`
        );

        const data =
            await response.json();

        const list =
            document.getElementById(
                "availableSeatsList"
            );

        list.innerHTML = "";
        // se recorre el array de asientos disponibles y crea un elemnto de la lista por cada uno
        data.available_seats.forEach(seat => {
            // se crea un elemento de la lista por cada asiento disponible
            const item =
                document.createElement("li");

            item.innerText = seat;

            list.appendChild(item);

        });

    });

}

//Dashboard

const loadDashboardBtn =
    document.getElementById("loadDashboardBtn");

if (loadDashboardBtn) {
    // Agrega un evento al click dek botón dashboard
    loadDashboardBtn.addEventListener("click", async () => {
        // Trae los datos de empresas, usuarios, rutas y reservas
        const companiesResponse =
            await fetch(
                "http://127.0.0.1:8000/companies"
            );

        const usersResponse =
            await fetch(
                "http://127.0.0.1:8000/users/"
            );

        const routesResponse =
            await fetch(
                "http://127.0.0.1:8000/routes/"
            );

        const reservationsResponse =
            await fetch(
                "http://127.0.0.1:8000/reservations/"
            );
        // Transforma las respuestas a JSON
        const companies =
            await companiesResponse.json();

        const users =
            await usersResponse.json();

        const routes =
            await routesResponse.json();

        const reservations =
            await reservationsResponse.json();
        // Refresh a los contadores del dashboard
        document.getElementById("companiesCount").innerText =
            companies.length;

        document.getElementById("usersCount").innerText =
            users.length;

        document.getElementById("routesCount").innerText =
            routes.length;

        document.getElementById("reservationsCount").innerText =
            reservations.length;

    });

}