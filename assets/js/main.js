/* =========================================================
   main.js — INITNULLTV
   Funciones principales del sitio:
   - Menú móvil (Navbar)
   - Carrusel responsivo de opiniones (loop infinito)
   - Enlaces internos con desplazamiento suave
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. LÓGICA DEL MENÚ MÓVIL (NAVBAR)
     ========================================================= */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileLinksContainer = document.getElementById('mobile-links-container');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  const updateMenuState = (isOpen) => {
    if (!mobileLinksContainer || !menuToggle) return;

    mobileLinksContainer.classList.toggle('hidden', !isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);

    if (menuIcon && closeIcon) {
      menuIcon.classList.toggle('hidden', isOpen);
      closeIcon.classList.toggle('hidden', !isOpen);
    }
  };

  if (menuToggle && mobileLinksContainer) {
    menuToggle.addEventListener('click', () => {
      const isMenuOpen = mobileLinksContainer.classList.contains('hidden');
      updateMenuState(isMenuOpen);
    });

    mobileLinksContainer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => updateMenuState(false));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && !mobileLinksContainer.classList.contains('hidden')) {
        updateMenuState(false);
      }
    });
  }


  /* =========================================================
     2. CARRUSEL RESPONSIVO DE OPINIONES (LOOP INFINITO)
     ========================================================= */
  const carousel = document.querySelector("#references-carousel");
  const track = carousel?.querySelector(".carousel-track");
  const prevButton = carousel?.querySelector(".carousel-prev");
  const nextButton = carousel?.querySelector(".carousel-next");
  const cards = carousel?.querySelectorAll(".carousel-card");

  if (carousel && track && cards.length) {
    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    const totalCards = cards.length;
    const gap = 24;

    function getCardsPerView() {
      const width = window.innerWidth;
      if (width < 640) return 1;
      if (width < 768) return 2;
      if (width < 1024) return 3;
      if (width < 1280) return 4;
      return 5;
    }

    function updateCarousel() {
      const trackWidth = track.clientWidth;
      const cardWidth = (trackWidth - gap * (cardsPerView - 1)) / cardsPerView;
      cards.forEach(card => (card.style.minWidth = `${cardWidth}px`));

      const offset = -(cardWidth + gap) * currentIndex;
      track.style.transition = "transform 0.5s ease";
      track.style.transform = `translateX(${offset}px)`;
    }

    prevButton?.addEventListener("click", () => moveCarousel(-1));
    nextButton?.addEventListener("click", () => moveCarousel(1));

    function moveCarousel(direction) {
      currentIndex += direction;

      if (currentIndex < 0) {
        currentIndex = totalCards - cardsPerView; // vuelve al final
      } else if (currentIndex > totalCards - cardsPerView) {
        currentIndex = 0; // vuelve al inicio
      }
      updateCarousel();
    }

    // Auto-loop cada 6 segundos
    let autoPlay = setInterval(() => moveCarousel(1), 6000);

    // Pausa al pasar el cursor sobre el carrusel
    carousel.addEventListener("mouseenter", () => clearInterval(autoPlay));
    carousel.addEventListener("mouseleave", () => {
      autoPlay = setInterval(() => moveCarousel(1), 6000);
    });

    window.addEventListener("resize", () => {
      const newCardsPerView = getCardsPerView();
      if (newCardsPerView !== cardsPerView) {
        cardsPerView = newCardsPerView;
        currentIndex = 0;
        updateCarousel();
      }
    });

    updateCarousel();

    // Inserta líneas divisorias entre secciones del carrusel
    const sections = document.querySelectorAll(".carousel-section");
    sections.forEach((section, index) => {
      if (index < sections.length - 1) {
        const divider = document.createElement("hr");
        divider.className = "my-20 border-t border-[#007BFF]/30";
        section.parentNode.insertBefore(divider, section.nextSibling);
      }
    });
  }


  /* =========================================================
     3. USABILIDAD GENERAL
     ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
