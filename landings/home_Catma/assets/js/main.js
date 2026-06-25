document.addEventListener('DOMContentLoaded', () => {
    // 1. Lógica del Menú Hamburguesa (INTEGRADA)
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });

        // Cierra menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    // --- TU CÓDIGO ORIGINAL SE MANTIENE ABAJO ---
    const modal = document.getElementById('modalJob');

    window.openModal = () => { if (modal) modal.classList.add('active'); };
    window.closeModal = () => { if (modal) modal.classList.remove('active'); };

    // Lógica Lead Form
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                nombre_cliente: document.getElementById('nombreLead').value.trim(),
                telefono: document.getElementById('telefonoLead').value.trim(),
                mensaje: document.getElementById('mensajeLead').value.trim(),
                id_origen: 1
            };
            try {
                const res = await fetch('/api/registro-lead', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    alert('Solicitud enviada');
                    leadForm.reset();
                } else {
                    alert('Error al enviar el formulario.');
                }
            } catch (err) {
                console.error('Error LeadForm:', err);
                alert('Error de conexión.');
            }
        });
    }

    // Lógica Bolsa Form
    const bolsaForm = document.getElementById('bolsaForm');
    if (bolsaForm) {
        bolsaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('cvBolsa');
            if (!fileInput.files[0]) {
                alert('Por favor selecciona un archivo PDF.');
                return;
            }
            const formData = new FormData();
            formData.append('nombre', document.getElementById('nombreBolsa').value);
            formData.append('telefono', document.getElementById('telefonoBolsa').value);
            formData.append('correo', document.getElementById('correoBolsa').value);
            formData.append('puesto', document.getElementById('puestoBolsa').value);
            formData.append('cv', fileInput.files[0]);
            try {
                const res = await fetch('/api/registro-bolsa', {
                    method: 'POST',
                    body: formData
                });
                if (res.ok) {
                    alert('¡Solicitud enviada con éxito!');
                    bolsaForm.reset();
                    window.closeModal();
                } else {
                    alert('Error del servidor');
                }
            } catch (err) {
                console.error('Error de red:', err);
                alert('Error de conexión.');
            }
        });
    }

    // LÓGICA: Carrusel Automático
    setInterval(() => {
        const slides = document.querySelectorAll('.carousel-slide');
        const activeSlide = document.querySelector('.carousel-slide.active');
        if (!activeSlide) return;
        let nextSlide = activeSlide.nextElementSibling;
        if (!nextSlide || !nextSlide.classList.contains('carousel-slide')) {
            nextSlide = slides[0];
        }
        activeSlide.classList.remove('active');
        nextSlide.classList.add('active');
    }, 5000);
});