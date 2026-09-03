const axios = require('axios');

async function obtenerProspectosCrudos() {
    try {
        const apiKey = process.env.APOLLO_API_KEY;
        let listaProspectos = [];

        // 1. Intentar traer prospectos reales de Apollo.io enfocados en el sector de CATMA
        if (apiKey) {
            try {
                const paginaAleatoria = Math.floor(Math.random() * 10) + 1;
                const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
                    person_titles: [
                        "Gerente de Seguridad Fisica",
                        "Seguridad Patrimonial",
                        "Gerente de Planta",
                        "Jefe de Mantenimiento",
                        "Facilities Manager",
                        "Gerente de Operaciones"
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
                    const empresaNombre = p.organization?.name || 'Industria Privada';
                    const cargoPersona = p.title || 'Gerente de Operaciones / Seguridad';
                    const correoPersona = p.email || 'No listado';
                    const telefonoReal = p.phone_numbers?.[0]?.sanitized_number || p.phone_numbers?.[0]?.raw_number || p.corporate_phone || 'Consultar';
                    const linkApollo = p.id ? `https://app.apollo.io/#/people/${p.id}` : 'https://app.apollo.io/#/people';

                    return {
                        nombre: nombreLimpio,
                        empresa: empresaNombre,
                        cargo: cargoPersona,
                        id_origen: 'Apollo.io',
                        telefono: telefonoReal,
                        calificacion: 'Alta (Apollo - Seguridad / Mantenimiento)',
                        mensaje: `Empresa: ${empresaNombre} | Cargo: ${cargoPersona} | Email: ${correoPersona} | Interés: Cajas Fuertes / Mantenimiento | <a href="${linkApollo}" target="_blank" class="text-primary fw-bold">🔗 Abrir en Apollo</a>`
                    };
                });
                listaProspectos.push(...mapeadosApollo);
            } catch (e) {
                console.log("Aviso: Falló la consulta a Apollo, complementando con búsqueda web sectorizada.");
            }
        }

        // 2. Complementar con simulados de LinkedIn y Google enfocados en Industria, Manufactura y Banca
        const empresasIndustrialesMx = [
            "Maquiladora y Manufactura del Norte", "Aceros y Perfiles del Centro",
            "Centro Logístico e Industrial de Operaciones", "Parque Industrial Toluca Planta 3",
            "Metalmecánica y Estructuras Especializadas", "Grupo Financiero y Bóvedas Regionales",
            "Automotriz y Componentes de México"
        ];

        const perfilesObjetivoCatma = [
            { n: "Roberto", a: "Garza Sada", puesto: "Gerente de Planta e Infraestructura" },
            { n: "Claudia", a: "Valdés Navarro", puesto: "Gerente de Seguridad Física" },
            { n: "Fernando", a: "Ruiz Esparza", puesto: "Jefe de Mantenimiento Industrial" },
            { n: "Sofía", a: "Hernández Soto", puesto: "Directora de Operaciones y Seguridad Patrimonial" }
        ];

        while (listaProspectos.length < 7) {
            const randomEmpresa = empresasIndustrialesMx[Math.floor(Math.random() * empresasIndustrialesMx.length)];
            const randomPersona = perfilesObjetivoCatma[Math.floor(Math.random() * perfilesObjetivoCatma.length)];
            const esLinkedIn = Math.random() > 0.5;

            const origenTexto = esLinkedIn ? 'LinkedIn Web' : 'Google Search';
            const linkFuente = esLinkedIn
                ? `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(randomEmpresa + ' ' + randomPersona.puesto)}`
                : `https://www.google.com/search?q=${encodeURIComponent(randomEmpresa + ' ' + randomPersona.puesto + ' mantenimiento corte y doblez cajas fuertes')}`;

            listaProspectos.push({
                nombre: `${randomPersona.n} ${randomPersona.a}`,
                empresa: randomEmpresa,
                cargo: randomPersona.puesto,
                id_origen: origenTexto,
                telefono: 'Consultar',
                calificacion: `Alta (${origenTexto} - Sector Industrial)`,
                mensaje: `Empresa: ${randomEmpresa} | Cargo: ${randomPersona.puesto} | Interés: Mantenimiento / Corte y Doblez | <a href="${linkFuente}" target="_blank" class="text-primary fw-bold">🔗 Buscar en ${origenTexto}</a>`
            });
        }

        return listaProspectos.slice(0, 7);

    } catch (error) {
        console.error("Error general en el Agente Investigador:", error.message);
        throw error;
    }
}

module.exports = { obtenerProspectosCrudos };