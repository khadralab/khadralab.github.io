document.addEventListener('DOMContentLoaded', function() {
    // Filter elements
    const topicFilter = document.getElementById('topic-filter');
    const yearFilter = document.getElementById('year-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const publicationCountEl = document.getElementById('publication-count');
    
    // Select all pre-rendered publication items
    const publications = document.querySelectorAll('.publication-item');
    
    // If elements don't exist on the current page, exit early
    if (!topicFilter || !yearFilter || !publications.length) {
        return;
    }

    console.log(`Found ${publications.length} pre-rendered publications on page.`);

    // Function to update the visible count
    function updateCount() {
        let count = 0;
        publications.forEach(p => {
            if (p.style.display !== 'none') {
                count++;
            }
        });
        if (publicationCountEl) {
            publicationCountEl.textContent = count;
        }
    }

    // Function to apply filters
    function applyFilters() {
        const selectedTopic = topicFilter.value;
        const selectedYear = yearFilter.value;

        publications.forEach(p => {
            const topic = p.getAttribute('data-topic');
            const year = p.getAttribute('data-year');
            
            const matchesTopic = (selectedTopic === 'all' || topic === selectedTopic);
            const matchesYear = (selectedYear === 'all' || year === selectedYear);

            if (matchesTopic && matchesYear) {
                p.style.display = 'block';
            } else {
                p.style.display = 'none';
            }
        });
        
        updateCount();
    }

    // Event listeners
    topicFilter.addEventListener('change', applyFilters);
    yearFilter.addEventListener('change', applyFilters);
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            topicFilter.value = 'all';
            yearFilter.value = 'all';
            applyFilters();
        });
    }

    // Initial count update
    updateCount();
});
