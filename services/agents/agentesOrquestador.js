const { obtenerProspectosCrudos } = require('./investigadorAgent');
const { guardarLeadsEnBaseDeDatos } = require('./administradorAgent');

async function ejecutarProcesoCompletoDeAgentes(dbPool) {
    try {
        console.log("Iniciando ejecución de agentes con Apollo.io...");
        const prospectosCrudos = await obtenerProspectosCrudos();

        if (!prospectosCrudos || prospectosCrudos.length === 0) {
            return { success: false, message: "No se obtuvieron prospectos de Apollo." };
        }

        const resultadoGuardado = await guardarLeadsEnBaseDeDatos(prospectosCrudos);
        return { success: true, count: prospectosCrudos.length, ...resultadoGuardado };
    } catch (error) {
        console.error("Error en orquestador de agentes:", error);
        throw error;
    }
}

async function procesarProspectoCompleto(datosLead, dbPool) {
    // Procesamiento individual si se requiere
    return datosLead;
}

module.exports = {
    ejecutarProcesoCompletoDeAgentes,
    procesarProspectoCompleto
};
