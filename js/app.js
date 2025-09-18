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
        
        // Node management state
        this.connectionMode = false;
        this.selectedNodeForConnection = null;
        this.nextNodeId = 1000; // Start from 1000 to avoid conflicts
        
        // Copy/paste state
        this.nodeClipboard = null;
        this.lastClickedNode = null;
        
        // Command history for undo/redo
        this.commandHistory = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
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
        
        // Set app reference for state checking
        this.canvasEngine.app = this;
        
        // Bind canvas events
        this.canvasEngine.onZoomChange = (zoom) => this.updateZoomDisplay(zoom);
        this.canvasEngine.onNodeClick = (node) => this.handleNodeClick(node);
        this.canvasEngine.onConnectionClick = (connection) => this.handleConnectionClick(connection);
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
                    case 'edit-node':
                        this.showEditNodeModal(nodeId);
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
        
        // Node management controls
        const addNodeBtn = document.getElementById('add-node-btn');
        const connectionModeBtn = document.getElementById('connection-mode-btn');
        const autoLayoutBtn = document.getElementById('auto-layout-btn');
        const clearAllBtn = document.getElementById('clear-all-btn');
        
        if (addNodeBtn) {
            addNodeBtn.addEventListener('click', () => this.showNodeCreationModal());
        }
        
        if (connectionModeBtn) {
            connectionModeBtn.addEventListener('click', () => this.toggleConnectionMode());
        }
        
        if (autoLayoutBtn) {
            autoLayoutBtn.addEventListener('click', () => this.autoLayoutNodes());
        }
        
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllNodes());
        }
        
        // Import/Export controls
        const exportJsonBtn = document.getElementById('export-json-btn');
        const importJsonBtn = document.getElementById('import-json-btn');
        const exportImageBtn = document.getElementById('export-image-btn');
        const importFileInput = document.getElementById('import-file-input');
        
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => this.exportDiagramAsJSON());
        }
        
        if (importJsonBtn) {
            importJsonBtn.addEventListener('click', () => this.triggerImportJSON());
        }
        
        if (exportImageBtn) {
            exportImageBtn.addEventListener('click', () => this.exportDiagramAsImage());
        }
        
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => this.handleImportJSON(e));
        }
        
        // Node creation modal
        const nodeCreationClose = document.getElementById('node-creation-close');
        const nodeCreationForm = document.getElementById('node-creation-form');
        const cancelNodeBtn = document.getElementById('cancel-node');
        
        if (nodeCreationClose) {
            nodeCreationClose.addEventListener('click', () => this.hideNodeCreationModal());
        }
        
        if (cancelNodeBtn) {
            cancelNodeBtn.addEventListener('click', () => this.hideNodeCreationModal());
        }
        
        if (nodeCreationForm) {
            nodeCreationForm.addEventListener('submit', (e) => this.handleNodeCreation(e));
        }
        
        // Connection edit modal
        const connectionEditClose = document.getElementById('connection-edit-close');
        const connectionEditForm = document.getElementById('connection-edit-form');
        const cancelEditConnectionBtn = document.getElementById('cancel-edit-connection');
        const deleteConnectionBtn = document.getElementById('delete-connection');
        
        if (connectionEditClose) {
            connectionEditClose.addEventListener('click', () => this.hideConnectionEditModal());
        }
        
        if (cancelEditConnectionBtn) {
            cancelEditConnectionBtn.addEventListener('click', () => this.hideConnectionEditModal());
        }
        
        if (deleteConnectionBtn) {
            deleteConnectionBtn.addEventListener('click', () => this.handleDeleteConnection());
        }
        
        if (connectionEditForm) {
            connectionEditForm.addEventListener('submit', (e) => this.handleConnectionEdit(e));
        }
        
        // Edit node modal
        const editNodeForm = document.getElementById('edit-node-form');
        const cancelEditNodeBtn = document.getElementById('cancel-edit-node');
        
        if (editNodeForm) {
            editNodeForm.addEventListener('submit', (e) => this.handleNodeEdit(e));
        }
        
        if (cancelEditNodeBtn) {
            cancelEditNodeBtn.addEventListener('click', () => this.hideEditNodeModal());
        }
        
        // Icon selector
        this.setupIconSelector();
        
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
                        if (e.shiftKey) {
                            // Copy node (Ctrl+Shift+C)
                            e.preventDefault();
                            this.copySelectedNode();
                        } else {
                            // Center view (Ctrl+C)
                            e.preventDefault();
                            this.centerView();
                        }
                    }
                    break;
                    
                case 'v':
                    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                        // Paste node (Ctrl+Shift+V)
                        e.preventDefault();
                        this.pasteNode();
                    }
                    break;
                    
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        if (e.shiftKey) {
                            // Redo (Ctrl+Shift+Z)
                            e.preventDefault();
                            this.redo();
                        } else {
                            // Undo (Ctrl+Z)
                            e.preventDefault();
                            this.undo();
                        }
                    }
                    break;
                    
                case 'y':
                    if (e.ctrlKey || e.metaKey) {
                        // Redo (Ctrl+Y)
                        e.preventDefault();
                        this.redo();
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
        // Track last clicked node for copy/paste
        this.lastClickedNode = node;
        
        // Handle connection mode
        if (this.connectionMode) {
            if (!this.selectedNodeForConnection) {
                // First node selected
                this.selectedNodeForConnection = node;
                // Visual feedback - highlight selected node
                if (this.canvasEngine) {
                    this.canvasEngine.selectedNode = node;
                    this.canvasEngine.render();
                }
                
                // Update indicator
                const indicator = document.getElementById('connection-mode-indicator');
                if (indicator) {
                    indicator.innerHTML = `<i class="fas fa-link"></i> Connection Mode: Click target node to connect with "${node.label}"`;
                }
            } else if (this.selectedNodeForConnection.id !== node.id) {
                // Second node selected - create connection
                const command = this.createAddConnectionCommand(
                    this.selectedNodeForConnection.id, 
                    node.id
                );
                
                // Check if connection already exists before executing
                const connectionExists = this.canvasEngine.connections.some(conn => 
                    (conn.from === this.selectedNodeForConnection.id && conn.to === node.id) ||
                    (conn.from === node.id && conn.to === this.selectedNodeForConnection.id)
                );
                
                if (!connectionExists) {
                    this.executeCommand(command);
                    console.log(`Connected ${this.selectedNodeForConnection.label} → ${node.label}`);
                    this.canvasEngine.render();
                } else {
                    alert('Connection already exists between these nodes.');
                }
                
                // Reset selection
                this.selectedNodeForConnection = null;
                if (this.canvasEngine) {
                    this.canvasEngine.selectedNode = null;
                    this.canvasEngine.render();
                }
                
                // Reset indicator
                const indicator = document.getElementById('connection-mode-indicator');
                if (indicator) {
                    indicator.innerHTML = '<i class="fas fa-link"></i> Connection Mode: Click two nodes to connect';
                }
            } else {
                // Same node clicked - deselect
                this.selectedNodeForConnection = null;
                if (this.canvasEngine) {
                    this.canvasEngine.selectedNode = null;
                    this.canvasEngine.render();
                }
                
                const indicator = document.getElementById('connection-mode-indicator');
                if (indicator) {
                    indicator.innerHTML = '<i class="fas fa-link"></i> Connection Mode: Click two nodes to connect';
                }
            }
        } else {
            // Normal mode - show node details
            this.showNodeDetails(node);
        }
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
                    <button class="btn node-action-btn" data-action="edit-node" data-node-id="${node.id}">
                        <i class="fas fa-edit"></i> Edit Node
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
    
    handleConnectionClick(connection) {
        if (this.connectionMode) {
            // Don't show edit modal in connection mode
            return;
        }
        
        this.showConnectionEditModal(connection);
    }
    
    showConnectionEditModal(connection) {
        const modal = document.getElementById('connection-edit-modal');
        const form = document.getElementById('connection-edit-form');
        
        if (!modal || !form || !this.canvasEngine) return;
        
        // Get node labels for display
        const fromNode = this.canvasEngine.nodes.get(connection.from);
        const toNode = this.canvasEngine.nodes.get(connection.to);
        
        if (!fromNode || !toNode) return;
        
        // Populate form
        document.getElementById('connection-from').value = fromNode.label;
        document.getElementById('connection-to').value = toNode.label;
        document.getElementById('connection-label').value = connection.label || '';
        document.getElementById('connection-type').value = connection.type || 'default';
        document.getElementById('connection-description').value = connection.description || '';
        
        // Store reference to current connection
        this.currentEditingConnection = connection;
        
        // Show modal
        modal.classList.add('show');
    }
    
    hideConnectionEditModal() {
        const modal = document.getElementById('connection-edit-modal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.currentEditingConnection = null;
    }
    
    handleConnectionEdit(e) {
        e.preventDefault();
        
        if (!this.currentEditingConnection || !this.canvasEngine) return;
        
        const formData = new FormData(e.target);
        const updates = {
            label: document.getElementById('connection-label').value,
            type: document.getElementById('connection-type').value,
            description: document.getElementById('connection-description').value
        };
        
        // Create command for undo/redo
        const command = this.createUpdateConnectionCommand(this.currentEditingConnection.id, updates);
        this.executeCommand(command);
        
        this.hideConnectionEditModal();
        this.canvasEngine.render();
    }
    
    handleDeleteConnection() {
        if (!this.currentEditingConnection || !this.canvasEngine) return;
        
        if (confirm('Are you sure you want to delete this connection?')) {
            // Create command for undo/redo
            const command = this.createDeleteConnectionCommand(this.currentEditingConnection);
            this.executeCommand(command);
            
            this.hideConnectionEditModal();
            this.canvasEngine.selectedConnection = null;
            this.canvasEngine.render();
        }
    }
    
    createUpdateConnectionCommand(connectionId, updates) {
        const connection = this.canvasEngine.connections.find(conn => conn.id === connectionId);
        if (!connection) return null;
        
        const oldData = { ...connection };
        
        return {
            name: `Update Connection: ${connection.from} → ${connection.to}`,
            execute: () => {
                if (this.canvasEngine) {
                    this.canvasEngine.updateConnection(connectionId, updates);
                }
            },
            undo: () => {
                if (this.canvasEngine) {
                    this.canvasEngine.updateConnection(connectionId, {
                        label: oldData.label,
                        type: oldData.type,
                        description: oldData.description
                    });
                }
            }
        };
    }
    
    createDeleteConnectionCommand(connection) {
        return {
            name: `Delete Connection: ${connection.from} → ${connection.to}`,
            execute: () => {
                if (this.canvasEngine) {
                    this.canvasEngine.removeConnection(connection.from, connection.to);
                }
            },
            undo: () => {
                if (this.canvasEngine) {
                    this.canvasEngine.addConnection(connection);
                }
            }
        };
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
    
    // Node Creation and Management
    showNodeCreationModal() {
        const modal = document.getElementById('node-creation-modal');
        const layerSelect = document.getElementById('node-layer');
        
        // Populate layer options
        if (layerSelect && this.layerManager) {
            layerSelect.innerHTML = '';
            const layers = this.layerManager.getLayerData();
            layers.forEach(layer => {
                const option = document.createElement('option');
                option.value = layer.id;
                option.textContent = layer.name;
                layerSelect.appendChild(option);
            });
        }
        
        // Reset form
        const form = document.getElementById('node-creation-form');
        if (form) {
            form.reset();
            document.getElementById('node-icon').value = 'fas fa-cube';
            // Icon preview will be handled by the icon selector
        }
        
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    hideNodeCreationModal() {
        const modal = document.getElementById('node-creation-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    handleNodeCreation(e) {
        e.preventDefault();
        
        const nodeData = {
            id: `node-${this.nextNodeId++}`,
            label: document.getElementById('node-label').value,
            type: document.getElementById('node-type').value,
            layer: document.getElementById('node-layer').value,
            icon: document.getElementById('node-icon').value,
            description: document.getElementById('node-description').value,
            x: 0, // Will be positioned in center
            y: 0,
            code: '', // Can be added later through edit
            codeLanguage: 'javascript'
        };
        
        // Position new node in center of viewport
        if (this.canvasEngine) {
            const canvas = this.canvasEngine.canvas;
            const viewport = this.canvasEngine.viewport;
            nodeData.x = (-viewport.x + canvas.clientWidth / 2) / viewport.zoom;
            nodeData.y = (-viewport.y + canvas.clientHeight / 2) / viewport.zoom;
        }
        
        this.createNode(nodeData);
        this.hideNodeCreationModal();
    }
    
    createNode(nodeData) {
        const command = this.createAddNodeCommand(nodeData);
        if (command) {
            this.executeCommand(command);
            this.canvasEngine?.render();
            console.log('Created node:', nodeData);
        }
    }
    
    setupIconSelector() {
        // Setup for create modal
        const createIconBtns = document.querySelectorAll('#icon-selector .icon-btn');
        createIconBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const icon = btn.dataset.icon;
                
                // Update selected state for create modal
                createIconBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Setup for edit modal
        const editIconBtns = document.querySelectorAll('#edit-icon-selector .icon-btn');
        editIconBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const icon = btn.dataset.icon;
                
                // Update selected state for edit modal
                editIconBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    // Connection Management
    toggleConnectionMode() {
        this.connectionMode = !this.connectionMode;
        const btn = document.getElementById('connection-mode-btn');
        const indicator = this.getOrCreateConnectionIndicator();
        
        if (btn) {
            btn.classList.toggle('connection-mode-active', this.connectionMode);
            btn.innerHTML = this.connectionMode ? 
                '<i class="fas fa-times"></i> Exit Connection Mode' : 
                '<i class="fas fa-link"></i> Connection Mode';
        }
        
        if (indicator) {
            indicator.classList.toggle('show', this.connectionMode);
        }
        
        // Reset selection when exiting
        if (!this.connectionMode) {
            this.selectedNodeForConnection = null;
        }
        
        // Update canvas cursor
        if (this.canvasEngine) {
            this.canvasEngine.canvas.style.cursor = this.connectionMode ? 'crosshair' : 'grab';
        }
    }
    
    getOrCreateConnectionIndicator() {
        let indicator = document.getElementById('connection-mode-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'connection-mode-indicator';
            indicator.className = 'connection-mode-indicator';
            indicator.innerHTML = '<i class="fas fa-link"></i> Connection Mode: Click two nodes to connect';
            document.body.appendChild(indicator);
        }
        return indicator;
    }
    
    // Utility Methods
    autoLayoutNodes() {
        if (!this.canvasEngine) return;
        
        const nodes = Array.from(this.canvasEngine.nodes.values());
        const layers = this.layerManager?.getLayerData() || [];
        
        // Group nodes by layer
        const nodesByLayer = {};
        layers.forEach(layer => {
            nodesByLayer[layer.id] = nodes.filter(node => node.layer === layer.id);
        });
        
        // Layout nodes in a grid per layer
        let currentY = -300;
        const layerSpacing = 200;
        const nodeSpacing = 180;
        
        Object.keys(nodesByLayer).forEach(layerId => {
            const layerNodes = nodesByLayer[layerId];
            if (layerNodes.length === 0) return;
            
            const nodesPerRow = Math.ceil(Math.sqrt(layerNodes.length));
            const totalWidth = (nodesPerRow - 1) * nodeSpacing;
            const startX = -totalWidth / 2;
            
            layerNodes.forEach((node, index) => {
                const row = Math.floor(index / nodesPerRow);
                const col = index % nodesPerRow;
                
                node.x = startX + col * nodeSpacing;
                node.y = currentY + row * nodeSpacing;
            });
            
            const rows = Math.ceil(layerNodes.length / nodesPerRow);
            currentY += (rows - 1) * nodeSpacing + layerSpacing;
        });
        
        this.canvasEngine.render();
        
        // Fit to screen after layout
        setTimeout(() => {
            this.canvasEngine.zoomToFit();
        }, 100);
    }
    
    clearAllNodes() {
        if (!confirm('Are you sure you want to clear all nodes? This action cannot be undone.')) {
            return;
        }
        
        if (this.canvasEngine) {
            this.canvasEngine.clearAll();
            this.canvasEngine.render();
            
            if (this.layerManager) {
                this.layerManager.updateStats();
            }
        }
    }
    
    // Import/Export Methods
    exportDiagramAsJSON() {
        if (!this.canvasEngine) {
            alert('No diagram to export.');
            return;
        }
        
        const diagramData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            nodes: Array.from(this.canvasEngine.nodes.values()),
            connections: Array.from(this.canvasEngine.connections.values()),
            layers: this.layerManager ? this.layerManager.getLayerData() : [],
            viewport: this.canvasEngine.viewport ? { ...this.canvasEngine.viewport } : null
        };
        
        const dataStr = JSON.stringify(diagramData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `architecture-diagram-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Diagram exported successfully');
        console.log('Diagram exported:', diagramData);
    }
    
    triggerImportJSON() {
        const fileInput = document.getElementById('import-file-input');
        if (fileInput) {
            fileInput.click();
        }
    }
    
    handleImportJSON(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const diagramData = JSON.parse(e.target.result);
                this.importDiagram(diagramData);
                this.showToast('Diagram imported successfully');
            } catch (error) {
                console.error('Error importing diagram:', error);
                alert('Error importing diagram. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
        
        // Reset the input so the same file can be selected again
        event.target.value = '';
    }
    
    importDiagram(diagramData) {
        if (!this.canvasEngine) {
            console.error('Canvas engine not available for import');
            return;
        }
        
        // Clear existing diagram
        this.canvasEngine.clearAll();
        
        // Import nodes
        if (diagramData.nodes && Array.isArray(diagramData.nodes)) {
            diagramData.nodes.forEach(nodeData => {
                this.canvasEngine.addNode(nodeData);
            });
        }
        
        // Import connections
        if (diagramData.connections && Array.isArray(diagramData.connections)) {
            diagramData.connections.forEach(connData => {
                this.canvasEngine.addConnection(connData.from, connData.to);
            });
        }
        
        // Import layers (if available) - for now, just note that layers exist
        if (diagramData.layers && Array.isArray(diagramData.layers)) {
            console.log('Imported diagram contains layer data:', diagramData.layers);
            // Layer import could be enhanced in the future
        }
        
        // Restore viewport (if available)
        if (diagramData.viewport && this.canvasEngine.viewport) {
            Object.assign(this.canvasEngine.viewport, diagramData.viewport);
        }
        
        // Re-render and update stats
        this.canvasEngine.render();
        if (this.layerManager) {
            this.layerManager.updateStats();
        }
        
        // Clear command history since we're starting fresh
        this.commandHistory = [];
        this.historyIndex = -1;
        
        console.log('Diagram imported successfully:', diagramData);
    }
    
    exportDiagramAsImage() {
        if (!this.canvasEngine) {
            alert('No diagram to export.');
            return;
        }
        
        const canvas = this.canvasEngine.canvas;
        
        // Create a temporary canvas with white background
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Fill with white background
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw the current canvas content on top
        tempCtx.drawImage(canvas, 0, 0);
        
        // Create download link
        tempCanvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `architecture-diagram-${new Date().toISOString().split('T')[0]}.png`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showToast('Image exported successfully');
        }, 'image/png', 1.0);
    }
    
    // Copy/Paste functionality
    copySelectedNode() {
        // For now, we'll copy the last clicked node
        // In the future, this could be enhanced to support multiple selection
        const selectedNode = this.lastClickedNode;
        
        if (!selectedNode) {
            // Try to find a node that's currently highlighted or selected
            if (this.canvasEngine && this.canvasEngine.selectedNode) {
                this.nodeClipboard = { ...this.canvasEngine.selectedNode };
            } else {
                alert('No node selected. Click on a node first, then copy.');
                return;
            }
        } else {
            this.nodeClipboard = { ...selectedNode };
        }
        
        console.log('Node copied to clipboard:', this.nodeClipboard.label);
        
        // Visual feedback
        this.showToast(`Copied "${this.nodeClipboard.label}" to clipboard`);
    }
    
    pasteNode() {
        if (!this.nodeClipboard) {
            alert('Nothing to paste. Copy a node first.');
            return;
        }
        
        // Create a new node with copied data
        const newNodeData = {
            ...this.nodeClipboard,
            id: this.generateNodeId(),
            label: `${this.nodeClipboard.label} (Copy)`,
            x: this.nodeClipboard.x + 150, // Offset to avoid overlap
            y: this.nodeClipboard.y + 50
        };
        
        // Position near center if possible
        if (this.canvasEngine) {
            const canvas = this.canvasEngine.canvas;
            const viewport = this.canvasEngine.viewport;
            newNodeData.x = (-viewport.x + canvas.clientWidth / 2) / viewport.zoom + Math.random() * 100 - 50;
            newNodeData.y = (-viewport.y + canvas.clientHeight / 2) / viewport.zoom + Math.random() * 100 - 50;
        }
        
        // Use command system for undo/redo support
        const command = this.createAddNodeCommand(newNodeData);
        this.executeCommand(command);
        this.canvasEngine?.render();
        
        console.log('Node pasted:', newNodeData.label);
        this.showToast(`Pasted "${newNodeData.label}"`);
    }
    
    generateNodeId() {
        return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    showToast(message, duration = 3000) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent-color, #3b82f6);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
    
    // Command System for Undo/Redo
    executeCommand(command) {
        // Execute the command
        command.execute();
        
        // Add to history (remove any commands after current index)
        this.commandHistory = this.commandHistory.slice(0, this.historyIndex + 1);
        this.commandHistory.push(command);
        
        // Maintain max history size
        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory = this.commandHistory.slice(-this.maxHistorySize);
        }
        
        this.historyIndex = this.commandHistory.length - 1;
        
        console.log('Command executed:', command.name, 'History index:', this.historyIndex);
    }
    
    undo() {
        if (this.historyIndex >= 0) {
            const command = this.commandHistory[this.historyIndex];
            command.undo();
            this.historyIndex--;
            
            console.log('Undone:', command.name, 'New index:', this.historyIndex);
            this.showToast(`Undone: ${command.name}`);
            
            // Re-render
            if (this.canvasEngine) {
                this.canvasEngine.render();
            }
        } else {
            this.showToast('Nothing to undo');
        }
    }
    
    redo() {
        if (this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            const command = this.commandHistory[this.historyIndex];
            command.execute();
            
            console.log('Redone:', command.name, 'New index:', this.historyIndex);
            this.showToast(`Redone: ${command.name}`);
            
            // Re-render
            if (this.canvasEngine) {
                this.canvasEngine.render();
            }
        } else {
            this.showToast('Nothing to redo');
        }
    }
    
    // Command Classes
    createAddNodeCommand(nodeData) {
        return {
            name: `Add Node: ${nodeData.label}`,
            execute: () => {
                if (this.canvasEngine) {
                    this.canvasEngine.addNode(nodeData);
                    if (this.layerManager) {
                        this.layerManager.updateStats();
                    }
                }
            },
            undo: () => {
                if (this.canvasEngine) {
                    this.canvasEngine.removeNode(nodeData.id);
                    if (this.layerManager) {
                        this.layerManager.updateStats();
                    }
                }
            }
        };
    }
    
    createRemoveNodeCommand(nodeId) {
        const node = this.canvasEngine?.nodes.get(nodeId);
        if (!node) return null;
        
        // Store node data and its connections for restoration
        const nodeData = { ...node };
        const connections = [];
        
        if (this.canvasEngine) {
            this.canvasEngine.connections.forEach(conn => {
                if (conn.from === nodeId || conn.to === nodeId) {
                    connections.push({ ...conn });
                }
            });
        }
        
        return {
            name: `Remove Node: ${nodeData.label}`,
            execute: () => {
                if (this.canvasEngine) {
                    this.canvasEngine.removeNode(nodeId);
                    if (this.layerManager) {
                        this.layerManager.updateStats();
                    }
                }
            },
            undo: () => {
                if (this.canvasEngine) {
                    this.canvasEngine.addNode(nodeData);
                    connections.forEach(conn => {
                        this.canvasEngine.addConnection(conn.from, conn.to);
                    });
                    if (this.layerManager) {
                        this.layerManager.updateStats();
                    }
                }
            }
        };
    }
    
    createAddConnectionCommand(fromId, toId) {
        // Get node labels for the prompt
        const fromNode = this.canvasEngine?.nodes.get(fromId);
        const toNode = this.canvasEngine?.nodes.get(toId);
        const fromLabel = fromNode?.label || fromId;
        const toLabel = toNode?.label || toId;
        
        // Prompt for connection label
        const label = prompt(`Enter connection label for:\n${fromLabel} → ${toLabel}`, '') || '';
        
        return {
            name: `Add Connection: ${fromId} → ${toId}`,
            execute: () => {
                if (this.canvasEngine) {
                    this.canvasEngine.addConnection({
                        from: fromId,
                        to: toId,
                        label: label
                    });
                }
            },
            undo: () => {
                if (this.canvasEngine) {
                    this.canvasEngine.removeConnection(fromId, toId);
                }
            }
        };
    }
    
    createUpdateNodeCommand(nodeId, oldData, newData) {
        return {
            name: `Update Node: ${newData.label || oldData.label}`,
            execute: () => {
                const node = this.canvasEngine?.nodes.get(nodeId);
                if (node) {
                    Object.assign(node, newData);
                    if (this.layerManager && newData.layer !== oldData.layer) {
                        this.layerManager.updateStats();
                    }
                }
            },
            undo: () => {
                const node = this.canvasEngine?.nodes.get(nodeId);
                if (node) {
                    Object.assign(node, oldData);
                    if (this.layerManager && newData.layer !== oldData.layer) {
                        this.layerManager.updateStats();
                    }
                }
            }
        };
    }
    
    // Edit Node Modal Methods
    showEditNodeModal(nodeId) {
        const node = this.canvasEngine?.nodes.get(nodeId);
        if (!node) {
            console.error('Node not found:', nodeId);
            return;
        }
        
        // Populate form with current node data
        document.getElementById('edit-node-id').value = nodeId;
        document.getElementById('edit-node-label').value = node.label || '';
        document.getElementById('edit-node-type').value = node.type || 'default';
        document.getElementById('edit-node-description').value = node.description || '';
        document.getElementById('edit-node-code').value = node.code || '';
        
        // Populate layer options
        const layerSelect = document.getElementById('edit-node-layer');
        layerSelect.innerHTML = '';
        
        if (this.layerManager) {
            const layers = this.layerManager.getLayerData();
            layers.forEach(layer => {
                const option = document.createElement('option');
                option.value = layer.id;
                option.textContent = layer.name;
                option.selected = layer.id === node.layer;
                layerSelect.appendChild(option);
            });
        }
        
        // Set selected icon
        const iconButtons = document.querySelectorAll('#edit-icon-selector .icon-btn');
        iconButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.icon === node.icon || (!node.icon && !btn.dataset.icon)) {
                btn.classList.add('active');
            }
        });
        
        // Show modal
        const modal = document.getElementById('edit-node-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Focus on label field
            setTimeout(() => {
                document.getElementById('edit-node-label').focus();
            }, 100);
        }
        
        // Hide node details modal
        this.hideModal();
    }
    
    hideEditNodeModal() {
        const modal = document.getElementById('edit-node-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    handleNodeEdit(e) {
        e.preventDefault();
        
        const nodeId = document.getElementById('edit-node-id').value;
        const label = document.getElementById('edit-node-label').value.trim();
        const type = document.getElementById('edit-node-type').value;
        const layer = document.getElementById('edit-node-layer').value;
        const description = document.getElementById('edit-node-description').value.trim();
        const code = document.getElementById('edit-node-code').value.trim();
        
        // Get selected icon
        const selectedIcon = document.querySelector('#edit-icon-selector .icon-btn.active');
        const icon = selectedIcon?.dataset.icon || '';
        
        if (!label) {
            alert('Please enter a node label.');
            return;
        }
        
        // Update node
        this.updateNode(nodeId, {
            label,
            type,
            layer,
            description,
            code,
            icon
        });
        
        this.hideEditNodeModal();
    }
    
    updateNode(nodeId, updates) {
        const node = this.canvasEngine?.nodes.get(nodeId);
        if (!node) {
            console.error('Node not found:', nodeId);
            return;
        }
        
        // Store old data for undo
        const oldData = { ...node };
        
        // Create and execute command
        const command = this.createUpdateNodeCommand(nodeId, oldData, updates);
        this.executeCommand(command);
        
        // Re-render canvas
        if (this.canvasEngine) {
            this.canvasEngine.render();
        }
        
        console.log('Updated node:', nodeId, updates);
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