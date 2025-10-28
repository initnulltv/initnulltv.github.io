document.addEventListener('DOMContentLoaded', () => {

  const menuToggle = document.getElementById('menu-toggle');
  const mobileLinksContainer = document.getElementById('mobile-links-container');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  const carousel = document.querySelector("#references-carousel");
  const track = carousel?.querySelector(".carousel-track");
  const prevButton = carousel?.querySelector(".carousel-prev");
  const nextButton = carousel?.querySelector(".carousel-next");
  const cards = carousel?.querySelectorAll(".carousel-card");

  const anchors = document.querySelectorAll('a[href^="#"]');

  // FUNCIONES
  const updateMenuState = (isOpen) => {
    if (!mobileLinksContainer || !menuToggle) return;
    mobileLinksContainer.classList.toggle('hidden', !isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar Menú' : 'Abrir Menú');
    if (menuIcon && closeIcon) {
      menuIcon.classList.toggle('hidden', isOpen);
      closeIcon.classList.toggle('hidden', !isOpen);
    }
  };

  function getCardsPerView() {
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    if (width < 1280) return 4;
    return 5;
  }

  function updateCarousel(currentIndex, cardsPerView) {
    if (!track || !cards.length) return;
    const gap = 24;
    const trackWidth = track.clientWidth;
    const cardWidth = (trackWidth - gap * (cardsPerView - 1)) / cardsPerView;
    cards.forEach(card => card.style.minWidth = `${cardWidth}px`);
    const offset = -(cardWidth + gap) * currentIndex;
    track.style.transition = "transform 0.5s ease";
    track.style.transform = `translateX(${offset}px)`;
  }

  // MENÚ MÓVIL
  if (menuToggle && mobileLinksContainer) {
    menuToggle.addEventListener('click', () => {
      const isMenuCurrentlyHidden = mobileLinksContainer.classList.contains('hidden');
      updateMenuState(isMenuCurrentlyHidden);
    });

    mobileLinksContainer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => updateMenuState(false));
    });
  }

  // CARRUSEL
  if (carousel && track && cards.length) {
    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    const totalCards = cards.length;
    const gap = 24;

    const moveCarousel = (direction) => {
      currentIndex += direction;
      if (currentIndex < 0) currentIndex = totalCards - cardsPerView;
      else if (currentIndex > totalCards - cardsPerView) currentIndex = 0;
      updateCarousel(currentIndex, cardsPerView);
    };

    prevButton?.addEventListener("click", () => moveCarousel(-1));
    nextButton?.addEventListener("click", () => moveCarousel(1));

    let autoPlay = setInterval(() => moveCarousel(1), 6000);
    carousel.addEventListener("mouseenter", () => clearInterval(autoPlay));
    carousel.addEventListener("mouseleave", () => {
      autoPlay = setInterval(() => moveCarousel(1), 6000);
    });

    const sections = document.querySelectorAll(".carousel-section");
    sections.forEach((section, index) => {
      if (index < sections.length - 1) {
        const divider = document.createElement("hr");
        divider.className = "my-20 border-t border-[#007BFF]/30";
        section.parentNode.insertBefore(divider, section.nextSibling);
      }
    });

    updateCarousel(currentIndex, cardsPerView);
  }

  // ENLACES INTERNOS
  if (anchors.length) {
    anchors.forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // RESIZE UNIFICADO
  window.addEventListener('resize', () => {
    if (menuToggle && mobileLinksContainer && window.innerWidth >= 1024 && !mobileLinksContainer.classList.contains('hidden')) {
      updateMenuState(false);
    }

    if (carousel && track && cards.length) {
      const newCardsPerView = getCardsPerView();
      if (newCardsPerView !== cardsPerView) {
        cardsPerView = newCardsPerView;
        currentIndex = 0;
        updateCarousel(currentIndex, cardsPerView);
      }
    }
  });

});
