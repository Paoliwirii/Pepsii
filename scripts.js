// 1. Seleccionamos las secciones y los puntos
    const sections = document.querySelectorAll('section');
    const navDots = document.querySelectorAll('.side-nav a');

    // 2. Configuración del "Observador" (Detecta qué se ve en pantalla)
    const observerOptions = {
        root: document.querySelector('.scroll-container'), // Quién tiene el scroll
        threshold: 0.5 // Se activa cuando el 50% de la sección es visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Removemos 'active' de todos los puntos
                navDots.forEach(dot => dot.classList.remove('active'));
                
                // Buscamos el punto que corresponde a esta sección (usando el href)
                const id = entry.target.getAttribute('id');
                const activeDot = document.querySelector(`.side-nav a[href="#${id}"]`);
                
                // Si existe, le ponemos la clase active
                if (activeDot) {
                    activeDot.classList.add('active');
                }
            }
        });
    }, observerOptions);

    // 3. Ponemos al observador a vigilar cada sección
    sections.forEach(section => {
        observer.observe(section);
    });

        /* =========================================
       1. LÓGICA DEL LOADER (NUEVO)
       ========================================= */
    window.addEventListener('load', function() {
        // Esperamos 1.5 segundos para que se vea la animación del logo
        setTimeout(function() {
            // Agregamos la clase 'loaded' al body para activar el CSS
            document.body.classList.add('loaded');
            
            // Opcional: Eliminar el loader del HTML después de la animación para limpiar
            setTimeout(() => {
                document.getElementById('loader-wrapper').style.display = 'none';
            }, 1500); // Espera a que termine la animación del telón
            
        }, 1500); // Tiempo que dura el logo palpitando antes de abrirse

    });

// Seleccionamos todos los enlaces que apuntan a una sección (empiezan con #)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Evita el salto brusco predeterminado

        const targetId = this.getAttribute('href'); // Obtiene el ID (#inicio, etc)
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            // Hacemos scroll suave usando JS, que es más consistente
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
