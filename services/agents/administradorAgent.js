import mysql from 'mysql2/promise';

// Crear la conexión usando las variables de entorno de tu .env
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

export async function guardarLeadsEnBaseDeDatos(leadsProcesados) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        for (const lead of leadsProcesados) {
            const query = `
                INSERT INTO prospectos (fecha, prospecto, origen, telefono, cargo_empresa, calificacion, interes, asignacion) 
                VALUES (NOW(), ?, ?, ?, ?, ?, ?, 'Pendiente')
            `;

            const values = [
                lead.nombre,
                lead.origen,
                lead.telefono,
                `${lead.cargo} | ${lead.empresa}`,
                lead.calificacion,
                lead.resumen
            ];

            await connection.execute(query, values);
        }

        console.log("3. Todos los leads procesados se guardaron en MySQL correctamente.");
        return { success: true, message: "Lote guardado con éxito" };

    } catch (error) {
        console.error("Error al guardar en la base de datos:", error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}