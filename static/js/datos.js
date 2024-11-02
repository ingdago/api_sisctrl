document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');  // Obtener el token del almacenamiento local

    if (token) {
        try {
            const response = await fetch('/datos', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            // Si la respuesta es válida, llamar a `loadUserData` para cargar el nombre del usuario
            if (response.ok) {
                loadUserData(token);
            } else {
                console.error('Error de autenticación');
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error:', error);
            window.location.href = '/login';
        }
    }
});


// Función para obtener los datos más recientes del servidor
function fetchData() {
    const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local

    if (!token) {
        // Redirigir al usuario a la página de inicio de sesión si no hay token
        window.location.href = "/login";
        return; // Detener la ejecución de la función
    }

    fetch("/get_latest_data", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token // Enviar el token en los encabezados
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // Actualizar los valores de los span
                document.getElementById("temperature").textContent = data.temperatura + " °C";
                document.getElementById("humidity").textContent = data.humedad + " %";
                document.getElementById("led-status").textContent = data.led_estado;
                document.getElementById("button-status").textContent = data.pulsador_estado;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function fetchTableData() {
    const token = localStorage.getItem('token');  // Obtener el token dentro de la función

    if (!token) {
        window.location.href = "/login";
        return;
    }

    fetch('/api/datos', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Verifica en la consola si los datos están llegando correctamente
            let tableBody = document.getElementById('sensorTableBody'); // Usar el nuevo ID
            tableBody.innerHTML = '';  // Limpiar la tabla antes de agregar nuevas filas

            data.sensor_data.forEach(sensor => {
                let row = `<tr>
                    <td>${sensor.temperatura} °C</td>
                    <td>${sensor.humedad} %</td>
                    <td>${sensor.led_estado}</td>
                    <td>${sensor.pulsador_estado}</td>
                    <td>${sensor.fecha_registro}</td>
                </tr>`;
                tableBody.innerHTML += row;
            });

            // Destruir la instancia anterior de DataTable si existe
            if ($.fn.dataTable.isDataTable('#sensorTable')) {
                $('#sensorTable').DataTable().destroy();
            }

            // Inicializar DataTables después de llenar la tabla
            $('#sensorTable').DataTable({
                "lengthMenu": [
                    [5, 10, 25, 50, -1],
                    [5, 10, 25, 50, "Todo"]
                ],
                "language": {
                    "lengthMenu": "Mostrar _MENU_ entradas",
                    "zeroRecords": "No se encontraron resultados",
                    "info": "Mostrando del _START_ al _END_ de _TOTAL_ entradas",
                    "infoEmpty": "No hay entradas disponibles",
                    "infoFiltered": "(filtrado de _MAX_ entradas en total)",
                    "search": "Buscar:",
                    "paginate": {
                        "first": "Primero",
                        "last": "Último",
                        "next": "Siguiente",
                        "previous": "Anterior"
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}



// Cargar los datos del usuario
function loadUserData(token) {
    fetch('/api/datos', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('No autorizado');
            }
        })
        .then(data => {
            displayUserData(data.username);
        })
        .catch(error => {
            console.error(error);
            displayLogin();
        });
}
// Función para manejar la navegación
function displayUserData(username) {
    document.getElementById('nav-links').innerHTML = `
                <li class="nav-item">
                    <a class="nav-link fw-bold">Hola,${username}</a>
                </li>
                <li class="nav-item"></li>
                    <a class="nav-link btn btn-outline-success me-2" href="/">Inicio</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link btn btn-outline-danger" href="/" onclick="logout()">Cerrar sesión</a>
                </li>
            `;
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('token');
    displayLogin();
}
// Llamar a fetchData y fetchTableData cada 3 segundos
setInterval(() => {
    fetchData();
    fetchTableData();
}, 3000);

// Llamar a fetchData y fetchTableData al cargar la página
window.onload = function () {
    fetchData();
    fetchTableData();
};