
 $(document).ready(function () {
          // Initialize the carousel
          $('.carousel').slick({
              dots: true,
              infinite: true,
              speed: 500,
              slidesToShow: 3, // Show 3 images by default (for large screens)
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 2200,
              pauseOnHover: true,
              arrows: true,
              responsive: [
                  {
                      breakpoint: 768, // Adjust for screens smaller than 768px
                      settings: {
                          slidesToShow: 1, // Show 1 image per slide on smaller screens
                          slidesToScroll: 1,
                          autoplaySpeed: 2200,
                          pauseOnHover: true,
                      }
                  }
              ]
          });
      });
      
document.querySelectorAll('.faq-button').forEach(button => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    const arrow = button.querySelector('svg');
    
    // Toggle answer visibility
    answer.classList.toggle('hidden');
    
    // Rotate arrow
    arrow.style.transform = answer.classList.contains('hidden') 
      ? 'rotate(0deg)' 
      : 'rotate(180deg)';
    
    // Close other answers
    document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
      if (otherAnswer !== answer && !otherAnswer.classList.contains('hidden')) {
        otherAnswer.classList.add('hidden');
        otherAnswer.previousElementSibling.querySelector('svg').style.transform = 'rotate(0deg)';
      }
    });
  });
});


  // smooth landing animation on page loading/opening
  const fadeInElements = document.querySelectorAll('.fade-in');
  const FADE_IN_DURATION = '0.5s';
  const FADE_OUT_DURATION = '0.3s';
  const TRANSITION_TIMING = 'ease-in-out';
  const NAVIGATION_DELAY = 500;

  // Initial setup - hide elements before animation
  fadeInElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${FADE_IN_DURATION} ${TRANSITION_TIMING}`;
  });

  // Fade in elements when DOM is ready or when returning from another page
  function fadeInContent() {
    requestAnimationFrame(() => {
      fadeInElements.forEach(element => {
        element.style.opacity = '1';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', fadeInContent);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      fadeInContent(); // Handle back/forward navigation
    }
  });

  // Handle link transitions
  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    // Check if link is external or internal route
    const href = link.getAttribute('href');
    if (!href.startsWith('http') && !href.startsWith('/')) return;

    e.preventDefault();

    // Fade out smoothly
    fadeInElements.forEach(element => {
      element.style.transition = `opacity ${FADE_OUT_DURATION} ${TRANSITION_TIMING}`;
      element.style.opacity = '0';
    });

    // Navigate after fade completes
    setTimeout(() => {
      window.location.href = href;
    }, NAVIGATION_DELAY);
  });
