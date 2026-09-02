const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function guardarLeadsEnBaseDeDatos(leadsProcesados) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        let guardadosNuevos = 0;

        for (const lead of leadsProcesados) {
            // Evitamos duplicados
            const [existentes] = await connection.execute(
                'SELECT id FROM leads WHERE nombre_cliente = ? AND mensaje LIKE ?',
                [lead.nombre, `%${lead.empresa}%`]
            );

            if (existentes.length > 0) {
                continue;
            }

            const query = `
                INSERT INTO leads (nombre_cliente, telefono, mensaje, id_origen) 
                VALUES (?, ?, ?, ?)
            `;

            const mensajeCalificacion = `[Calificación: ${lead.calificacion || 'Alta'}] Empresa: ${lead.empresa} | Cargo: ${lead.cargo} | Análisis: ${lead.resumen || lead.interes_inicial}`;

            const values = [
                lead.nombre,
                lead.telefono || 'Consultar en Apollo',
                mensajeCalificacion,
                'Apollo.io' // Esto obliga a que el index.js los reconozca para la tabla superior
            ];

            await connection.execute(query, values);
            guardadosNuevos++;
        }

        return { success: true, message: `Se generaron ${guardadosNuevos} prospectos nuevos` };

    } catch (error) {
        console.error("Error al guardar en la base de datos:", error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

module.exports = {
    guardarLeadsEnBaseDeDatos
};