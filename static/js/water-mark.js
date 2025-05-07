/**
 * This script generates and places a dynamic watermark on video content.
 * The watermark displays user information to discourage unauthorized sharing.
 */

class VideoWatermark {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            text: options.text || 'BehindTheSearch',
            email: options.email || '',
            opacity: options.opacity || 0.3,
            fontSize: options.fontSize || '16px',
            fontFamily: options.fontFamily || 'Arial, sans-serif',
            color: options.color || 'rgba(255, 255, 255, 0.8)',
            zIndex: options.zIndex || 1000,
            container: options.container || document.body,
            enableCustomFullscreen: options.enableCustomFullscreen || false,
            moveInterval: options.moveInterval || 5000 // How often to change position (ms)
        };

        this.watermarkElement = null;
        this.isCustomFullscreen = false;
        this.originalStyles = {};
        this.moveTimer = null;
        
        // Initialize watermark
        this.init();

        // Handle standard fullscreen changes
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));
        
        // Add custom fullscreen button if enabled
        if (this.config.enableCustomFullscreen) {
            this.addCustomFullscreenButton();
        }
    }

    init() {
        // Clear any existing watermark
        this.clearWatermark();
        
        // Stop any existing movement timer
        if (this.moveTimer) {
            clearInterval(this.moveTimer);
        }
        
        // Create single dynamic watermark
        this.createDynamicWatermark();
        
        // Observe container size changes
        this.setupResizeObserver();
        
        // Start position movement
        this.startPositionChanges();
    }

    // Create a single dynamic watermark
    createDynamicWatermark() {
        const container = this.config.container;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        
        // Create the watermark element
        const watermark = document.createElement('div');
        watermark.className = 'video-watermark';
        
        // Build the watermark text content
        const watermarkContent = document.createElement('div');
        
        // Add user info
        if (this.config.text) {
            const nameSpan = document.createElement('div');
            nameSpan.textContent = this.config.text;
            watermarkContent.appendChild(nameSpan);
        }
        
        // Add email if available
        if (this.config.email) {
            const emailSpan = document.createElement('div');
            emailSpan.textContent = this.config.email;
            emailSpan.style.fontSize = (parseInt(this.config.fontSize) - 2) + 'px';
            watermarkContent.appendChild(emailSpan);
        }
        
        watermark.appendChild(watermarkContent);
        
        // Apply base styles
        Object.assign(watermark.style, {
            position: 'absolute',
            opacity: this.config.opacity,
            color: this.config.color,
            fontFamily: this.config.fontFamily,
            fontSize: this.config.fontSize,
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: this.config.zIndex.toString(),
            textAlign: 'center',
            whiteSpace: 'nowrap',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            transformOrigin: 'center',
            transition: 'all 1.2s ease-in-out'
        });
        
        // Set initial position
        this.moveWatermarkToRandomPosition(watermark, containerRect);
        
        container.appendChild(watermark);
        this.watermarkElement = watermark;
        
        return watermark;
    }
    
    // Move watermark to a random position
    moveWatermarkToRandomPosition(watermark, containerRect) {
        if (!watermark) return;
        
        // If no container rect provided, get it
        if (!containerRect) {
            containerRect = this.config.container.getBoundingClientRect();
        }
        
        // Define key positions around the video
        const positions = [
            { x: "10%", y: "10%" },     // Top left
            { x: "50%", y: "10%" },     // Top center
            { x: "90%", y: "10%" },     // Top right
            { x: "10%", y: "50%" },     // Middle left
            { x: "50%", y: "50%" },     // Center
            { x: "90%", y: "50%" },     // Middle right
            { x: "10%", y: "90%" },     // Bottom left
            { x: "50%", y: "90%" },     // Bottom center
            { x: "90%", y: "90%" }      // Bottom right
        ];
        
        // Select a random position
        const position = positions[Math.floor(Math.random() * positions.length)];
        
        // Random size variation (80% to 120% of base size)
        const sizeMultiplier = 0.8 + (Math.random() * 0.4);
        
        // Random opacity variation (70% to 100% of base opacity)
        const opacityMultiplier = 0.7 + (Math.random() * 0.3);
        
        // Random rotation (-35° to 5°)
        const rotation = -35 + (Math.random() * 40);
        
        // Apply new random position and style
        Object.assign(watermark.style, {
            left: position.x,
            top: position.y,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            opacity: this.config.opacity * opacityMultiplier,
            fontSize: parseInt(this.config.fontSize) * sizeMultiplier + 'px'
        });
    }

    // Start periodic position changes
    startPositionChanges() {
        // Change position at random intervals
        this.moveTimer = setInterval(() => {
            if (this.watermarkElement) {
                this.moveWatermarkToRandomPosition(this.watermarkElement);
            }
        }, this.config.moveInterval);
    }

    clearWatermark() {
        // Remove existing watermark element
        if (this.watermarkElement && this.watermarkElement.parentNode) {
            this.watermarkElement.parentNode.removeChild(this.watermarkElement);
        }
        this.watermarkElement = null;
    }

    handleFullscreenChange() {
        // Only handle if we're not using custom fullscreen
        if (!this.isCustomFullscreen) {
            // Small delay to let the fullscreen change complete
            setTimeout(() => {
                this.init();
            }, 100);
        }
    }

    setupResizeObserver() {
        // Clean up existing observer if present
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Use ResizeObserver if available to handle container resizing
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(entries => {
                // Debounce resize operations to improve performance
                if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    if (this.watermarkElement) {
                        this.moveWatermarkToRandomPosition(this.watermarkElement);
                    }
                }, 200);
            });
            this.resizeObserver.observe(this.config.container);
        } else {
            // Fallback for browsers that don't support ResizeObserver
            window.addEventListener('resize', () => {
                if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    if (this.watermarkElement) {
                        this.moveWatermarkToRandomPosition(this.watermarkElement);
                    }
                }, 200);
            });
        }
    }

    // Add a custom fullscreen button
    addCustomFullscreenButton() {
        // Create the button
        const fsButton = document.createElement('button');
        fsButton.className = 'bts-custom-fullscreen-btn';
        fsButton.innerHTML = '<i class="fas fa-expand"></i>';
        fsButton.setAttribute('title', 'Toggle fullscreen');
        
        // Initial button styles for desktop
        if (window.innerWidth > 768) {
            // Desktop positioning (inside the player)
            Object.assign(fsButton.style, {
                position: 'absolute',
                bottom: '10px',
                left: '45px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '7px 10px',
                cursor: 'pointer',
                zIndex: '999',
                transition: 'background-color 0.2s ease'
            });
        } else {
            // Mobile positioning (below the player)
            // These styles will be applied via CSS media queries
        }
        
        // Add hover effect for desktop
        if (window.innerWidth > 768) {
            fsButton.addEventListener('mouseover', () => {
                fsButton.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            });
            
            fsButton.addEventListener('mouseout', () => {
                fsButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            });
        }
        
        // Add click handler
        fsButton.addEventListener('click', () => {
            this.toggleCustomFullscreen();
        });
        
        // For mobile devices, add the button outside (after) the container
        if (window.innerWidth <= 768) {
            this.config.container.parentNode.insertBefore(fsButton, this.config.container.nextSibling);
        } else {
            // For desktop, add inside the container
            this.config.container.appendChild(fsButton);
        }
        
        this.fsButton = fsButton;
        
        // Disable native fullscreen on the iframe
        const iframe = this.config.container.querySelector('iframe');
        if (iframe) {
            iframe.setAttribute('allowfullscreen', 'false');
        }
        
        // Add resize handler for responsive adjustments
        window.addEventListener('resize', () => {
            if (this.resizeButtonTimeout) clearTimeout(this.resizeButtonTimeout);
            this.resizeButtonTimeout = setTimeout(() => {
                this.adjustButtonForMobile();
            }, 200);
        });
    }
    
    // Adjust button position and size for mobile devices
    adjustButtonForMobile() {
        if (!this.fsButton) return;
        
        const isMobile = window.innerWidth <= 768;
        
        // If we're switching between mobile and desktop views
        if (isMobile && this.fsButton.parentNode === this.config.container) {
            // Moving from desktop to mobile - reposition button
            this.config.container.parentNode.insertBefore(this.fsButton, this.config.container.nextSibling);
            
            // Clear inline styles to let CSS take over
            this.fsButton.removeAttribute('style');
        } 
        else if (!isMobile && this.fsButton.parentNode !== this.config.container) {
            // Moving from mobile to desktop - reposition button
            this.config.container.appendChild(this.fsButton);
            
            // Apply desktop styles
            Object.assign(this.fsButton.style, {
                position: 'absolute',
                bottom: '10px',
                left: '45px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '7px 10px',
                cursor: 'pointer',
                zIndex: '999',
                display: 'block',
                margin: '0',
                width: 'auto',
                textAlign: 'center',
                boxShadow: 'none'
            });
        }
    }
    
    // Toggle custom fullscreen
    toggleCustomFullscreen() {
        if (this.isCustomFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    // Enter custom fullscreen mode
    enterFullscreen() {
        const container = this.config.container;
        const isMobile = window.innerWidth <= 768;
        
        // Update button
        if (this.fsButton) {
            this.fsButton.innerHTML = '<i class="fas fa-compress"></i>';
        }
        
        // Save original styles
        this.originalStyles = {
            position: container.style.position || '',
            top: container.style.top || '',
            left: container.style.left || '',
            width: container.style.width || '',
            height: container.style.height || '',
            zIndex: container.style.zIndex || '',
            padding: container.style.padding || '',
            margin: container.style.margin || '',
            overflow: document.body.style.overflow || ''
        };
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
        
        // On mobile, add a body class to help with full viewport control
        if (isMobile) {
            document.body.classList.add('mobile-fullscreen-active');
            
            // Force orientation in fullscreen if device is mobile
            if ('orientation' in screen && 'lock' in screen.orientation && typeof screen.orientation.lock === 'function') {
                try {
                    // Try to lock to landscape for better video viewing
                    screen.orientation.lock('landscape').catch(() => {
                        // Silently fail if we can't lock orientation
                        console.log('Could not lock to landscape orientation');
                    });
                } catch (e) {
                    // Some browsers might not support this
                    console.log('Orientation API not supported');
                }
            }
        }
        
        // Apply fullscreen styles smoothly
        container.classList.add('bts-fullscreen-transition');
        container.classList.add('bts-custom-fullscreen');
        
        this.isCustomFullscreen = true;
        
        // Update watermark position after transition
        setTimeout(() => {
            if (this.watermarkElement) {
                this.moveWatermarkToRandomPosition(this.watermarkElement);
            }
        }, 300);
    }
    
    // Exit custom fullscreen mode
    exitFullscreen() {
        const container = this.config.container;
        const isMobile = window.innerWidth <= 768;
        
        // Update button
        if (this.fsButton) {
            this.fsButton.innerHTML = '<i class="fas fa-expand"></i>';
        }
        
        // Remove fullscreen class
        container.classList.remove('bts-custom-fullscreen');
        
        // Restore original scroll behavior
        document.body.style.overflow = this.originalStyles.overflow;
        
        // On mobile, remove the body class
        if (isMobile) {
            document.body.classList.remove('mobile-fullscreen-active');
            
            // Unlock orientation if we locked it earlier
            if ('orientation' in screen && 'unlock' in screen.orientation && typeof screen.orientation.unlock === 'function') {
                try {
                    screen.orientation.unlock();
                } catch (e) {
                    // Some browsers might not support this
                    console.log('Orientation API not supported');
                }
            }
        }
        
        this.isCustomFullscreen = false;
        
        // Update watermark position after transition
        setTimeout(() => {
            if (this.watermarkElement) {
                this.moveWatermarkToRandomPosition(this.watermarkElement);
            }
            // Remove transition class after animation completes
            container.classList.remove('bts-fullscreen-transition');
        }, 300);
    }

    // Call this when the video changes (for navigation between videos)
    refresh() {
        this.init();
    }

    // Update watermark configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.init();
    }
    
    // Cleanup method to ensure everything is stopped properly
    destroy() {
        if (this.moveTimer) {
            clearInterval(this.moveTimer);
        }
        this.clearWatermark();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}

// Helper function to initialize watermark globally
function initializeWatermark(options) {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.videoWatermark = new VideoWatermark(options);
        });
    } else {
        window.videoWatermark = new VideoWatermark(options);
    }
}