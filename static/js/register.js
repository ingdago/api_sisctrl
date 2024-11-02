document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();  // Previene el envío del formulario por defecto
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',  // Enviando como URL-encoded
            },
            body: new URLSearchParams({
                username: username,
                password: password
            })  // Convierte los datos a URL-encoded
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('message').textContent = data.message;  // Mensaje de éxito
            // Redirigir a la página de inicio de sesión si es necesario
        } else {
            document.getElementById('message').textContent = data.error;  // Mostrar error
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
