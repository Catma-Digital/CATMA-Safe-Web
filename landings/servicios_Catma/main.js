document.addEventListener('DOMContentLoaded', () => {

    // 1. Carrusel y Animaciones
    const slides = document.querySelectorAll('.carousel-slide');
    let idx = 0;
    if(slides.length > 0) {
        setInterval(() => {
            slides[idx].classList.remove('active');
            idx = (idx + 1) % slides.length;
            slides[idx].classList.add('active');
        }, 5000);
    }

    // 2. Envío de Formulario
    const form = document.getElementById('leadForm');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // CORRECCIÓN: Usamos los IDs correctos (nombreLead, telefonoLead, mensajeLead)
            // Y enviamos 'nombre_cliente' para que el servidor lo acepte sin errores
            const datos = {
                nombre_cliente: document.getElementById('nombreLead').value.trim(),
                telefono: document.getElementById('telefonoLead').value.trim(),
                mensaje: `Servicio: ${document.getElementById('servicio').value}. Detalles: ${document.getElementById('mensajeLead').value.trim()}`,
                id_origen: 2 // ID 2 para la Landing de Servicios
            };

            try {
                const respuesta = await fetch('http://localhost:3000/api/registro-lead', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });

                if (respuesta.ok) {
                    alert("¡Registro exitoso! En CATMA SAFE México agradecemos su interés.");
                    form.reset();
                } else {
                    const resultado = await respuesta.json();
                    alert("Error en el servidor: " + (resultado.error || "Fallo en la base de datos"));
                }

            } catch (error) {
                console.error('Error de conexión:', error);
                alert("No se pudo conectar con el servidor. Verifica que 'node index.js' esté corriendo.");
            }
        });
    }
});