const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
    host: 'byie4mcdcn9ptejhcjyj-mysql.services.clever-cloud.com',
    user: 'um57melfw8ke4veq',
    password: 'iZt7LYmLMixXqpwa8D49',
    database: 'byie4mcdcn9ptejhcjyj',
    port: 3306,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));


app.set('view engine', 'ejs'); // Usa EJS para renderizar las vistas

// Ruta principal
app.get('/', (req, res) => {
    res.render('index'); // Asegúrate de tener el archivo index.ejs en tu carpeta views
});
app.get('/login', (req, res) => {
    res.render('login'); // Asegúrate de tener un archivo login.ejs en tu carpeta views
});
app.get('/register', (req, res) => {
    res.render('register'); // 
});
app.get('/datos', (req, res) => {
    res.render('datos'); // 
});

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.execute('SELECT * FROM usuarios WHERE users = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        const user = results[0];

        if (!user || !bcrypt.compareSync(password, user.pass)) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ user_id: user.id, username: user.users }, 'secret_key', { expiresIn: '1h' });
        return res.json({ token, username: user.users });
    });
});

// Ruta de registro
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.execute('INSERT INTO usuarios (users, pass) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        return res.status(201).json({ message: 'Registro exitoso!' });
    });
});

// Ruta de cierre de sesión
app.get('/logout', (req, res) => {
    // Aquí puedes manejar la lógica de cierre de sesión
    res.redirect('/');
});

// Ruta de datos
app.get('/datos', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token) {
        jwt.verify(token, 'secret_key', (err, decoded) => {
            if (err) return res.redirect('/login');

            db.query('SELECT temperatura, humedad, led_estado, pulsador_estado, fecha_registro FROM datos_sensor ORDER BY fecha_registro asc    ', (err, sensorData) => {
                if (err) return res.status(500).json({ error: 'Error en la base de datos' });
                res.render('datos', { sensorData }); // Asegúrate de tener el archivo datos.ejs en tu carpeta views
            });
        });
    } else {
        return res.redirect('/login');
    }
});

// Ruta API para datos
app.get('/api/datos', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(403).json({ error: 'No autorizado' });

    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) return res.status(403).json({ error: 'No autorizado' });

        // Usar el ID del usuario decodificado para obtener su información desde la base de datos
        db.query('SELECT users FROM usuarios WHERE id = ?', [decoded.user_id], (err, results) => {
            if (err || results.length === 0) return res.status(500).json({ error: 'Error en la base de datos' });

            const username = results[0].users;

            db.query('SELECT temperatura, humedad, led_estado, pulsador_estado, fecha_registro FROM datos_sensor ORDER BY fecha_registro DESC', (err, sensorData) => {
                if (err) return res.status(500).json({ error: 'Error en la base de datos' });

                const sensorDataList = sensorData.map(row => ({
                    temperatura: row.temperatura,
                    humedad: row.humedad,
                    led_estado: row.led_estado ? 'Encendido' : 'Apagado',
                    pulsador_estado: row.pulsador_estado ? 'Presionado' : 'No presionado',
                    fecha_registro: row.fecha_registro.toISOString().slice(0, 19).replace('T', ' '),
                }));

                // Enviar username junto con sensor_data
                return res.json({ username, sensor_data: sensorDataList });
            });
        });
    });
});


// Ruta para obtener los últimos datos
app.get('/get_latest_data', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(403).json({ error: 'No autorizado' });

    jwt.verify(token, 'secret_key', (err) => {
        if (err) return res.status(403).json({ error: 'No autorizado' });

        db.query('SELECT temperatura, humedad, led_estado, pulsador_estado FROM datos_sensor ORDER BY fecha_registro DESC LIMIT 1', (err, latestData) => {
            if (err) return res.status(500).json({ error: 'Error en la base de datos' });

            if (latestData.length > 0) {
                const data = latestData[0];
                return res.json({
                    temperatura: data.temperatura,
                    humedad: data.humedad,
                    led_estado: data.led_estado ? 'Encendido' : 'Apagado',
                    pulsador_estado: data.pulsador_estado ? 'Presionado' : 'No presionado',
                });
            } else {
                return res.status(404).json({ error: 'No se encontraron datos.' });
            }
        });
    });
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
