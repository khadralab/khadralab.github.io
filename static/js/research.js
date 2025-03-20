document.addEventListener("DOMContentLoaded", function () {
    /*** 🔹 Initialize AOS (Animate on Scroll) Library ***/
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 800,
            easing: "ease-in-out",
            once: false,
            mirror: false,
            offset: 100
        });
    }

    /*** 🔹 Smooth Scrolling for Internal Links ***/
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();

            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });

    /*** 🔹 Enhanced Research Card Interactions ***/
    const researchCards = document.querySelectorAll(".research-card");
    
    researchCards.forEach((card) => {
        // Enhanced hover effects
        card.addEventListener("mouseenter", function() {
            this.classList.add("hover-effect");
        });
        
        card.addEventListener("mouseleave", function() {
            this.classList.remove("hover-effect");
        });
        
        // Add touch support for mobile devices
        card.addEventListener("touchstart", function() {
            this.classList.add("hover-effect");
        });
        
        card.addEventListener("touchend", function() {
            setTimeout(() => {
                this.classList.remove("hover-effect");
            }, 300);
        });
        
        // Enhance scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, 300);
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(card);
    });
    
    /*** 🔹 Responsive Grid Adjustment ***/
    function adjustGridLayout() {
        const researchGrid = document.querySelector('.research-grid');
        const methodsGrid = document.querySelector('.methods-grid');
        const collaboratorsGrid = document.querySelector('.collaborators-grid');
        
        if (!researchGrid) return;
        
        const width = window.innerWidth;
        
        if (width <= 480) {
            // Extra small devices
            if (researchGrid) researchGrid.style.gap = '15px';
            if (methodsGrid) methodsGrid.style.gap = '15px';
            if (collaboratorsGrid) collaboratorsGrid.style.gap = '15px';
        } else {
            // Reset to CSS default
            if (researchGrid) researchGrid.style.gap = '';
            if (methodsGrid) methodsGrid.style.gap = '';
            if (collaboratorsGrid) collaboratorsGrid.style.gap = '';
        }
    }
    
    // Run on load and resize
    adjustGridLayout();
    window.addEventListener('resize', adjustGridLayout);

    /*** 🔹 Lazy Loading Images ***/
    const lazyImages = document.querySelectorAll("img[data-src]");
    
    if ('IntersectionObserver' in window) {
        const lazyLoad = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute("data-src");
                    img.removeAttribute("data-src");
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach((img) => lazyLoad.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach((img) => {
            img.src = img.getAttribute("data-src");
            img.removeAttribute("data-src");
        });
    }

    /*** 🔹 Back-to-Top Button ***/
    const backToTopBtn = document.createElement("button");
    backToTopBtn.innerHTML = "↑";
    backToTopBtn.className = "back-to-top hidden";
    backToTopBtn.setAttribute("aria-label", "Back to top");
    document.body.appendChild(backToTopBtn);

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Show/hide back-to-top button based on scroll position
    const scrollThreshold = 300;
    
    function updateBackToTopButton() {
        if (window.scrollY > scrollThreshold) {
            backToTopBtn.classList.remove("hidden");
        } else {
            backToTopBtn.classList.add("hidden");
        }
    }

    window.addEventListener("scroll", () => {
        updateBackToTopButton();
    });
    
    // Initialize on page load
    updateBackToTopButton();
});

