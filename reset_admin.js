const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function reset() {
    try {
        // 1. Conexión
        const db = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'Catma2026',
            database: 'catma_db'
        });

        // 2. Crear tabla por seguridad
        await db.execute(`CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            rol VARCHAR(20) DEFAULT 'editor'
        )`);

        // 3. Crear el admin
        const hash = await bcrypt.hash('12345', 10);
        await db.execute('DELETE FROM usuarios WHERE username = ?', ['admin']);
        await db.execute('INSERT INTO usuarios (username, password_hash, rol) VALUES (?, ?, ?)',
            ['admin', hash, 'admin']);

        console.log('✅ ÉXITO: Usuario "admin" creado con contraseña "12345"');
        process.exit();
    } catch (err) {
        console.error('❌ ERROR:', err.message);
        process.exit(1);
    }
}

reset();