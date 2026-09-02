const mysql = require('mysql2/promise');

// Crear la conexión usando las variables de entorno de tu .env
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

        for (const lead of leadsProcesados) {
            // Adaptado para guardar directamente en la tabla 'leads' existente
            const query = `
                INSERT INTO leads (nombre_cliente, telefono, mensaje, id_origen) 
                VALUES (?, ?, ?, ?)
            `;

            // Estructuramos el mensaje combinando la información de la IA y el cargo para que se vea completo en el panel
            const mensajeCompleto = `Empresa: ${lead.empresa} | Cargo: ${lead.cargo} | Calificación: ${lead.calificacion} | Análisis: ${lead.resumen}`;

            const values = [
                lead.nombre,
                lead.telefono || '5512345678',
                mensajeCompleto,
                lead.origen || 'Apollo API'
            ];

            await connection.execute(query, values);
        }

        console.log("3. Todos los leads procesados se guardaron en la tabla 'leads' de My   SQL correctamente.");
        return { success: true, message: "Lote guardado con éxito" };

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