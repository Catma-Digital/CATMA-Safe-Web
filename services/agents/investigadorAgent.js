// Simulación de extracción o conexión con la fuente de prospectos (Apollo / LinkedIn / Google)
export async function obtenerProspectosCrudos() {
    // Aquí puedes simular o realizar la petición real a la API de Apollo.io
    // Por ahora, definimos los datos base de prueba o la consulta de búsqueda:
    const prospectosCrudos = [
        {
            nombre: "Lic. Alejandro Gómez",
            empresa: "Constructora e Inmobiliaria GVI",
            cargo: "Director de Seguridad Física",
            origen: "Apollo",
            telefono: "5580839634",
            interes_inicial: "Buscando proveedor especializado (Agentes de IA)"
        },
        {
            nombre: "Lic. Claudia Pérez",
            empresa: "Grupo Industrial Alfa",
            cargo: "Gerente de Adquisiciones",
            origen: "Apollo",
            telefono: "5586026615",
            interes_inicial: "Interés en Cajas fuertes, mantenimiento preventivo y correctivo, puertas de seguridad blindadas y ventanas blindadas, proyectos de corte y doblez especializado"
        }
        // Puedes agregar más o conectar aquí la llamada HTTP a la API de Apollo.io
    ];

    return prospectosCrudos;
}