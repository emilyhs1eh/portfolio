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
    const insight = event.target.closest('[data-insight-toggle]');
    if (insight) {
      insight.setAttribute('aria-expanded', String(insight.getAttribute('aria-expanded') === 'false'));
      return;
    }
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

const demos = document.querySelectorAll('[data-demo] video');

if (demos.length && 'IntersectionObserver' in window) {
  const autoplayed = new WeakSet();
  const visibility = new IntersectionObserver((entries) => {
    for (const { target: video, isIntersecting, intersectionRatio } of entries) {
      if (!isIntersecting) {
        autoplayed.delete(video);
        video.pause();
      } else if (intersectionRatio >= 0.5 && !autoplayed.has(video) && !reducedMotion.matches) {
        autoplayed.add(video);
        if (video.paused) {
          video.muted = true;
          // Leave native controls available when the browser blocks autoplay.
          video.play().catch(() => {});
        }
      }
    }
  }, { threshold: [0, 0.5] });

  demos.forEach((video) => visibility.observe(video));
}
