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
            // Evita duplicados verificando si ya existe el nombre y la empresa
            const [existentes] = await connection.execute(
                'SELECT id FROM leads WHERE nombre_cliente = ? AND mensaje LIKE ?',
                [lead.nombre, `%${lead.empresa}%`]
            );

            if (existentes.length > 0) {
                console.log(`Lead duplicado omitido: ${lead.nombre}`);
                continue;
            }

            // Al usar texto plano ('Apollo.io'), el backend lo clasifica automáticamente para la tabla superior (Agentes IA)
            const origenIA = lead.origen && lead.origen.trim() !== '' ? lead.origen : 'Apollo.io';

            const query = `
                INSERT INTO leads (nombre_cliente, telefono, mensaje, id_origen) 
                VALUES (?, ?, ?, ?)
            `;

            // Formato estructurado para la columna de Interés / Calificación superior
            const interesCalificacion = `[Calificación: ${lead.calificacion || 'Alta'}] Empresa: ${lead.empresa} | Cargo: ${lead.cargo} | Análisis: ${lead.resumen || lead.interes_inicial}`;

            const values = [
                lead.nombre,
                lead.telefono && lead.telefono.trim() !== '' ? lead.telefono : 'Consultar en Apollo',
                interesCalificacion,
                origenIA
            ];

            await connection.execute(query, values);
            guardadosNuevos++;
        }

        console.log(`3. Se guardaron ${guardadosNuevos} leads de IA en la sección superior.`);
        return { success: true, message: `Se generaron ${guardadosNuevos} prospectos nuevos` };

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