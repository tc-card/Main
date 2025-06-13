// main.js - To be placed in the same directory as your HTML file

document.addEventListener('DOMContentLoaded', function() {
    // Handle form submission
    const questionForm = document.getElementById('question-form');
    if (questionForm) {
        questionForm.addEventListener('submit', handleFormSubmit);
    }
});

document.getElementById('question-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = e.target;
    const formAction = form.getAttribute('action');
    const formData = new URLSearchParams(new FormData(form));
    
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.name = 'hidden-iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Create a new form to submit through the iframe
    const hiddenForm = document.createElement('form');
    hiddenForm.action = formAction;
    hiddenForm.method = 'POST';
    hiddenForm.target = 'hidden-iframe';
    
    // Add all form data to the hidden form
    formData.forEach((value, key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        hiddenForm.appendChild(input);
    });
    
    document.body.appendChild(hiddenForm);
    hiddenForm.submit();
    
    // Show success message
    const messageEl = document.getElementById('form-message');
    messageEl.textContent = 'Thank you for your question! We will get back to you soon.';
    messageEl.className = 'bg-green-500/20 text-green-400';
    messageEl.classList.remove('hidden');
    form.reset();
    
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 5000);
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(hiddenForm);
        document.body.removeChild(iframe);
    }, 1000);
});

function parseCSV(csvData) {
    // Simple CSV parser - adjust according to your sheet structure
    const lines = csvData.split('\n');
    const faqs = [];
    
    // Skip header row if exists
    for (let i = 1; i < lines.length; i++) {
        const [question, answer] = lines[i].split('","').map(item => 
            item.replace(/^"|"$/g, '').trim()
        );
        
        if (question && answer) {
            faqs.push({ question, answer });
        }
    }
    
    return faqs;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new URLSearchParams(new FormData(form));
    const messageEl = document.getElementById('form-message');
    
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbyBoTtdnwUOdmAXfwQrx1uZC-0nDan3e5isCEC-Gs6fKSztwB8pIRrHNfkXgPT3YH_0/exec', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            mode: 'no-cors' // Add this to bypass CORS
        });
        
        // With no-cors mode, we can't read the response, so assume success
        messageEl.textContent = 'Thank you for your question! We will get back to you soon.';
        messageEl.className = 'bg-green-500/20 text-green-400';
        messageEl.classList.remove('hidden');
        form.reset();
        
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 5000);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        messageEl.textContent = 'There was an error submitting your question. Please try again.';
        messageEl.className = 'bg-red-500/20 text-red-400';
        messageEl.classList.remove('hidden');
    }
}