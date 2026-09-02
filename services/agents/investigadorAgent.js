const axios = require('axios');

async function obtenerProspectosCrudos() {
    try {
        const apiKey = process.env.APOLLO_API_KEY;

        if (!apiKey) {
            throw new Error("La variable de entorno APOLLO_API_KEY no está configurada en el servidor.");
        }

        console.log("Conectando con Apollo.io para buscar prospectos reales...");

        const url = 'https://api.apollo.io/api/v1/mixed_people/api_search';

        const response = await axios.post(url, {
            person_titles: [
                "Director de Seguridad Física",
                "Gerente de Adquisiciones",
                "Gerente de Compras",
                "Director de Operaciones"
            ],
            organization_locations: ["Mexico"],
            page: 1,
            per_page: 5
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'x-api-key': apiKey
            }
        });

        const personas = response.data.people || [];

        if (personas.length === 0) {
            console.log("Apollo no devolvió resultados con los filtros actuales.");
            return [];
        }

        // Mapeamos los datos reales para el orquestador
        const prospectosCrudos = personas.map(p => {
            const nombreCompleto = `${p.first_name || ''} ${p.last_name || p.last_name_obfuscated || ''}`.trim();
            return {
                nombre: nombreCompleto || 'Prospecto Apollo',
                empresa: p.organization?.name || 'Empresa Privada',
                cargo: p.title || 'Cargo Directivo',
                origen: 'Apollo API',
                telefono: '5512345678', // Apollo oculta teléfonos directos en búsqueda básica por privacidad
                interes_inicial: 'Interés detectado en soluciones corporativas, cajas fuertes y blindaje desde Apollo'
            };
        });

        return prospectosCrudos;

    } catch (error) {
        console.error("Error al consultar la API de Apollo.io:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    obtenerProspectosCrudos
};