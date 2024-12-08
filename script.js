//🏗️under construction🚧
// const mobileMenu = document.getElementById('mobile-menu');
// const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
// const mobileMenuClose = document.getElementById('mobile-menu-close');

// mobileMenuToggle.addEventListener('click', () => {
//     mobileMenu.classList.remove('hidden');
// });

// mobileMenuClose.addEventListener('click', () => {
//     mobileMenu.classList.add('hidden');
// });
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
    title: "What is NFC?",
    html: `<div style='text-align:left'>
                NFC is a wireless communication technology that enables data exchange between two devices in proximity to each other.
            <br><hr><br>
                It is based on radio frequency identification (RFID) technology and allows different devices to send and receive data over short distances by creating a magnetic field that induces an electric current in a nearby NFC-enabled device.<br><hr><br>
                NFC technology is widely used in various industries and applications, such as contactless payments, public transportation, access control systems, and smart home automation.
            <br><hr><br>
                NFC-enabled devices include smartphones, tablets, contactless payment cards, and other devices with built-in NFC chips.
            <br><hr><br>
                There are many advantages, including its ease of use, speed, and convenience. Since it requires proximity between devices, it is considered to be a secure form of communication.
            <br><hr><br>
                NFC is also very versatile and can be used in a wide range of applications, making it a popular choice for developers and businesses.
           </div>
        `,
    confirmButtonText: "Got It! \\_/",
    background:"#1f1f1f",
    color:"#1dfb"
  });
}

const ProFeatureTexts = [
  "5 NFC Cards",
  "Full-featured contact website",
  "Unlimited updates & edits",
  "Messaging apps and social media links",
  "Premium support (24h response)",
  "Professional models",
  "Custom design",
  "Images, videos, music",
  "Price lists",
  "Custom HTML",
  "Scheduled display of blocks",
  "Remove our watermark",
  "Custom domain",
  "Email messaging app",
];

const featureTexts = [
  "1 NFC Card",
  "Share basic contact info",
  "Pre-designed themes",
  "Unlimited links",
  "Maps",
  "Pageview statistics",
  "Shared access",
  "QR code",
];

function populateProList() {
  const ul = document.getElementById("pro-list");
  ProFeatureTexts.forEach((text) => {
    const li = document.createElement("li");
    li.className = "flex gap-x-3";
    li.innerHTML = ` <svg class="h-6 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" /> </svg> ${text}`;
    ul.appendChild(li);
  });
}

function populateStarterList() {
  const ul = document.getElementById("starter-list");
  featureTexts.forEach((text) => {
    const li = document.createElement("li");
    li.className = "flex gap-x-3";
    li.innerHTML = ` <svg class="h-6 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" /> </svg> ${text}`;
    ul.appendChild(li);
  });
}

populateProList();
populateStarterList();



document.addEventListener("DOMContentLoaded", () => {
  const profilePicture = document.getElementById('profile-picture');
  const imageInput = document.getElementById('image-input');
  const addLinkBtn = document.getElementById('add-link-btn');
  const dynamicLinks = document.getElementById('dynamic-links');

  // Profile picture preview
  profilePicture.addEventListener('click', () => {
      imageInput.click();
  });

  imageInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              profilePicture.src = e.target.result;
          };
          reader.readAsDataURL(file);
      }
  });
  // Add another link dynamically
  addLinkBtn.addEventListener('click', () => {
      // Create the new link item
      const linkItem = `
          <li class="flex items-center bg-white/10 p-2 rounded shadow-md border border-white/30 hover:bg-white/20 relative">
              <i class="fa fa-link text-xl text-white mr-3"></i>
              <input type="url" name="social-links[]" placeholder="https://your-link.com" class="w-full bg-transparent text-white p-2 rounded focus:outline-none" />
              <button type="button" class="remove-link-btn" style="
                  position: absolute;
                  top: 5px;
                  right: 5px;
                  background-color: red;
                  color: white;
                  border: none;
                  padding: 5px 10px;
                  border-radius: 5px;
                  cursor: pointer;
              ">X</button>
          </li>`;
      
      const ul = dynamicLinks.querySelector('ul');
      ul.insertAdjacentHTML('beforeend', linkItem);
  
      // Add event listener to the remove button of the newly added link item
      const removeButton = ul.querySelector('li:last-child .remove-link-btn');
      removeButton.addEventListener('click', function() {
          removeButton.parentElement.remove();
      });
  });
});
