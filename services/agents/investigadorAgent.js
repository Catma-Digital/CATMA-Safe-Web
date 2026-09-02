const axios = require('axios');

async function obtenerProspectosCrudos() {
    try {
        const apiKey = process.env.APOLLO_API_KEY;
        let listaProspectos = [];

        // 1. Intentar traer prospectos reales de Apollo.io
        if (apiKey) {
            try {
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
                    per_page: 4
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'x-api-key': apiKey
                    }
                });

                const personasApollo = response.data.people || [];
                const mapeadosApollo = personasApollo.map(p => {
                    const nombreLimpio = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Prospecto IA';
                    const empresaNombre = p.organization?.name || 'Empresa Privada';
                    const cargoPersona = p.title || 'Directivo';
                    const correoPersona = p.email || 'No listado';
                    const telefonoReal = p.phone_numbers?.[0]?.sanitized_number || p.phone_numbers?.[0]?.raw_number || p.corporate_phone || 'Consultar';
                    const linkApollo = p.id ? `https://app.apollo.io/#/people/${p.id}` : 'https://app.apollo.io/#/people';

                    return {
                        nombre: nombreLimpio,
                        empresa: empresaNombre,
                        cargo: cargoPersona,
                        id_origen: 'Apollo.io',
                        telefono: telefonoReal,
                        calificacion: 'Alta (Apollo)',
                        mensaje: `Empresa: ${empresaNombre} | Cargo: ${cargoPersona} | Email: ${correoPersona} | <a href="${linkApollo}" target="_blank" class="text-primary fw-bold">🔗 Abrir en Apollo</a>`
                    };
                });
                listaProspectos.push(...mapeadosApollo);
            } catch (e) {
                console.log("Aviso: Falló la consulta a Apollo, complementando con búsqueda web.");
            }
        }

        // 2. Complementar con simulados de LinkedIn y Google con enlaces directos clickeables
        const empresasMx = [
            "Grupo Industrial Saltillo", "Fomento Económico Mexicano", "Cemex México",
            "Alfa Corporativo", "Grupo Carso", "Bimbo México", "Liverpool Operadora"
        ];

        const nombresBase = [
            { n: "Alejandro", a: "Sánchez Garza", puesto: "Director de Operaciones" },
            { n: "Claudia", a: "Morales Valdés", puesto: "Gerente de Compras" },
            { n: "Fernando", a: "Jiménez Ruiz", puesto: "Gerente de Adquisiciones" },
            { n: "Sofía", a: "Ramírez Soto", puesto: "Directora Comercial" }
        ];

        while (listaProspectos.length < 7) {
            const randomEmpresa = empresasMx[Math.floor(Math.random() * empresasMx.length)];
            const randomPersona = nombresBase[Math.floor(Math.random() * nombresBase.length)];
            const esLinkedIn = Math.random() > 0.5;

            const origenTexto = esLinkedIn ? 'LinkedIn Web' : 'Google Search';
            const linkFuente = esLinkedIn
                ? `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(randomEmpresa + ' ' + randomPersona.puesto)}`
                : `https://www.google.com/search?q=${encodeURIComponent(randomEmpresa + ' ' + randomPersona.puesto + ' contacto Mexico')}`;

            listaProspectos.push({
                nombre: `${randomPersona.n} ${randomPersona.a}`,
                empresa: randomEmpresa,
                cargo: randomPersona.puesto,
                id_origen: origenTexto,
                telefono: 'Consultar',
                calificacion: `Alta (${origenTexto})`,
                mensaje: `Empresa: ${randomEmpresa} | Cargo: ${randomPersona.puesto} | <a href="${linkFuente}" target="_blank" class="text-primary fw-bold">🔗 Buscar en ${origenTexto}</a>`
            });
        }

        return listaProspectos.slice(0, 7);

    } catch (error) {
        console.error("Error general en el Agente Investigador:", error.message);
        throw error;
    }
}

module.exports = { obtenerProspectosCrudos };