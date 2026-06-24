require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();

// --- 1. CONFIGURACIONES GENERALES ---
app.use(session({
    secret: 'CATMA_2026_SECRET',
    resave: false,
    saveUninitialized: false
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. CONEXIÓN A BASE DE DATOS (AIVEN) ---
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- 3. ARCHIVOS ESTÁTICOS Y RUTAS ---
app.use(express.static(path.join(__dirname, 'landings', 'home_Catma')));
app.use('/portal_Catma', express.static(path.join(__dirname, 'portal_Catma')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/cajas', express.static(path.join(__dirname, 'landings', 'cajas_Catma')));
app.use('/corte', express.static(path.join(__dirname, 'landings', 'corte_Catma')));
app.use('/servicios', express.static(path.join(__dirname, 'landings', 'servicios_Catma')));
app.use('/descargas', express.static(path.join(__dirname, 'descargas')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'landings', 'home_Catma', 'index.html')));
app.get('/cajas', (req, res) => res.sendFile(path.join(__dirname, 'landings', 'cajas_Catma', 'index.html')));
app.get('/corte', (req, res) => res.sendFile(path.join(__dirname, 'landings', 'corte_Catma', 'index.html')));
app.get('/servicios', (req, res) => res.sendFile(path.join(__dirname, 'landings', 'servicios_Catma', 'index.html')));

app.get('/admin', (req, res) => {
    if (req.session.user) res.sendFile(path.join(__dirname, 'portal_Catma', 'admin.html'));
    else res.sendFile(path.join(__dirname, 'portal_Catma', 'login.html'));
});

// --- 4. LÓGICA DE NEGOCIO (APIs y AUTH) ---
app.post('/api/registro-lead', async (req, res) => {
    try {
        const { nombre_cliente, telefono, mensaje, id_origen } = req.body;
        await db.query("INSERT INTO leads (nombre_cliente, telefono, mensaje, id_origen, fecha) VALUES (?, ?, ?, ?, NOW())",
            [nombre_cliente, telefono, mensaje, id_origen]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/auth/login', async (req, res) => {
    const { user, pass } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [user]);
        if (rows.length > 0 && await bcrypt.compare(pass, rows[0].password_hash)) {
            req.session.user = { id: rows[0].id, rol: rows[0].rol };
            res.redirect('/admin');
        } else { res.send('Usuario o contraseña incorrectos. <a href="/portal_Catma/login.html">Volver</a>'); }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/auth/logout', (req, res) => req.session.destroy(() => res.redirect('/portal_Catma/login.html')));

app.get('/api/usuario/info', (req, res) => res.json(req.session.user ? { rol: req.session.user.rol } : { rol: 'guest' }));

app.get('/api/usuarios/lista', async (req, res) => {
    if (req.session.user?.rol !== 'admin') return res.status(403).json({ error: "No autorizado" });
    const [rows] = await db.query('SELECT id, username, rol FROM usuarios');
    res.json(rows);
});

app.post('/api/usuarios/crear', async (req, res) => {
    if (req.session.user?.rol !== 'admin') return res.status(403).send("No autorizado");
    try {
        const { username, password, rol } = req.body;
        const hash = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO usuarios (username, password_hash, rol) VALUES (?, ?, ?)', [username, hash, rol]);
        res.redirect('/admin');
    } catch (err) { res.status(500).send("Error: " + err.message); }
});

app.post('/api/usuarios/borrar', async (req, res) => {
    if (req.session.user?.rol !== 'admin') return res.status(403).send("No autorizado");
    await db.query('DELETE FROM usuarios WHERE id = ?', [req.body.id]);
    res.redirect('/admin');
});

app.get('/api/ver-leads', async (req, res) => {
    if (req.session.user?.rol !== 'admin') return res.status(403).json({ error: "No autorizado" });
    try { const [rows] = await db.query("SELECT * FROM leads ORDER BY fecha DESC"); res.json(rows); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/asignar-lead', async (req, res) => {
    if (req.session.user?.rol !== 'admin') return res.status(403).json({ error: "No autorizado" });
    try {
        const { id_lead, nombre_asesor } = req.body;
        await db.query("UPDATE leads SET nombre_asesor = ? WHERE id = ?", [nombre_asesor, id_lead]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/asesores', async (req, res) => {
    if (req.session.user?.rol !== 'admin') return res.status(403).json({ error: "No autorizado" });
    try { const [rows] = await db.query("SELECT * FROM asesores"); res.json(rows); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/asesores/crear', async (req, res) => {
    if (req.session.user?.rol !== 'admin') return res.status(403).send("No autorizado");
    try {
        const { nombre, telefono } = req.body;
        await db.query('INSERT INTO asesores (nombre, telefono) VALUES (?, ?)', [nombre, telefono]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/ver-bolsa', async (req, res) => {
    try { const [rows] = await db.query("SELECT * FROM vacantes ORDER BY fecha DESC"); res.json(rows); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/registro-bolsa', upload.single('cv'), async (req, res) => {
    try {
        const { nombre, telefono, correo, puesto } = req.body;
        const archivo = req.file ? req.file.filename : null;
        if (!archivo) return res.status(400).json({ error: "Archivo no recibido" });
        await db.query("INSERT INTO vacantes (nombre, telefono, correo, puesto, cv_path, fecha) VALUES (?,?,?,?,?,NOW())",
            [nombre, telefono, correo, puesto, archivo]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/borrar-candidato/:id', async (req, res) => {
    try { await db.query("DELETE FROM vacantes WHERE id = ?", [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/borrar-lead/:id', async (req, res) => {
    if (req.session.user?.rol !== 'admin') return res.status(403).json({ error: "No autorizado" });
    try { await db.query("DELETE FROM leads WHERE id = ?", [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/borrar-asesor/:id', async (req, res) => {
    if (req.session.user?.rol !== 'admin') return res.status(403).json({ error: "No autorizado" });
    try { await db.query("DELETE FROM asesores WHERE id = ?", [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});