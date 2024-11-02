document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login exitoso:', data);
            localStorage.setItem('token', data.token);
            window.location.href = '/';  // Redirigir a datos.html si el login es exitoso
        } else {
            console.error('Error en el login:', data.error);
            document.getElementById('message').textContent = data.error;
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
function showMessage(message) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}

// Función para cargar elementos de navegación
function loadNavItems() {
    const navItems = document.getElementById('nav-items');

    // Simular sesión del usuario (esto debería ser dinámico)
    const userSession = false; // Cambia esto según tu lógica

    if (userSession) {
        navItems.innerHTML = `
            <li class="nav-item">
                <a class="nav-link fw-bold">Bienvenido, NombreUsuario</a>
            </li>
            <li class="nav-item">
                <a class="nav-link btn btn-outline-danger" href="/logout">Cerrar sesión</a>
            </li>
        `;
    } else {
        navItems.innerHTML = `
            <li class="nav-item">
                <a class="nav-link btn btn-outline-primary me-2" href="/login">Iniciar sesión</a>
            </li>
            <li class="nav-item">
                <a class="nav-link btn btn-outline-success" href="/register">Registrarse</a>
            </li>
        `;
    }
}

// Cargar elementos de navegación al inicio
loadNavItems();