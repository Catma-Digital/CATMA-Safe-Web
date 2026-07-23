const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAgentesDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Catma2026',
            database: process.env.DB_NAME || 'catma_db'
        });

        console.log('Conectado a la base de datos. Creando tablas para agentes IA...');

        // Tabla para las sesiones de chat de los asistentes
        await connection.query(`
            CREATE TABLE IF NOT EXISTS agente_conversaciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                prospecto_id INT NULL,
                canal VARCHAR(50) DEFAULT 'web',
                estado VARCHAR(50) DEFAULT 'activo',
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla para el historial de mensajes de los agentes
        await connection.query(`
            CREATE TABLE IF NOT EXISTS agente_mensajes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                conversacion_id INT,
                remitente ENUM('user', 'assistant', 'system') NOT NULL,
                mensaje TEXT NOT NULL,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversacion_id) REFERENCES agente_conversaciones(id) ON DELETE CASCADE
            )
        `);

        console.log('¡Tablas de agentes creadas exitosamente!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error al configurar la base de datos para agentes:', error);
        process.exit(1);
    }
}

setupAgentesDB();