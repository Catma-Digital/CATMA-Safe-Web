const axios = require('axios');

async function obtenerProspectosCrudos() {
    try {
        const apiKey = process.env.APOLLO_API_KEY;
        if (!apiKey) throw new Error("Falta la API Key de Apollo");

        // Generar un número de página aleatorio entre 1 y 15 para traer diferentes prospectos en cada lote
        const paginaAleatoria = Math.floor(Math.random() * 15) + 1;

        const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
            person_titles: [
                "Gerente de Adquisiciones",
                "Gerente de Compras",
                "Director de Operaciones",
                "Gerente de Ventas",
                "Director General"
            ],
            organization_locations: ["Mexico"],
            page: paginaAleatoria,
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

            let telefonoReal = '';
            if (p.phone_numbers && p.phone_numbers.length > 0) {
                telefonoReal = p.phone_numbers[0].sanitized_number || p.phone_numbers[0].raw_number || '';
            } else if (p.corporate_phone) {
                telefonoReal = p.corporate_phone;
            }

            // Texto plano limpio indicando que se consulte en Apollo si no hay teléfono
            const textoTelefono = telefonoReal || 'No disponible (Ver en Apollo)';

            return {
                nombre: nombreLimpio,
                empresa: p.organization?.name || 'Empresa Privada',
                cargo: p.title || 'Directivo',
                origen_id: 99,
                telefono: textoTelefono,
                calificacion: 'Alta',
                resumen: `Cargo: ${p.title || 'Directivo'} | Email: ${p.email || 'No listado'} | Perfil Apollo: ${p.id ? `https://app.apollo.io/#/people/${p.id}` : 'https://app.apollo.io/#/people'}`
            };
        });
    } catch (error) {
        console.error("Error en Apollo API:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { obtenerProspectosCrudos };