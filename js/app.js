/**
 * Main Application for Architecture Flow Visualizer
 * Handles initialization, UI interactions, and app state
 */

class ArchitectureApp {
    constructor() {
        this.canvas = null;
        this.canvasEngine = null;
        this.layerManager = null;
        this.currentTheme = 'light';
        this.sidebarCollapsed = false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    initialize() {
        this.setupCanvas();
        this.setupLayerManager();
        this.bindUIEvents();
        this.setupKeyboardShortcuts();
        this.loadInitialData();
        
        // Apply saved theme
        this.loadTheme();
        
        console.log('Architecture Flow Visualizer initialized');
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('architecture-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        this.canvasEngine = new CanvasEngine(this.canvas, {
            nodeSize: { width: 140, height: 90 },
            nodeSpacing: { x: 220, y: 180 },
            connectionWidth: 2,
            selectionWidth: 3,
            fontSize: 13,
            padding: 30
        });
        
        // Bind canvas events
        this.canvasEngine.onZoomChange = (zoom) => this.updateZoomDisplay(zoom);
        this.canvasEngine.onNodeClick = (node) => this.handleNodeClick(node);
    }
    
    setupLayerManager() {
        if (!this.canvasEngine) return;
        
        this.layerManager = new LayerManager(this.canvasEngine);
        
        // Bind layer events
        this.layerManager.onLayerToggle((layerId, visible, layer) => {
            this.handleLayerToggle(layerId, visible, layer);
        });
    }
    
    bindUIEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Fullscreen toggle
        const fullscreenToggle = document.getElementById('fullscreen-toggle');
        if (fullscreenToggle) {
            fullscreenToggle.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Zoom controls
        this.bindZoomControls();
        
        // View controls
        this.bindViewControls();
        
        // Architecture template selector
        const architectureSelect = document.getElementById('architecture-select');
        if (architectureSelect) {
            architectureSelect.addEventListener('change', (e) => {
                this.loadArchitectureTemplate(e.target.value);
            });
        }
        
        // Code modal close
        const codeModalClose = document.getElementById('code-modal-close');
        if (codeModalClose) {
            codeModalClose.addEventListener('click', () => this.hideCodeModal());
        }
        
        // Modal close
        const modalClose = document.getElementById('modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        
        // Modal background click
        const modal = document.getElementById('node-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
        
        // Event delegation for node action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.node-action-btn')) {
                const button = e.target.closest('.node-action-btn');
                const action = button.dataset.action;
                const nodeId = button.dataset.nodeId;
                
                console.log('Node action clicked:', { action, nodeId });
                
                switch (action) {
                    case 'focus':
                        this.focusNode(nodeId);
                        break;
                    case 'highlight-connections':
                        this.highlightConnections(nodeId);
                        break;
                    case 'view-code':
                        this.showCodeForNodeById(nodeId);
                        break;
                }
            }
        });
        
        // Code modal background click
        const codeModal = document.getElementById('code-modal');
        if (codeModal) {
            codeModal.addEventListener('click', (e) => {
                if (e.target === codeModal) {
                    this.hideCodeModal();
                }
            });
        }
        
        // Code modal controls
        const codeCopyBtn = document.getElementById('code-copy-btn');
        const codeFullscreenBtn = document.getElementById('code-fullscreen-btn');
        
        if (codeCopyBtn) {
            codeCopyBtn.addEventListener('click', () => this.copyCodeToClipboard());
        }
        
        if (codeFullscreenBtn) {
            codeFullscreenBtn.addEventListener('click', () => this.toggleCodeFullscreen());
        }
        
        // Window resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 100));
        
