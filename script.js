/* ---------------------------
   Fade-in on Scroll
--------------------------- */
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.section, .card, .story, .review-grid blockquote')
  .forEach(el => observer.observe(el));

/* ---------------------------
   Seamless Infinite Scroller (Optimized)
--------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll(".scroller").forEach(scroller => {
    const inner = scroller.querySelector(".scroller__inner");
    if (!inner) return;

    const imgs = inner.querySelectorAll('img');
    const imgPromises = Array.from(imgs).map(img =>
      img.complete ? Promise.resolve() : new Promise(resolve => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      })
    );

    Promise.all(imgPromises).then(() => {
      const originalWidth = inner.getBoundingClientRect().width;

      // Duplicate items once for seamless loop
      inner.append(...Array.from(inner.children).map(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        return clone;
      }));

      // Set dynamic width + custom property for animation
      inner.style.width = `${originalWidth * 2}px`;
      inner.style.setProperty('--scroll-width', `${originalWidth}px`);

      // Determine duration
      const dataDuration = parseFloat(scroller.dataset.duration);
      const speed = scroller.dataset.speed?.toLowerCase();
      const duration = !isNaN(dataDuration)
        ? dataDuration
        : speed === 'fast'
          ? 20
          : speed === 'slow'
            ? 50
            : 40;

      // Apply animation
      inner.style.animation = `scroll ${duration}s linear infinite`;
      if ((scroller.dataset.direction || 'left').toLowerCase() === 'right') {
        inner.style.animationDirection = 'reverse';
      }

      // Reduced motion accessibility
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        inner.style.animation = 'none';
      }

      // Recompute widths on resize
      let resizeTimer;
      const recompute = () => {
        const items = Array.from(inner.children).slice(0, inner.children.length / 2);
        const gap = parseFloat(getComputedStyle(inner).gap) || 0;
        const totalWidth = items.reduce((sum, el, i) => sum + el.getBoundingClientRect().width + (i ? gap : 0), 0);
        inner.style.width = `${totalWidth * 2}px`;
        inner.style.setProperty('--scroll-width', `${totalWidth}px`);
      };

      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(recompute, 150);
      });
    });
  });
});
