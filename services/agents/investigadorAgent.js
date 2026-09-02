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
            const empresaNombre = p.organization?.name || 'Empresa Privada';
            const cargoPersona = p.title || 'Directivo';
            const correoPersona = p.email || 'No listado';

            let telefonoReal = '';
            if (p.phone_numbers && p.phone_numbers.length > 0) {
                telefonoReal = p.phone_numbers[0].sanitized_number || p.phone_numbers[0].raw_number || '';
            } else if (p.corporate_phone) {
                telefonoReal = p.corporate_phone;
            }

            // Si hay teléfono lo ponemos, si no, dejamos una señal clara
            const textoTelefono = telefonoReal || 'No disponible (Ver en Apollo)';

            // Construimos la URL exacta de Apollo usando el ID del prospecto
            const linkApollo = p.id ? `https://app.apollo.io/#/people/${p.id}` : 'https://app.apollo.io/#/people';

            // Estructuramos el resumen completo y detallado que se guardará en la base de datos (campo mensaje/resumen)
            const resumenCompleto = `Empresa: ${empresaNombre} | Cargo: ${cargoPersona} | Email: ${correoPersona} | Apollo: ${linkApollo}`;

            return {
                nombre: nombreLimpio,
                empresa: empresaNombre,
                cargo: cargoPersona,
                origen_id: 99,
                telefono: textoTelefono,
                calificacion: 'Alta',
                mensaje: resumenCompleto, // Mapeado directo para que coincida con la columna de inserción
                resumen: resumenCompleto  // Compatibilidad por si se usa en otra capa
            };
        });
    } catch (error) {
        console.error("Error en Apollo API:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { obtenerProspectosCrudos };