import OpenAI from 'openai';

// Inicializar OpenAI con la variable de entorno
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function calificarProspecto(leadData) {
    try {
        const systemPrompt = `
            Eres el núcleo de inteligencia comercial de CATMA Safe México. 
            Analiza los datos del prospecto proporcionados. 
            Devuelve un objeto JSON estricto con la siguiente estructura exacta:
            {
              "calificacion": "Alta" o "Media" o "Baja",
              "cargo_analisis": "Breve análisis del cargo y la empresa",
              "resumen": "Resumen del interés enfocado en Cajas fuertes, mantenimiento preventivo y correctivo, puertas de seguridad blindadas y ventanas blindadas, proyectos de corte y doblez especializado"
            }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Modelo rápido, económico y muy potente para JSON
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify(leadData) }
            ],
            response_format: { type: "json_object" }
        });

        // Parsear y devolver el resultado limpio de la IA
        return JSON.parse(response.choices[0].message.content);

    } catch (error) {
        console.error("Error en el Agente Calificador:", error);
        throw error;
    }
}