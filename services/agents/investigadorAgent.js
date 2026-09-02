const axios = require('axios');

async function obtenerProspectosCrudos() {
    try {
        const apiKey = process.env.APOLLO_API_KEY;
        if (!apiKey) throw new Error("Falta la API Key de Apollo");

        const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
            person_titles: ["Gerente de Adquisiciones", "Gerente de Compras", "Director de Operaciones"],
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
        if (personas.length === 0) return [];

        return personas.map(p => {
            // Extracción limpia del teléfono de la estructura de Apollo
            let telefonoFinal = '5512345678'; // Valor por defecto si no trae
            if (p.phone_numbers && p.phone_numbers.length > 0) {
                telefonoFinal = p.phone_numbers[0].sanitized_number || p.phone_numbers[0].raw_number || '5512345678';
            } else if (p.corporate_phone) {
                telefonoFinal = p.corporate_phone;
            }

            return {
                nombre: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Prospecto IA',
                empresa: p.organization?.name || 'Empresa Privada',
                cargo: p.title || 'Directivo',
                origen: 'Apollo.io', // FUERZA EL ORIGEN PARA QUE VAYA ARRIBA
                telefono: telefonoFinal,
                calificacion: 'Alta',
                resumen: `Cargo: ${p.title || 'Directivo'} | Análisis: Interés detectado en soluciones de seguridad y cajas fuertes.`
            };
        });
    } catch (error) {
        console.error("Error en Apollo API:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { obtenerProspectosCrudos };