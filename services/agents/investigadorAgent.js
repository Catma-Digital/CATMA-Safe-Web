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
            const nombreLimpio = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Prospecto IA';

            // Extraer teléfono real si existe
            let telefonoReal = '';
            if (p.phone_numbers && p.phone_numbers.length > 0) {
                telefonoReal = p.phone_numbers[0].sanitized_number || p.phone_numbers[0].raw_number || '';
            } else if (p.corporate_phone) {
                telefonoReal = p.corporate_phone;
            }

            // Si hay ID de persona en Apollo, creamos un enlace directo al perfil; si no, al buscador general
            const apolloLink = p.id
                ? `<a href="https://app.apollo.io/#/people/${p.id}" target="_blank" style="color: #007bff; text-decoration: underline;">Ver en Apollo</a>`
                : `<a href="https://app.apollo.io/#/people" target="_blank" style="color: #007bff; text-decoration: underline;">Buscar en Apollo</a>`;

            const contactoFinal = telefonoReal || apolloLink;

            return {
                nombre: nombreLimpio,
                empresa: p.organization?.name || 'Empresa Privada',
                cargo: p.title || 'Directivo',
                origen_id: 99,
                telefono: contactoFinal,
                calificacion: 'Alta',
                resumen: `Cargo: ${p.title || 'Directivo'} | Email: ${p.email || 'No listado'} | Análisis: Interés detectado en sistemas de seguridad y cajas fuertes.`
            };
        });
    } catch (error) {
        console.error("Error en Apollo API:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { obtenerProspectosCrudos };