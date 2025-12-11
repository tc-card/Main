// Minimal helper script for the Bento component
// - Adds a reveal-on-scroll effect
// - Pauses scroll animations on hover for the select card stack

(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
  });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Pause the scroll animations when hovering the select card column
  const selectCard = document.querySelector('.animate-scroll-up')?.parentElement;
  if (selectCard) {
    selectCard.addEventListener('mouseenter', () => {
      selectCard.querySelectorAll('.animate-scroll-up, .animate-scroll-down').forEach((col) => {
        col.style.animationPlayState = 'paused';
      });
    });
    selectCard.addEventListener('mouseleave', () => {
      selectCard.querySelectorAll('.animate-scroll-up, .animate-scroll-down').forEach((col) => {
        col.style.animationPlayState = 'running';
      });
    });
  }
})();
