
document.addEventListener("DOMContentLoaded", function() {
    // Set initial background
    document.body.style = "background: url(https://tccards.tn/Assets/bg.png) center fixed !important; backdrop-filter: blur(5px); background-size: 10% 10%;";
    document.body.style.backgroundSize = "cover";
    // Create unique callback for each request
    const callbackName = 'profileCallback_' + Math.random().toString(36).substring(2, 9);
    window[callbackName] = function(data) {
        handleProfileData(data);
        delete window[callbackName]; // Clean up
    };

    // Get profile link from URL
    const link = window.location.pathname.split('/').pop();
    if (!link) {
        showError("No profile link provided");
        return;
    }

    // Start searching databases
    searchDatabases([
        // free 3-26*12:52:30
        'AKfycbxdYxFpI07HIWLe3IMX0IZmhPJvH-_LKQSxVjAawVM0fowgQEedxZVBnkk6qkXvZhuV',
        // standard 3-26*12:50:30
        'AKfycbxLblQtO4koIuIk9KDT9HtlzOkTSg3XruDC55WWTw_c37JBnCXJ0NAZlLeMcpZFYoiUtQ'
    ], link, callbackName);
    });

    // Handle profile data response
    function handleProfileData(data) {
    if (!data || data.status === "error" || data.Status !== "Active") {
        showError("Profile not found or inactive");
        return;
    }

    const planType = getPlanType(data);
    renderProfileCard(data, planType);
    }

    // Determine plan type
    function getPlanType(data) {
    if (data['Form Type'] && data['Background Image URL']) return 'standard';
    if (data['Background Image URL']) return 'basic';
    return 'free';
    }

    // Render profile card based on plan type
    function renderProfileCard(data, planType) {
    const container = document.querySelector(".card-container");
    
    // Apply background style if available (for body)
    if (data['Selected Style']) {
        const styles = {
        corporateGradient: "linear-gradient(145deg, rgb(9, 9, 11), rgb(24, 24, 27), rgb(9, 9, 11))",
        oceanGradient: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))"
        };
        document.body.style.background = styles[data['Selected Style']] || styles.corporateGradient;
    }

    // Build profile HTML
    container.innerHTML = `
        <div class="profile-container">
        ${planType === 'standard' && data['Background Image URL'] ? 
            `<div class="profile-banner" style="background-image: url('${data['Background Image URL']}')"></div>` : ''}
        
        <img src="${data['Profile Picture URL'] || 'https://www.tccards.tn/Assets/default.png'}" 
            class="profile-picture">
        
        <h2>${data.Name || 'User'}</h2>
        ${data.Tagline ? `<p>${data.Tagline}</p>` : ''}
        
        ${planType === 'standard' && data['Form Type'] ? 
            `<div class="plan-badge">${data['Form Type']}</div>` : ''}
        
        ${renderSocialLinks(data['Social Links'])}
        
        ${(data.Email || data.Phone || data.Address) ? 
            `<button class="contact-btn" onclick="showContactDetails(${JSON.stringify({
            email: data.Email,
            phone: data.Phone,
            address: data.Address
            })})">Get in Touch</button>` : ''}
        
        <footer>
            <p>&copy; ${new Date().getFullYear()} Total Connect</p>
        </footer>
        ${planType === 'free' ? `<img src="https://tccards.tn/Assets/zfooter.gif" alt="cute animation" class="mt-8">` : ''}
        </div>
    `;
    }

    // Improved social links renderer
    function renderSocialLinks(links) {
    if (!links) return '';

    const validLinks = links.split(",")
        .map(link => {
        link = link.trim();
        if (!link) return null;
        
        try {
            // Ensure URL has protocol
            if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
            const url = new URL(link);
            
            // free security check
            if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(url.hostname)) return null;
            
            return {
            href: url.href,
            display: url.hostname.replace(/^www\./, '')
            };
        } catch (e) {
            return null;
        }
        })
        .filter(link => link !== null);

    if (!validLinks.length) return '';

    return `
        <div class="social-links">
        ${validLinks.map(link => `
            <a href="${link.href}" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-link"></i> ${link.display}
            </a>
        `).join('')}
        </div>
    `;
    }

    // Database search function
    function searchDatabases(databases, link, callbackName, index = 0) {
    if (index >= databases.length) {
        showError("Profile not found in any database");
        return;
    }

    const script = document.createElement("script");
    script.src = `https://script.google.com/macros/s/${databases[index]}/exec?link=${link}&callback=${callbackName}`;
    script.onerror = () => searchDatabases(databases, link, callbackName, index + 1);
    document.body.appendChild(script);
    }

    function showError(message) {
    document.querySelector(".card-container").innerHTML = `
        <div class="error-message animate__animated animate__fadeIn">
            <h3 class="text-xl font-bold text-red-500 mb-2">${message}</h3>
            <p class="text-gray-400">Please check the URL or try again later.</p>
        </div>
    `;
    
    // Add loading animation if needed
    document.body.classList.add('loading');
    
    // Optional: Add a loading spinner
    const loader = document.createElement('span');
    loader.className = 'loader';
    document.body.appendChild(loader);
    }
    
    // Global contact function
    window.showContactDetails = function(contact) {
    Swal.fire({
        title: "Contact Details",
        html: `
        ${contact.email ? `<p><strong>Email:</strong> ${contact.email}</p>` : ''}
        ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
        ${contact.address ? `<p><strong>Address:</strong> ${contact.address}</p>` : ''}
        `,
        icon: "info",
        confirmButtonText: "Close",
        background: "#1a1a1a",
        color: "white",
        confirmButtonColor: "#2563eb"
    });
    };
