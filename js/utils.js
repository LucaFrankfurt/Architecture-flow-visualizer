/**
 * Utility functions for the Architecture Flow Visualizer
 */

class Utils {
    /**
     * Generate a unique ID
     */
    static generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Deep clone an object
     */
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Debounce function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Calculate distance between two points
     */
    static distance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check if a point is inside a rectangle
     */
    static pointInRect(point, rect) {
        return point.x >= rect.x && 
               point.x <= rect.x + rect.width && 
               point.y >= rect.y && 
               point.y <= rect.y + rect.height;
    }

    /**
     * Get the center point of a rectangle
     */
    static getRectCenter(rect) {
        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
        };
    }

    /**
     * Clamp a value between min and max
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Linear interpolation
     */
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    /**
     * Format number as percentage
     */
    static formatPercentage(value) {
        return Math.round(value * 100) + '%';
    }

    /**
     * Get element position relative to page
     */
    static getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };
    }

    /**
     * Convert hex color to RGB
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to hex color
     */
    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Generate color with opacity
     */
    static colorWithOpacity(color, opacity) {
        if (color.startsWith('#')) {
            const rgb = this.hexToRgb(color);
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        }
        return color;
    }

    /**
     * Check if device is mobile
     */
    static isMobile() {
        return window.innerWidth <= 768;
    }

    /**
     * Get device pixel ratio
     */
    static getPixelRatio() {
        return window.devicePixelRatio || 1;
    }

    /**
     * Load image from URL
     */
    static loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    /**
     * Download data as file
     */
    static downloadFile(data, filename, type = 'application/json') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Parse URL parameters
     */
    static getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    /**
     * Set URL parameter without reload
     */
    static setUrlParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
    }

    /**
     * Animate a value over time
     */
    static animate(options) {
        const {
            from,
            to,
            duration = 300,
            easing = (t) => t,
            onUpdate,
            onComplete
        } = options;

        const startTime = Date.now();
        
        function step() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);
            
            const currentValue = from + (to - from) * easedProgress;
            
            if (onUpdate) {
                onUpdate(currentValue, progress);
            }
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else if (onComplete) {
                onComplete();
            }
        }
        
        requestAnimationFrame(step);
    }

    /**
     * Easing functions
     */
    static easing = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    };

    /**
     * Get contrast color (black or white) for a background color
     */
    static getContrastColor(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    /**
     * Throttle function calls
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Format file size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Copy text to clipboard
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    }
}

// Export for use in other modules
window.Utils = Utils;