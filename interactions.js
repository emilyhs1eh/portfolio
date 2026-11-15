const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

for (const carousel of document.querySelectorAll('[data-carousel]')) {
  const track = carousel.querySelector('.case-carousel-track');
  const cards = [...track.children];
  const dots = [...carousel.querySelectorAll('[data-slide]')];

  function activeCard() {
    return cards.reduce((nearest, card, index) => {
      const center = track.scrollLeft + track.clientWidth / 2;
      const distance = (item) => Math.abs(item.offsetLeft + item.offsetWidth / 2 - center);
      return distance(card) < distance(cards[nearest]) ? index : nearest;
    }, 0);
  }

  function moveTo(index) {
    const card = cards[(index + cards.length) % cards.length];
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2,
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  }

  carousel.addEventListener('click', (event) => {
    const control = event.target.closest('[data-step], [data-slide]');
    if (!control) return;
    moveTo(control.hasAttribute('data-slide') ? Number(control.dataset.slide) : activeCard() + Number(control.dataset.step));
  });

  track.addEventListener('keydown', (event) => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    moveTo(activeCard() + (event.key === 'ArrowLeft' ? -1 : 1));
  });

  track.addEventListener('scroll', () => {
    const current = activeCard();
    dots.forEach((dot, index) => {
      if (index === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }, { passive: true });
}
