document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA CARRUSEL ---
    const EQUIPOS_MAQUILA = [
        {
            img1: '/corte/assets/images/planta/Planta 3.png',
            img2: '/corte/assets/images/planta/Planta 2.png',
            img3: '/corte/assets/images/planta/Planta 1.png',
            titulo: 'INFRAESTRUCTURA INDUSTRIAL'
        },
        {
            img1: '/corte/assets/images/maquila/corte-CNC.png',
            img2: '/corte/assets/images/maquila/doblez-CNC.png',
            img3: '/corte/assets/images/maquila/dobladora-1.png',
            titulo: 'PROCESOS DE ALTA PRECISIÓN'
        }
    ];

    const container = document.getElementById('carouselContainer');
    if (container) {
        container.innerHTML = EQUIPOS_MAQUILA.map((item, index) => `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}" style="display: ${index === 0 ? 'block' : 'none'};">
                <div class="carousel-grid">
                    <div class="grid-item"><img src="${item.img1}" alt="Imagen 1"></div>
                    <div class="grid-item"><img src="${item.img2}" alt="Imagen 2"></div>
                    <div class="grid-item"><img src="${item.img3}" alt="Imagen 3"></div>
                </div>
                <div class="carousel-caption"><h2>${item.titulo}</h2></div>
            </div>
        `).join('');
    }

    // --- AQUÍ ESTABA EL ERROR: FALTABA ESTA LÓGICA ---
    const slides = document.querySelectorAll('.carousel-slide');
    let currentIndex = 0;

    const updateCarousel = (index) => {
        slides.forEach((slide, i) => {
            slide.style.display = (i === index) ? 'block' : 'none';
            // También actualizamos la clase para tu CSS
            slide.classList.toggle('active', i === index);
        });
    };

    document.getElementById('prevBtn')?.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
        updateCarousel(currentIndex);
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
        updateCarousel(currentIndex);
    });

    // --- 2. LÓGICA ENVÍO FORMULARIO (TAL CUAL LA TENÍAS) ---
    const form = document.getElementById('leadForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nombre_cliente: document.getElementById('nombreLead').value.trim(),
                telefono: document.getElementById('telefonoLead').value.trim(),
                mensaje: document.getElementById('mensajeLead').value.trim(),
                id_origen: 4
            };

            try {
                const response = await fetch('/api/registro-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert('Solicitud enviada correctamente.');
                    form.reset();
                } else {
                    alert('Error al enviar la solicitud.');
                }
            } catch (error) {
                console.error('Error de conexión:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    }
});