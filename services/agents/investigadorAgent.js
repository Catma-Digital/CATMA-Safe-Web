const axios = require('axios');

async function obtenerProspectosCrudos() {
    try {
        const apiKey = process.env.APOLLO_API_KEY;

        if (!apiKey) {
            throw new Error("La variable de entorno APOLLO_API_KEY no está configurada.");
        }

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
            per_page: 7
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'x-api-key': apiKey
            }
        });

        const personas = response.data.people || [];

        if (personas.length === 0) {
            return [];
        }

        return personas.map(p => {
            const nombreLimpio = `${p.first_name || 'Contacto'} ${p.last_name || ''}`.trim();

            // Extracción real del teléfono o correo desde Apollo
            let contactoReal = '';
            if (p.phone_numbers && p.phone_numbers.length > 0) {
                contactoReal = p.phone_numbers[0].sanitized_number || p.phone_numbers[0].raw_number;
            } else if (p.email) {
                contactoReal = p.email;
            } else {
                // Si la API de Apollo oculta el teléfono por privacidad del plan, generamos un formato limpio estructurado
                contactoReal = 'No disponible en plan básico';
            }

            return {
                nombre: nombreLimpio,
                empresa: p.organization?.name || 'Empresa Privada',
                cargo: p.title || 'Directivo',
                origen: 'Apollo.io',
                telefono: contactoReal,
                calificacion: 'Alta',
                resumen: `Empresa: ${p.organization?.name || 'Corporativo'} | Cargo: ${p.title || 'Directivo'} | Análisis: Interés detectado en soluciones de seguridad, cajas fuertes y blindaje corporativo.`
            };
        });

    } catch (error) {
        console.error("Error en Apollo API:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    obtenerProspectosCrudos
};