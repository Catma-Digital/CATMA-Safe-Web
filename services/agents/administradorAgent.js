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
            // 1. Verificamos si ya existe un lead con el mismo nombre y empresa para evitar duplicados exactos
            const [existentes] = await connection.execute(
                'SELECT id FROM leads WHERE nombre_cliente = ? AND id_origen = ?',
                [lead.nombre, lead.origen]
            );

            if (existentes.length > 0) {
                console.log(`Lead duplicado omitido: ${lead.nombre}`);
                continue; // Salta este registro si ya existe para evitar duplicados
            }

            // 2. Insertamos asegurando que el id_origen sea de IA (para que el frontend superior lo lea correctamente)
            const query = `
                INSERT INTO leads (nombre_cliente, telefono, mensaje, id_origen) 
                VALUES (?, ?, ?, ?)
            `;

            const mensajeCompleto = `Empresa: ${lead.empresa} | Cargo: ${lead.cargo} | Calificación: ${lead.calificacion} | Análisis: ${lead.resumen}`;

            const values = [
                lead.nombre,
                lead.telefono || 'Consultar Apollo',
                mensajeCompleto,
                lead.origen || 'Apollo.io'
            ];

            await connection.execute(query, values);
            guardadosNuevos++;
        }

        console.log(`3. Se guardaron ${guardadosNuevos} leads nuevos de IA sin duplicados.`);
        return { success: true, message: `Se agregaron ${guardadosNuevos} prospectos nuevos` };

    } catch (error) {
        console.error("Error al guardar en la base de datos:", error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

module.exports = {
    guardarLeadsEnBaseDeDatos
};