// main.js - Handles form submission silently, matches new styling

document.addEventListener('DOMContentLoaded', function() {
    const questionForm = document.getElementById('question-form');
    if (questionForm) {
        // Remove the old iframe approach, use fetch with no-cors
        questionForm.addEventListener('submit', handleFormSubmit);
    }
});

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new URLSearchParams(new FormData(form));
    const messageEl = document.getElementById('form-message');
    
    try {
        // Use fetch with no-cors so we don't navigate away or show the ugly JSON
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            mode: 'no-cors' // Critical: bypasses CORS, returns opaque response
        });
        
        // Since we use no-cors, we cannot read the response, so assume success
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