const { obtenerProspectosCrudos } = require('./investigadorAgent.js');
const { calificarProspecto } = require('./calificadorAgent.js');
const { guardarLeadsEnBaseDeDatos } = require('./administradorAgent.js');

/**
 * Procesa un prospecto individual paso a paso con los agentes y lo guarda en la BD.
 * Esta es la función que invoca tu index.js.
 */
async function procesarProspectoCompleto(prospecto, db) {
    try {
        console.log(`1. Calificando prospecto: ${prospecto.nombre_cliente || prospecto.nombre}...`);

        // Calificamos con el Agente Calificador (IA)
        const analisisIA = await calificarProspecto(prospecto);

        // Preparamos el objeto completo con la información analizada
        const leadProcesado = {
            ...prospecto,
            mensaje: analisisIA.resumen || prospecto.mensaje,
            id_origen: prospecto.id_origen || 'IA Apollo'
        };

        console.log("2. Guardando lead procesado en MySQL...");

        // Insertamos directamente en tu base de datos MySQL local
        const [resultado] = await db.query(
            'INSERT INTO leads (nombre_cliente, telefono, mensaje, id_origen) VALUES (?, ?, ?, ?)',
            [leadProcesado.nombre_cliente, leadProcesado.telefono, leadProcesado.mensaje, leadProcesado.id_origen]
        );

        // Retornamos el lead con el ID generado en la base de datos
        return {
            id: resultado.insertId,
            ...leadProcesado
        };

    } catch (error) {
        console.error("Error al procesar el prospecto con agentes:", error);
        throw error;
    }
}

/**
 * Ejecuta el flujo masivo completo de los agentes.
 */
async function ejecutarProcesoCompletoDeAgentes() {
    try {
        console.log("1. Investigador buscando prospectos...");
        const crudos = await obtenerProspectosCrudos();

        const resultadosProcesados = [];

        for (const lead of crudos) {
            console.log(`2. Calificando a: ${lead.nombre}...`);
            const analisisIA = await calificarProspecto(lead);

            resultadosProcesados.push({
                ...lead,
                calificacion: analisisIA.calificacion,
                cargo_analisis: analisisIA.cargo_analisis,
                resumen: analisisIA.resumen
            });
        }

        console.log("3. Pasando al Agente Administrador para guardar en MySQL...");
        await guardarLeadsEnBaseDeDatos(resultadosProcesados);

        return { success: true, total: resultadosProcesados.length };

    } catch (error) {
        console.error("Error en el flujo completo de agentes:", error);
        throw error;
    }
}

module.exports = {
    procesarProspectoCompleto,
    ejecutarProcesoCompletoDeAgentes
};