document.addEventListener('DOMContentLoaded', function() {
    const accordionButtons = document.querySelectorAll('.accordion-button');
    
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Toggle active class on the button
            this.classList.toggle('active');
            
            // Toggle the content visibility
            const content = this.nextElementSibling;
            
            // If the content is visible, hide it
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                // Otherwise, show it
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});
