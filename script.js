
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


  // Mobile menu toggle functionality
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  mobileMenuButton.addEventListener('click', () => {
    const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.classList.toggle('hidden');
    
    // Change icon based on state
    const menuIcon = mobileMenuButton.querySelector('svg');
    if (!isExpanded) {
      menuIcon.innerHTML = `
        <path d="M18 6 6 18"></path>
        <path d="m6 6 12 12"></path>
      `;
    } else {
      menuIcon.innerHTML = `
        <line x1="4" x2="20" y1="12" y2="12"></line>
        <line x1="4" x2="20" y1="6" y2="6"></line>
        <line x1="4" x2="20" y1="18" y2="18"></line>
      `;
    }
  });

  // Close mobile menu when clicking on a link
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      // Reset icon to hamburger
      const menuIcon = mobileMenuButton.querySelector('svg');
      menuIcon.innerHTML = `
        <line x1="4" x2="20" y1="12" y2="12"></line>
        <line x1="4" x2="20" y1="6" y2="6"></line>
        <line x1="4" x2="20" y1="18" y2="18"></line>
      `;
    });
  });

  // Handle escape key to close menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      // Reset icon to hamburger
      const menuIcon = mobileMenuButton.querySelector('svg');
      menuIcon.innerHTML = `
        <line x1="4" x2="20" y1="12" y2="12"></line>
        <line x1="4" x2="20" y1="6" y2="6"></line>
        <line x1="4" x2="20" y1="18" y2="18"></line>
      `;
    }
  });

// smooth landing animation on page loading/opening
const fadeInElements = document.querySelectorAll('.fade-in');

// Initial setup
fadeInElements.forEach((element) => {
    element.style.opacity = 0;
});

// Fade in on page load
window.addEventListener('load', () => {
    fadeInElements.forEach((element) => {
        element.style.transition = 'opacity 0.5s ease-in-out';
        element.style.opacity = 1;
    });
});

// Fade out when clicking external links
document.querySelectorAll('a[href^="http"]' || 'a[href^="/"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        
        // Fade out all elements
        fadeInElements.forEach((element) => {
            element.style.transition = 'opacity 0.8s ease-in-out';
            element.style.opacity = 0;
        });

        // Navigate after animation completes
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    });
});
