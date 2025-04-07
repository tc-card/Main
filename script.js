
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
      }