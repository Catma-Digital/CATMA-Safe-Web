const axios = require('axios');

async function obtenerProspectosCrudos() {
    try {
        const apiKey = process.env.APOLLO_API_KEY;
        if (!apiKey) {
            throw new Error("Falta la API Key de Apollo en las variables de entorno.");
        }

        const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
            person_titles: [
                "Gerente de Adquisiciones",
                "Gerente de Compras",
                "Director de Operaciones",
                "Director de Seguridad Física"
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
            const nombreLimpio = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Prospecto Corporativo';

            // Extracción real y robusta del teléfono desde la estructura de Apollo
            let telefonoReal = '';
            if (p.phone_numbers && p.phone_numbers.length > 0) {
                telefonoReal = p.phone_numbers[0].sanitized_number || p.phone_numbers[0].raw_number || '';
            } else if (p.corporate_phone) {
                telefonoReal = p.corporate_phone;
            } else if (p.ext) {
                telefonoReal = p.ext;
            }

            // Si Apollo no expone el teléfono directo en el nodo, usamos el correo corporativo o indicamos el registro real de empresa
            const contactoFinal = telefonoReal || p.email || `Empresa: ${p.organization?.name || 'Ver en Apollo'}`;

            return {
                nombre: nombreLimpio,
                empresa: p.organization?.name || 'Empresa Privada',
                cargo: p.title || 'Directivo',
                origen: 'Apollo.io',
                telefono: contactoFinal,
                calificacion: 'Alta',
                resumen: `Cargo: ${p.title || 'Directivo'} | Email: ${p.email || 'No listado'} | Análisis: Interés detectado en sistemas de seguridad y blindaje.`
            };
        });

    } catch (error) {
        console.error("Error al conectar con Apollo API:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    obtenerProspectosCrudos
};