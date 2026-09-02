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
            const [existentes] = await connection.execute(
                'SELECT id FROM leads WHERE nombre_cliente = ? AND mensaje LIKE ?',
                [lead.nombre, `%${lead.empresa}%`]
            );

            if (existentes.length > 0) continue;

            const query = `
                INSERT INTO leads (nombre_cliente, telefono, mensaje, id_origen) 
                VALUES (?, ?, ?, ?)
            `;

            const mensajeCalificacion = `[Calificación: ${lead.calificacion}] Empresa: ${lead.empresa} | ${lead.resumen}`;

            const values = [
                lead.nombre,
                lead.telefono,
                mensajeCalificacion,
                99 // 99 manda el registro directamente a la tabla superior de IA
            ];

            await connection.execute(query, values);
            guardadosNuevos++;
        }
        return { success: true, message: `Guardados ${guardadosNuevos} leads` };
    } catch (error) {
        console.error("Error al guardar:", error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

module.exports = { guardarLeadsEnBaseDeDatos };