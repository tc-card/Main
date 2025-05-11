
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

      
document.querySelector('#learn-more').addEventListener('click', WhyNFC);
    function WhyNFC() {
        Swal.fire({
          icon: "info",
          title: "Understanding NFC Technology",
          html: `<div style='text-align:left; line-height:1.6;'>
                      <strong>What is NFC?</strong><br>
                      Near Field Communication (NFC) is a secure wireless technology that enables seamless data exchange between devices in close proximity.
                  <br><hr><br>
                      <strong>How does it work?</strong><br>
                      Using advanced RFID technology, NFC creates a secure connection between compatible devices, allowing instant data transfer without physical contact.
                  <br><hr><br>
                      <strong>Where is it used?</strong><br>
                      NFC powers many modern conveniences including:
                      • Digital payments
                      • Access control systems
                      • Business networking
                      • Smart device integration
                  <br><hr><br>
                      <strong>Why choose NFC?</strong><br>
                      • Instant connectivity
                      • Enhanced security
                      • Universal compatibility
                      • Future-proof technology
                  <br><hr><br>
                      <strong>Business Benefits</strong><br>
                      NFC technology streamlines professional networking, enhances brand perception, and provides a sustainable solution for modern business connectivity.
                 </div>
              `,
          confirmButtonText: "Understood",
          background: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
          color: "#fff",
          customClass: {
            container: 'custom-swal-container',
            popup: 'custom-swal-popup',
            content: 'custom-swal-content'
          }
        });
};


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
        element.style.transition = 'opacity 1.5s ease-in-out';
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
        }, 800);
    });
});
