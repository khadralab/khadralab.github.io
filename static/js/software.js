document.addEventListener('DOMContentLoaded', function() {
    // Debug function to check if script is running
    console.log("Software JS loaded");
    
    // Handle software images - both data-src and regular src
    initializeImages();

    // Handle images that might load later (for example after document load)
    function initializeImages() {
        console.log("Initializing images");
        
        // Handle both regular images and lazy loaded images
        const softwareImages = document.querySelectorAll('.software-image');
        
        softwareImages.forEach(img => {
            console.log("Found image:", img.src || img.dataset.src || "No source");
            
            // Check if image already loaded
            if (img.complete && img.naturalWidth > 0) {
                console.log("Image already loaded:", img.src);
                handleLoadedImage(img);
            } else {
                // Handle image load event
                img.onload = function() {
                    console.log("Image loaded:", this.src);
                    handleLoadedImage(this);
                };
                
                // Handle image error
                img.onerror = function() {
                    console.error("Image error:", this.src);
                    createImagePlaceholder(this);
                };
                
                // If it's a lazy-loaded image with data-src, load it now
                if (!img.src && img.dataset.src) {
                    img.src = img.dataset.src;
                }
            }
        });
    }
    
    // Function to handle loaded image
    function handleLoadedImage(img) {
        img.classList.add('loaded');
        
        // Get image dimensions
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const aspectRatio = width / height;
        
        console.log("Image dimensions:", width, "x", height, "Aspect ratio:", aspectRatio);
        
        const softwareItem = img.closest('.software-item');
        if (!softwareItem) {
            console.error("No parent software-item found for image");
            return;
        }
        
        // Set layout based on aspect ratio
        if (aspectRatio > 1.5) {
            console.log("Using banner layout");
            softwareItem.classList.add('banner-layout');
            img.style.objectFit = 'cover';
            img.style.width = '100%';
            img.style.height = '100%';
        } else {
            console.log("Using side-by-side layout");
            softwareItem.classList.remove('banner-layout');
            
            // Ensure image fits in container
            if (aspectRatio < 1) {
                console.log("Portrait image - fit width");
                img.style.objectFit = 'contain';
                img.style.width = '100%';
                img.style.height = 'auto';
            } else {
                console.log("Square-ish image - fit height");
                img.style.objectFit = 'contain';
                img.style.width = 'auto';
                img.style.height = '100%';
                // Center horizontally if needed
                img.style.display = 'block';
                img.style.margin = '0 auto';
            }
        }
    }
    
    // Function to create image placeholder
    function createImagePlaceholder(imgElement) {
        const container = imgElement.parentElement;
        if (!container) return;
        
        console.log("Creating placeholder for:", imgElement.src);
        
        // Create placeholder div
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        
        // Add icon to placeholder
        const icon = document.createElement('i');
        icon.className = 'fas fa-laptop-code';
        placeholder.appendChild(icon);
        
        // Replace image with placeholder
        imgElement.style.display = 'none';
        container.appendChild(placeholder);
    }
    
    // Fix: Handle window resize more efficiently
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            console.log("Window resized, recalculating layouts");
            document.querySelectorAll('.software-image.loaded').forEach(img => {
                handleLoadedImage(img);
            });
        }, 250);
    });
    
    // Ensure images are handled even if they load after initial processing
    // This is a fallback in case the normal load events don't fire
    setTimeout(function() {
        document.querySelectorAll('.software-image:not(.loaded)').forEach(img => {
            if (img.complete && img.naturalWidth > 0) {
                console.log("Late-detected loaded image:", img.src);
                handleLoadedImage(img);
            }
        });
    }, 1000);
});