        // Prevent zoom on double-tap (mobile)
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        });
    }
    
    bindZoomControls() {
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');
        const zoomReset = document.getElementById('zoom-reset');
        
        if (zoomIn) {
            zoomIn.addEventListener('click', () => this.zoomIn());
        }
        
        if (zoomOut) {
            zoomOut.addEventListener('click', () => this.zoomOut());
        }
        
        if (zoomReset) {
            zoomReset.addEventListener('click', () => this.resetZoom());
        }
    }
    
    bindViewControls() {
        const centerView = document.getElementById('center-view');
        const fitToScreen = document.getElementById('fit-to-screen');
        
        if (centerView) {
            centerView.addEventListener('click', () => this.centerView());
        }
        
        if (fitToScreen) {
            fitToScreen.addEventListener('click', () => this.fitToScreen());
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (e.key) {
                case 'Escape':
                    this.closeModal();
                    this.hideCodeModal();
                    if (this.canvasEngine) {
                        this.canvasEngine.selectedNode = null;
                        this.canvasEngine.render();
                    }
                    break;
                    
                case '+':
                case '=':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.zoomIn();
                    }
                    break;
                    
                case '-':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.zoomOut();
                    }
                    break;
                    
                case '0':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.resetZoom();
                    }
                    break;
                    
                case 'f':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.fitToScreen();
                    }
                    break;
                    
                case 'c':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.centerView();
                    }
                    break;
                    
                case 't':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleTheme();
                    }
                    break;
                    
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleSidebar();
                    }
                    break;
                    
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        const layerIndex = parseInt(e.key) - 1;
                        this.toggleLayerByIndex(layerIndex);
                    }
                    break;
            }
        });
    }
    
    // Theme management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        // Re-render canvas with new theme colors
        if (this.canvasEngine) {
            setTimeout(() => this.canvasEngine.render(), 50);
        }
    }
    
    saveTheme() {
        localStorage.setItem('architecture-app-theme', this.currentTheme);
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('architecture-app-theme');
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
            this.currentTheme = savedTheme;
            this.applyTheme();
        }
    }
    
    // Fullscreen management
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
        
        document.addEventListener('fullscreenchange', () => {
            const fullscreenIcon = document.querySelector('#fullscreen-toggle i');
            if (fullscreenIcon) {
                fullscreenIcon.className = document.fullscreenElement ? 
                    'fas fa-compress' : 'fas fa-expand';
            }
        });
    }
    
    // Sidebar management
    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        const mainContent = document.querySelector('.main-content');
        const sidebar = document.querySelector('.sidebar');
        const sidebarIcon = document.querySelector('#sidebar-toggle i');
        
        if (mainContent) {
            mainContent.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);
        }
        
        if (sidebar) {
            sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
        }
        
        if (sidebarIcon) {
            sidebarIcon.className = this.sidebarCollapsed ? 
                'fas fa-chevron-right' : 'fas fa-chevron-left';
        }
        
        // Trigger canvas resize after sidebar animation
        setTimeout(() => {
            if (this.canvasEngine) {
                this.canvasEngine.setupCanvas();
                this.canvasEngine.render();
            }
        }, 300);
    }
    
    // Zoom controls
    zoomIn() {
        if (this.canvasEngine) {
            const currentZoom = this.canvasEngine.viewport.zoom;
            const newZoom = Math.min(currentZoom * 1.2, this.canvasEngine.viewport.maxZoom);
            this.animateZoom(currentZoom, newZoom);
        }
    }
    
    zoomOut() {
        if (this.canvasEngine) {
            const currentZoom = this.canvasEngine.viewport.zoom;
            const newZoom = Math.max(currentZoom / 1.2, this.canvasEngine.viewport.minZoom);
            this.animateZoom(currentZoom, newZoom);
        }
    }
    
    resetZoom() {
        if (this.canvasEngine) {
            const currentZoom = this.canvasEngine.viewport.zoom;
            this.animateZoom(currentZoom, 1);
        }
    }
    
    animateZoom(fromZoom, toZoom, duration = 200) {
        Utils.animate({
            from: fromZoom,
            to: toZoom,
            duration,
            easing: Utils.easing.easeOutQuad,
            onUpdate: (zoom) => {
                if (this.canvasEngine) {
                    this.canvasEngine.setZoom(zoom);
                }
            }
        });
    }
    
    updateZoomDisplay(zoom) {
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = Math.round(zoom * 100) + '%';
        }
    }
    
    // View controls
    centerView() {
        if (this.canvasEngine) {
            const currentX = this.canvasEngine.viewport.x;
            const currentY = this.canvasEngine.viewport.y;
            const targetX = this.canvasEngine.canvas.clientWidth / 2;
            const targetY = this.canvasEngine.canvas.clientHeight / 2;
            
            this.animateViewport(currentX, currentY, targetX, targetY);
        }
    }
    
    fitToScreen() {
        if (this.canvasEngine) {
            this.canvasEngine.zoomToFit();
        }
    }
    
    animateViewport(fromX, fromY, toX, toY, duration = 300) {
        Utils.animate({
            from: 0,
            to: 1,
            duration,
            easing: Utils.easing.easeOutQuad,
            onUpdate: (progress) => {
                if (this.canvasEngine) {
                    this.canvasEngine.viewport.x = Utils.lerp(fromX, toX, progress);
                    this.canvasEngine.viewport.y = Utils.lerp(fromY, toY, progress);
                    this.canvasEngine.render();
                }
            }
        });
    }
    
    // Node interaction
    handleNodeClick(node) {
        this.showNodeDetails(node);
        this.showCodeForNode(node);
    }
    
    showNodeDetails(node) {
        const modalContent = `
            <div class="node-details">
                <div class="node-header">
                    <div class="node-icon" style="color: ${this.layerManager?.getLayerColor(node.layer) || '#3b82f6'}">
                        ${node.icon ? `<i class="${node.icon}"></i>` : '<i class="fas fa-cube"></i>'}
                    </div>
                    <div class="node-info">
                        <h4>${node.label}</h4>
                        <p class="node-layer">${this.layerManager?.getLayerName(node.layer) || node.layer}</p>
                    </div>
                </div>
                
                ${node.description ? `
                    <div class="node-description">
                        <h5>Description</h5>
                        <p>${node.description}</p>
                    </div>
                ` : ''}
                
                ${node.data && Object.keys(node.data).length > 0 ? `
                    <div class="node-properties">
                        <h5>Properties</h5>
                        <div class="property-list">
                            ${Object.entries(node.data).map(([key, value]) => `
                                <div class="property-item">
                                    <span class="property-key">${key}:</span>
                                    <span class="property-value">${JSON.stringify(value)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                                <div class="node-actions">
                    <button class="btn node-action-btn" data-action="focus" data-node-id="${node.id}">
                        <i class="fas fa-crosshairs"></i> Focus
                    </button>
                    <button class="btn node-action-btn" data-action="highlight-connections" data-node-id="${node.id}">
                        <i class="fas fa-project-diagram"></i> Show Connections
                    </button>
                    ${node.code ? `
                        <button class="btn node-action-btn" data-action="view-code" data-node-id="${node.id}">
                            <i class="fas fa-code"></i> View Code
                        </button>
                    ` : ''}
                </div>
                
                <div class="node-stats">
                    <div class="stat-item">
                        <span class="stat-label">Type:</span>
                        <span class="stat-value">${node.type || 'default'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Layer:</span>
                        <span class="stat-value">${node.layer}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Position:</span>
                        <span class="stat-value">(${Math.round(node.x)}, ${Math.round(node.y)})</span>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(`Node: ${node.label}`, modalContent);
    }
    
    showCodeForNodeById(nodeId) {
        console.log('showCodeForNodeById called with nodeId:', nodeId);
        if (this.canvasEngine) {
            const node = this.canvasEngine.nodes.get(nodeId);
            console.log('Found node:', node);
            if (node) {
                this.showCodeForNode(node);
            } else {
                console.error('Node not found with ID:', nodeId);
            }
        } else {
            console.error('Canvas engine not available');
        }
        this.closeModal();
    }
    
    showCodeForNode(node) {
        console.log('showCodeForNode called with node:', node);
        
        const codeModal = document.getElementById('code-modal');
        const codeModalTitle = document.getElementById('code-modal-title');
        const codeModalLanguage = document.getElementById('code-modal-language');
        const codeModalDisplay = document.getElementById('code-modal-display');
        
        console.log('Code modal elements:', { codeModal, codeModalTitle, codeModalLanguage, codeModalDisplay });
        
        if (!codeModal || !codeModalTitle || !codeModalLanguage || !codeModalDisplay) {
            console.error('Code modal elements not found');
            return;
        }
        
        if (node.code) {
            console.log('Node has code, showing code modal');
            codeModalTitle.textContent = `${node.label} - Implementation`;
            codeModalLanguage.textContent = node.codeLanguage || 'Code';
            codeModalDisplay.textContent = node.code;
            codeModalDisplay.className = `language-${node.codeLanguage || 'javascript'}`;
            
            // Store current code for copy functionality
            this.currentCode = node.code;
            
            // Show modal
            codeModal.classList.add('show');
            
            // Apply syntax highlighting if available
            if (window.Prism) {
                window.Prism.highlightElement(codeModalDisplay);
            }
        } else {
            console.log('Node has no code, showing placeholder');
            // Show placeholder if no code available
            codeModalTitle.textContent = `${node.label} - No Implementation`;
            codeModalLanguage.textContent = 'Info';
            codeModalDisplay.textContent = `// No code implementation available for ${node.label}\n// This component is part of the ${this.layerManager?.getLayerName(node.layer) || node.layer} layer\n\n// Typical implementations might include:\n// - API endpoints\n// - Database models\n// - Business logic\n// - Configuration files`;
            codeModalDisplay.className = 'language-javascript';
            
            // Store placeholder for copy functionality
            this.currentCode = codeModalDisplay.textContent;
            
            // Show modal
            codeModal.classList.add('show');
        }
    }
    
    hideCodeModal() {
        const codeModal = document.getElementById('code-modal');
        if (codeModal) {
            codeModal.classList.remove('show', 'fullscreen');
        }
    }
    
    copyCodeToClipboard() {
        if (this.currentCode) {
            Utils.copyToClipboard(this.currentCode).then(success => {
                const copyBtn = document.getElementById('code-copy-btn');
                if (success && copyBtn) {
                    // Show success feedback
                    const icon = copyBtn.querySelector('i');
                    const originalClass = icon.className;
                    icon.className = 'fas fa-check';
                    copyBtn.style.color = '#10b981';
                    
                    setTimeout(() => {
                        icon.className = originalClass;
                        copyBtn.style.color = '';
                    }, 2000);
                }
            });
        }
    }
    
    toggleCodeFullscreen() {
        const codeModal = document.getElementById('code-modal');
        const fullscreenBtn = document.getElementById('code-fullscreen-btn');
        
        if (codeModal && fullscreenBtn) {
            const isFullscreen = codeModal.classList.contains('fullscreen');
            const icon = fullscreenBtn.querySelector('i');
            
            if (isFullscreen) {
                codeModal.classList.remove('fullscreen');
                icon.className = 'fas fa-expand';
                fullscreenBtn.title = 'Toggle Fullscreen';
            } else {
                codeModal.classList.add('fullscreen');
                icon.className = 'fas fa-compress';
                fullscreenBtn.title = 'Exit Fullscreen';
            }
        }
    }
    
    // Layer interaction
    handleLayerToggle(layerId, visible, layer) {
        // Add smooth fade animation for layer visibility
        if (this.canvasEngine) {
            const duration = 200;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Update layer opacity based on visibility and animation progress
                const targetOpacity = visible ? 1 : 0;
                const currentOpacity = visible ? progress : 1 - progress;
                
                // Store opacity in layer for rendering
                layer.opacity = currentOpacity;
                
                this.canvasEngine.render();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    layer.opacity = targetOpacity;
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
    
    toggleLayerByIndex(index) {
        if (this.layerManager) {
            const layers = this.layerManager.getLayerData();
            if (index < layers.length) {
                const layer = layers[index];
                this.layerManager.toggleLayer(layer.id);
            }
        }
    }
    
    focusNode(nodeId) {
        if (this.canvasEngine) {
            const node = this.canvasEngine.nodes.get(nodeId);
            if (node) {
                const targetX = this.canvasEngine.canvas.clientWidth / 2 - node.x * this.canvasEngine.viewport.zoom;
                const targetY = this.canvasEngine.canvas.clientHeight / 2 - node.y * this.canvasEngine.viewport.zoom;
                
                this.animateViewport(
                    this.canvasEngine.viewport.x,
                    this.canvasEngine.viewport.y,
                    targetX,
                    targetY
                );
                
                // Highlight the node
                this.canvasEngine.selectedNode = node;
                this.canvasEngine.render();
            }
        }
        this.closeModal();
    }
    
    highlightConnections(nodeId) {
        if (this.canvasEngine) {
            const node = this.canvasEngine.nodes.get(nodeId);
            if (node) {
                // Clear any existing highlights
                this.canvasEngine.clearHighlights();
                
                // Find all connections for this node
                const connections = this.canvasEngine.connections.filter(conn => 
                    conn.from === nodeId || conn.to === nodeId
                );
                
                // Highlight the node and its connections
                this.canvasEngine.highlightedNode = node;
                this.canvasEngine.highlightedConnections = connections;
                
                // Also highlight connected nodes
                const connectedNodeIds = new Set();
                connections.forEach(conn => {
                    connectedNodeIds.add(conn.from);
                    connectedNodeIds.add(conn.to);
                });
                
                this.canvasEngine.highlightedNodes = Array.from(connectedNodeIds)
                    .map(id => this.canvasEngine.nodes.get(id))
                    .filter(Boolean);
                
                this.canvasEngine.render();
                
                // Auto-clear highlights after 5 seconds
                setTimeout(() => {
                    if (this.canvasEngine) {
                        this.canvasEngine.clearHighlights();
                        this.canvasEngine.render();
                    }
                }, 5000);
            }
        }
        this.closeModal();
    }
    
    // Modal management
    showModal(title, content) {
        const modal = document.getElementById('node-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = title;
            modalContent.innerHTML = content;
            modal.classList.add('show');
        }
    }
    
    closeModal() {
        const modal = document.getElementById('node-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    // Architecture template loading
    loadArchitectureTemplate(templateName) {
        if (!templateName) return;
        
        this.showLoading(true);
        
        // Simulate loading with animation
        setTimeout(() => {
            console.log(`Loading architecture template: ${templateName}`);
            const templateData = ArchitectureData.getTemplate(templateName);
            
            if (templateData) {
                this.loadTemplateData(templateData);
            } else {
                console.warn(`Template not found: ${templateName}`);
                this.createFallbackData();
            }
            
            this.showLoading(false);
        }, 500);
    }
    
    loadTemplateData(templateData) {
        if (this.canvasEngine && this.layerManager) {
            this.canvasEngine.setData(templateData);
            this.layerManager.setLayerData(templateData.layers);
            this.layerManager.updateStats();
            
            // Fit to screen after a short delay
            setTimeout(() => {
                this.canvasEngine.zoomToFit();
            }, 100);
        }
    }
    
    createFallbackData() {
        // Fallback data if template is not found
        const fallbackData = {
            layers: [
                { id: 'default', name: 'Default Layer', color: '#3b82f6', visible: true }
            ],
            nodes: [
                { id: '1', x: 0, y: 0, label: 'Sample Node', layer: 'default', icon: 'fas fa-cube', type: 'default' }
            ],
            connections: []
        };
        
        this.loadTemplateData(fallbackData);
    }
    
    showLoading(show) {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.toggle('show', show);
        }
    }
    
    // Utility methods
    handleResize() {
        if (this.canvasEngine) {
            this.canvasEngine.setupCanvas();
            this.canvasEngine.render();
        }
    }
    
    loadInitialData() {
        // Load default architecture template
        this.loadArchitectureTemplate('microservices');
    }
    
    // Public API for external access
    getCanvasEngine() {
        return this.canvasEngine;
    }
    
    getLayerManager() {
        return this.layerManager;
    }
    
    // Export functionality
    exportData() {
        if (this.canvasEngine && this.layerManager) {
            const data = {
                layers: this.layerManager.getLayerData(),
                nodes: Array.from(this.canvasEngine.nodes.values()),
                connections: this.canvasEngine.connections,
                viewport: this.canvasEngine.viewport,
                theme: this.currentTheme,
                exportedAt: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            Utils.downloadFile(dataStr, 'architecture-flow.json', 'application/json');
        }
    }
    
    importData(data) {
        if (this.canvasEngine && this.layerManager && data) {
            this.canvasEngine.setData(data);
            this.layerManager.setLayerData(data.layers);
            this.layerManager.updateStats();
            
            if (data.viewport) {
                Object.assign(this.canvasEngine.viewport, data.viewport);
            }
            
            if (data.theme) {
                this.currentTheme = data.theme;
                this.applyTheme();
            }
        }
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ArchitectureApp();
    
    // Make app globally accessible for debugging and external access
    window.app = app;
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArchitectureApp;
}