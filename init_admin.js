const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
    const db = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'Catma2026',
        database: 'catma_db'
    });

    // --- AQUÍ PONES TU CONTRASEÑA PERSONALIZADA ---
    const nuevaPassword = 'TU_CONTRASEÑA_AQUÍ';
    // -----------------------------------------------

    const hash = await bcrypt.hash(nuevaPassword, 10);

    await db.query('UPDATE usuarios SET password_hash = ? WHERE username = ?', [hash, 'admin']);

    console.log('¡Contraseña personalizada de admin configurada!');
    process.exit();
}

resetAdmin();