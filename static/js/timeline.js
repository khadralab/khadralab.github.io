document.addEventListener('DOMContentLoaded', function() {
    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
        // Options for the observer
        const options = {
            root: null, // viewport is the root
            threshold: 0.1, // trigger when 10% of the element is visible
            rootMargin: '0px 0px -100px 0px' // margin around the root
        };
        
        // Create an observer
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class when the element is in view
                    entry.target.classList.add('timeline-item-visible');
                    // Stop observing the element
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        
        // Get all timeline items
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        // Observe each timeline item
        timelineItems.forEach(item => {
            observer.observe(item);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.classList.add('timeline-item-visible');
        });
    }
    
    // Add event listener to category filters if they exist
    const categoryFilters = document.querySelectorAll('.timeline-filter');
    
    if (categoryFilters.length > 0) {
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all filters
                categoryFilters.forEach(f => f.classList.remove('active'));
                
                // Add active class to clicked filter
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                const timelineItems = document.querySelectorAll('.timeline-item');
                
                timelineItems.forEach(item => {
                    if (category === 'all') {
                        item.style.display = 'block';
                    } else {
                        const itemCategories = item.getAttribute('data-categories').split(',');
                        if (itemCategories.includes(category)) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    }
                });
            });
        });
    }
});
