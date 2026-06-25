document.addEventListener('DOMContentLoaded', () => {
    // --- CARRUSEL ---
    const container = document.getElementById('carousel-dynamic');
    const imagenes = [
        'varios/cajas-en-fila.png', 'diamante/CAT-DIAMANTE2245.png',
        'onix/onix cerra.png', 'onix/onix abier.png', 'onix/Porta llaves.jpg',
        'pirita/Cerrada.png', 'pirita/Abierta.png', 'pirita/Pernos.png', 'pirita/Cerradura.png',
        'ur 15/UR 15 cerra.png', 'ur 15/UR 15 abier.png', 'ur 15/UR 15 cerradu.png',
        'ut 19/UT 19 cerra.png', 'ut 19/UT 19 abier.png',
        'ut 30/UT-30-cerra.png', 'ut 30/UT-30-abier.png', 'ut 30/UT-30-cerradura.png',
        'zafiro/Armero.png', 'zafiro/Soporte inferior.png', 'zafiro/Zafiro abier.png', 'zafiro/Zoporte para armas largas.png',
        'archiveros/archiveros-todos.png', 'pasabultos/pasabultos-1.png', 'Hecho/Made_In_Mexico_2025.png', 'logos/ISO sin fondo.png'
    ];

    if (container) {
        imagenes.forEach((img, index) => {
            const slide = document.createElement('div');
            slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            slide.style.backgroundImage = `url('/assets/images/${img}')`;
            container.appendChild(slide);
        });
    }

    const slides = document.querySelectorAll('.carousel-slide');
    let idx = 0;
    if (slides.length > 0) {
        setInterval(() => {
            slides[idx].classList.remove('active');
            idx = (idx + 1) % slides.length;
            slides[idx].classList.add('active');
        }, 5000);
    }

    // --- ENVÍO DE FORMULARIO INTEGRADO (ID 3 = CAJAS) ---
    const form = document.getElementById('leadForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                nombre_cliente: document.getElementById('nombreLead').value.trim(),
                telefono: document.getElementById('telefonoLead').value.trim(),
                mensaje: document.getElementById('mensajeLead').value.trim(),
                id_origen: 3
            };

            try {
                // CORRECCIÓN: Ruta relativa sin localhost
                const res = await fetch('/api/registro-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    alert('Solicitud enviada correctamente.');
                    form.reset();
                } else {
                    alert('Error en el servidor al procesar los datos.');
                }
            } catch (err) {
                console.error(err);
                alert('Error de conexión con el servidor.');
            }
        });
    }
});