require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcryptjs');

// Importación del orquestador necesaria para los agentes
const { procesarProspectoCompleto } = require('./services/agents/agentesOrquestador');

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

// --- 2. CONEXIÓN A BASE DE DATOS (MYSQL LOCAL / PROPIO) ---
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'catma_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- 3. ARCHIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, 'landings', 'home_Catma')));
app.use('/portal_Catma', express.static(path.join(__dirname, 'portal_Catma')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/cajas', express.static(path.join(__dirname, 'landings', 'cajas_Catma')));
app.use('/corte', express.static(path.join(__dirname, 'landings', 'corte_Catma')));
app.use('/servicios', express.static(path.join(__dirname, 'landings', 'servicios_Catma')));
app.use('/descargas', express.static(path.join(__dirname, 'descargas')));

// --- 4. RUTAS PRINCIPALES Y AUTH ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'landings', 'home_Catma', 'index.html')));
app.get('/admin', (req, res) => {
    if (req.session.user) res.sendFile(path.join(__dirname, 'portal_Catma', 'admin.html'));
    else res.redirect('/auth/login');
});
app.get('/auth/login', (req, res) => res.sendFile(path.join(__dirname, 'portal_Catma', 'login.html')));

app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

// --- 5. APIs DE AUTENTICACIÓN Y USUARIOS ---
app.post('/auth/login', async (req, res) => {
    const { user, pass } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [user]);
        if (rows.length > 0 && await bcrypt.compare(pass, rows[0].password_hash)) {
            req.session.user = { id: rows[0].id, rol: rows[0].rol };
            res.redirect('/admin');
        } else {
            res.send('Usuario o contraseña incorrectos. <a href="/portal_Catma/login.html">Volver</a>');
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Información del usuario en sesión (Requerido por admin.html)
app.get('/api/usuario/info', (req, res) => {
    if (req.session.user) {
        res.json({ rol: req.session.user.rol });
    } else {
        res.json({ rol: 'invitado' });
    }
});

// Lista de usuarios (Panel de administración)
app.get('/api/usuarios/lista', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, rol FROM usuarios');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear usuario
app.post('/api/usuarios/crear', async (req, res) => {
    try {
        const { username, password, rol } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        await db.query('INSERT INTO usuarios (username, password_hash, rol) VALUES (?, ?, ?)', [username, hash, rol || 'editor']);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Borrar usuario
app.post('/api/usuarios/borrar', async (req, res) => {
    try {
        const { id } = req.body;
        await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 6. APIs DE NEGOCIO (LEADS, ASESORES, BOLSA) ---

// Obtener leads normales (Exclusivo para Landings: IDs numéricos o nulos)
app.get('/api/leads', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM leads 
            WHERE id_origen REGEXP '^[0-9]+$' 
            OR id_origen IS NULL 
            ORDER BY id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/ver-leads', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM leads 
            WHERE id_origen REGEXP '^[0-9]+$' 
            OR id_origen IS NULL 
            ORDER BY id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 6.1 APIS DE GESTIÓN DE LEADS DE IA (Filtrados por Origen en texto real) ---
app.get('/api/leads-ia', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM leads 
            WHERE id_origen NOT REGEXP '^[0-9]+$' 
            AND id_origen IS NOT NULL 
            ORDER BY id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/borrar-todos-ia', async (req, res) => {
    try {
        await db.query(`
            DELETE FROM leads 
            WHERE id_origen NOT REGEXP '^[0-9]+$' 
            AND id_origen IS NOT NULL
        `);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/asignar-todos-ia', async (req, res) => {
    try {
        const { nombre_asesor } = req.body;
        await db.query(`
            UPDATE leads SET nombre_asesor = ? 
            WHERE id_origen NOT REGEXP '^[0-9]+$' 
            AND id_origen IS NOT NULL
        `, [nombre_asesor]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// -------------------------------------------------------------

// Borrar Lead Individual
app.delete('/api/borrar-lead/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Asignar Lead a Asesor
app.post('/api/asignar-lead', async (req, res) => {
    try {
        const { id_lead, nombre_asesor } = req.body;
        await db.query('UPDATE leads SET nombre_asesor = ? WHERE id = ?', [nombre_asesor, id_lead]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener Asesores
app.get('/api/asesores', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM asesores');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear Asesor
app.post('/api/asesores/crear', async (req, res) => {
    try {
        const { nombre, telefono } = req.body;
        await db.query('INSERT INTO asesores (nombre, telefono) VALUES (?, ?)', [nombre, telefono]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Borrar Asesor
app.delete('/api/borrar-asesor/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM asesores WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener Bolsa de Trabajo / Candidatos
app.get('/api/ver-bolsa', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM bolsa_trabajo ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Borrar Candidato
app.delete('/api/borrar-candidato/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM bolsa_trabajo WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 7. ENDPOINTS DE AGENTES IA ---
app.post('/api/agentes/ejecutar-prospeccion', async (req, res) => {
    try {
        const leadCreado = await procesarProspectoCompleto(req.body, db);
        res.json({ success: true, message: 'Procesado exitosamente', lead: leadCreado });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/agentes/ejecutar-prospeccion-demo', async (req, res) => {
    try {
        const fuentes = ['IA Apollo', 'LinkedIn', 'Google Ads', 'Base Comercial', 'Directorio Web'];
        const intereses = [
            'Interesado en blindaje de unidades y seguridad corporativa (Calificación: Alto)',
            'Busca cotización para equipos de control de acceso (Calificación: Medio)',
            'Requiere consultoría en seguridad física e industrial (Calificación: Alto)',
            'Interesado en pólizas de mantenimiento nivel oro (Calificación: Bajo)',
            'Busca blindaje arquitectónico para sucursales (Calificación: Alto)'
        ];

        let leadsCreados = [];

        // Generar 7 leads de prospección identificados por su origen real limpio
        for (let i = 1; i <= 7; i++) {
            const fuenteAleatoria = fuentes[Math.floor(Math.random() * fuentes.length)];
            const interesAleatorio = intereses[Math.floor(Math.random() * intereses.length)];

            const prospecto = {
                nombre_cliente: `Prospecto IA ${i} (${fuenteAleatoria})`,
                telefono: `551234560${i}`,
                mensaje: interesAleatorio,
                id_origen: fuenteAleatoria
            };

            const lead = await procesarProspectoCompleto(prospecto, db);
            leadsCreados.push(lead);
        }

        return res.status(200).json({ success: true, count: leadsCreados.length, leads: leadsCreados });
    } catch (error) {
        console.error('Error detallado en lote de agentes:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));