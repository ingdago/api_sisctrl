
// Función para verificar si el usuario está autenticado
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        loadUserData(token);
    } else {
        displayLogin();
    }
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


// Mostrar datos del usuario
function displayUserData(username) {
    document.getElementById('welcome-message').innerHTML = `
                <h4 class="display-6 mb-6">Sistema de control comunicado con una API y aplicativo web.</h4>
                <div class="col-md-6 mb-4 d-flex justify-content-center">
                    <img src="img/ESP32.jpg" alt="Descripción" class="img-fluid">
                </div>
                <div class="col-md-6 mb-4 d-flex justify-content-center">
                    <div class="card shadow-sm">
                        <img src="img/sensor.jpeg" class="card-img-top" style="width: 130px;">
                        <div class="card-body">
                            <h5 class="card-title">Sensor DHT11</h5>
                            <p class="card-text">El DHT11 es un sensor de temperatura y humedad muy utilizado en proyectos de electrónica y domótica. Algunas de sus características son: 
                            <ul>
                                    <li >Mediciones: Mide temperatura (0 a 50 °C) y humedad (20 a 80%).</li>
                                    <li >Precisión:Temperatura: ±2 °C y Humedad: ±5% RH</li>
                                    <li>Interfaz: Protocolo de comunicación digital de un solo hilo.</li>
                                    <li >Alimentación: Generalmente se alimenta con 3 a 5V.</li>
                                    <li >Tiempo de respuesta: Aproximadamente 1 segundo.</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <a class="btn btn-outline-success btn-lg" href="/datos">Vive La Experiencia.</a>
            `;
    document.getElementById('nav-links').innerHTML = `
                <li class="nav-item">
                    <a class="nav-link fw-bold">Hola, ${username}</a>
                </li>
                <li class="nav-item"></li>
                            <a class="nav-link btn btn-outline-success me-2" href="/datos">Experimenta</a>
                        </li>
                <li class="nav-item">
                    <a class="nav-link btn btn-outline-danger" href="#" onclick="logout()">Cerrar sesión</a>
                </li>
            `;
}

// Mostrar formulario de inicio de sesión
function displayLogin() {
    document.getElementById('welcome-message').innerHTML = `
                <h1 class="display-4 mb-4">Bienvenido</h1>
                <p class="lead mb-4">Por favor, inicia sesión o regístrate para continuar.</p>
                <div class="d-flex justify-content-center">
                    <a class="btn btn-primary me-2" href="/login">Iniciar sesión</a>
                    <a class="btn btn-success" href="/register">Registrarse</a>
                </div>
            `;
    document.getElementById('nav-links').innerHTML = '';
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('token');
    displayLogin();
}

// Ejecutar la función al cargar la página
window.onload = checkAuth;
