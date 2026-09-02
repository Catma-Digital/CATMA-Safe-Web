const axios = require('axios');

async function obtenerProspectosCrudos() {
    try {
        const apiKey = process.env.APOLLO_API_KEY;

        if (!apiKey) {
            throw new Error("La variable de entorno APOLLO_API_KEY no está configurada en el servidor.");
        }

        console.log("Conectando con Apollo.io (Modo Enriquecido/Directo)...");

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
            per_page: 5,
            // Solicitamos explícitamente que tengan datos de contacto disponibles si el plan lo permite
            reveal_personal_emails: true
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'x-api-key': apiKey
            }
        });

        const personas = response.data.people || [];

        if (personas.length === 0) {
            console.log("Apollo no devolvió resultados.");
            return [];
        }

        const prospectosCrudos = personas.map(p => {
            // Si el nombre viene ofuscado, intentamos usar el correo o un identificador limpio de la empresa
            let nombreLimpio = `${p.first_name || ''} ${p.last_name || ''}`.trim();
            if (!nombreLimpio || p.last_name_obfuscated) {
                // Si Apollo oculta el apellido, usamos el nombre de pila y la empresa para identificarlo con profesionalismo
                nombreLimpio = `${p.first_name || 'Contacto'} (${p.organization?.name || 'Corporativo'})`;
            }

            // Extraer teléfono real si la API lo libera
            let telefonoReal = '';
            if (p.phone_numbers && p.phone_numbers.length > 0) {
                telefonoReal = p.phone_numbers[0].raw_number || p.phone_numbers[0].sanitized_number || '';
            }

            // Si no hay teléfono directo, dejamos una nota clara en el campo para que el asesor sepa que debe buscarlo en la ficha de la empresa
            if (!telefonoReal) {
                telefonoReal = 'Consultar en Apollo Portal';
            }

            return {
                nombre: nombreLimpio,
                empresa: p.organization?.name || 'Empresa Privada',
                cargo: p.title || 'Cargo Directivo',
                origen: 'Apollo.io (Real)',
                telefono: telefonoReal,
                interes_inicial: `Contacto verificado en ${p.organization?.name || 'empresa'}. Correo: ${p.email || 'Disponible en plataforma'}. Interés en blindaje y cajas fuertes.`
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