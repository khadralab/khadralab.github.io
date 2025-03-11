document.addEventListener('DOMContentLoaded', function() {
    // Variables to store filter state
    let allPublications = [];
    let filteredPublications = [];
    let topics = new Set();
    let years = new Set();
    
    // Filter elements
    const topicFilter = document.getElementById('topic-filter');
    const yearFilter = document.getElementById('year-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const publicationCountEl = document.getElementById('publication-count');
    const publicationsContainer = document.getElementById('publications-content');
    
    // Display loading state
    publicationsContainer.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Loading publications...</p>';
    
    console.log("Starting to fetch publications data...");
    
    // Updated to use relative path instead of absolute path
    fetch('/publications.json')
        .then(response => {
            console.log("Fetch response status:", response.status);
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Successfully loaded ${data.length} publications`);
            
            // Store all publications
            allPublications = data;
            
            // Process publications to extract topics and years
            processPublications(allPublications);
            
            // Initialize filters
            initializeFilters();
            
            // Display all publications initially
            filteredPublications = [...allPublications];
            displayPublications(filteredPublications);
        })
        .catch(error => {
            console.error('Error fetching publications:', error);
            publicationsContainer.innerHTML = 
                `<div class="error-container">
                    <p class="error"><i class="fas fa-exclamation-triangle"></i> Failed to load publications.</p>
                    <p>Error details: ${error.message}</p>
                    <p>Please check that the file exists at <code>./content/publications.json</code></p>
                    <p>Current page path: <code>${window.location.pathname}</code></p>
                    <button class="btn secondary-btn fetch-debug-btn">Show Debug Info</button>
                    <button class="btn secondary-btn" onclick="location.reload()">Retry</button>
                </div>`;
                
            // Add event listener to debug button
            document.querySelector('.fetch-debug-btn').addEventListener('click', function() {
                debugFetch();
            });
        });

    // Debug function to help troubleshoot fetch issues
    function debugFetch() {
        const debugInfo = document.createElement('div');
        debugInfo.className = 'debug-info';
        debugInfo.innerHTML = `
            <h4>Debug Information:</h4>
            <p>Current URL: ${window.location.href}</p>
            <p>Current Path: ${window.location.pathname}</p>
            <p>Base URL: ${document.baseURI}</p>
            <p>User Agent: ${navigator.userAgent}</p>
            <p>Protocol: ${window.location.protocol}</p>
        `;
        
        // Try alternative paths
        const paths = [
            './content/publications.json',
            '../content/publications.json',
            '/content/publications.json',
            'content/publications.json'
        ];
        
        debugInfo.innerHTML += '<h4>Attempting alternative paths:</h4>';
        
        paths.forEach(path => {
            fetch(path)
                .then(response => {
                    debugInfo.innerHTML += `<p>Path "${path}": ${response.ok ? '✅ Success' : '❌ Failed'} (Status: ${response.status})</p>`;
                })
                .catch(error => {
                    debugInfo.innerHTML += `<p>Path "${path}": ❌ Error: ${error.message}</p>`;
                });
        });
        
        document.querySelector('.error-container').appendChild(debugInfo);
    }

    // Process publications to extract topics and years
    function processPublications(publications) {
        publications.forEach(pub => {
            // Extract and store unique topics
            if (pub.topic && pub.topic !== 'Other') {
                topics.add(pub.topic);
            }
            
            // Extract and store unique years
            if (pub.year && pub.year !== 'N/A') {
                years.add(pub.year);
            }
        });
    }
    
    // Initialize filter dropdowns
    function initializeFilters() {
        // Populate topic filter
        const sortedTopics = Array.from(topics).sort();
        sortedTopics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicFilter.appendChild(option);
        });
        
        // Populate year filter - sort in descending order (newest first)
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        sortedYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
        
        // Add event listeners to filters
        topicFilter.addEventListener('change', applyFilters);
        yearFilter.addEventListener('change', applyFilters);
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    // Apply filters based on selected values
    function applyFilters() {
        const selectedTopic = topicFilter.value;
        const selectedYear = yearFilter.value;
        
        filteredPublications = allPublications.filter(pub => {
            // Topic filter
            const matchesTopic = selectedTopic === 'all' || 
                                (pub.topic && pub.topic === selectedTopic);
            
            // Year filter
            const matchesYear = selectedYear === 'all' || 
                              (pub.year && pub.year.toString() === selectedYear);
            
            return matchesTopic && matchesYear;
        });
        
        // Update UI
        displayPublications(filteredPublications);
    }
    
    // Reset all filters
    function resetFilters() {
        topicFilter.value = 'all';
        yearFilter.value = 'all';
        filteredPublications = [...allPublications];
        displayPublications(filteredPublications);
    }

    function displayPublications(publications) {
        // Update publication count
        publicationCountEl.textContent = publications.length;
        
        // Sort publications by year (newest first)
        publications.sort((a, b) => {
            // Handle non-numeric years or missing year values
            const yearA = parseInt(a.year) || 0;
            const yearB = parseInt(b.year) || 0;
            return yearB - yearA;
        });
        
        if (publications.length === 0) {
            publicationsContainer.innerHTML = '<p>No publications match your filters.</p>';
            return;
        }

        // Group publications by year
        const publicationsByYear = {};
        publications.forEach(pub => {
            const year = pub.year === 'N/A' ? 'Unknown Year' : pub.year;
            if (!publicationsByYear[year]) {
                publicationsByYear[year] = [];
            }
            publicationsByYear[year].push(pub);
        });

        // Clear the container
        publicationsContainer.innerHTML = '';
        
        // Add publications by year
        Object.keys(publicationsByYear)
            .sort((a, b) => {
                // Sort years in descending order, with 'Unknown Year' at the end
                if (a === 'Unknown Year') return 1;
                if (b === 'Unknown Year') return -1;
                return parseInt(b) - parseInt(a);
            })
            .forEach(year => {
                // Add year header
                const yearHeader = document.createElement('h3');
                yearHeader.innerHTML = `<i class="fas fa-calendar-alt"></i> ${year}`;
                publicationsContainer.appendChild(yearHeader);

                // Add publications for this year
                publicationsByYear[year].forEach(pub => {
                    const pubElement = createPublicationElement(pub);
                    publicationsContainer.appendChild(pubElement);
                });
            });
    }

    function createPublicationElement(publication) {
        const pubDiv = document.createElement('div');
        pubDiv.className = 'publication-item';
        
        let pubContent = `
            <h4>${publication.title}</h4>
            <p class="authors">${publication.authors}</p>
        `;
        
        if (publication.journal && publication.journal !== 'N/A') {
            pubContent += `<p class="journal">${publication.journal}, ${publication.year}</p>`;
        } else {
            pubContent += `<p class="journal">${publication.year}</p>`;
        }
        
        // Add topic badge if available
        if (publication.topic && publication.topic !== 'Other') {
            pubContent += `
                <span class="topic-badge">
                    <i class="fas fa-tag"></i> ${publication.topic}
                </span>
            `;
        }
        
        if (publication.url) {
            pubContent += `
                <a href="${publication.url}" target="_blank" class="btn secondary-btn" style="margin-top: 10px; padding: 5px 15px; font-size: 0.9rem;">
                    <i class="fas fa-external-link-alt"></i> View Publication
                </a>
            `;
        }
        
        pubDiv.innerHTML = pubContent;
        return pubDiv;
    }
});
