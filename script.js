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
