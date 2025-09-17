/**
 * Layer Manager for Architecture Flow Visualizer
 * Handles layer visibility, organization, and UI controls
 */

class LayerManager {
    constructor(canvasEngine, options = {}) {
        this.canvasEngine = canvasEngine;
        this.options = {
            colors: [
                '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
                '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
            ],
            ...options
        };
        
        this.layers = new Map();
        this.layerOrder = [];
        this.callbacks = {
            onLayerToggle: null,
            onLayerUpdate: null
        };
        
        this.initializeUI();
    }
    
    initializeUI() {
        this.layersContainer = document.getElementById('layers-list');
        this.showAllButton = document.getElementById('show-all-layers');
        this.hideAllButton = document.getElementById('hide-all-layers');
        
        // Bind events
        if (this.showAllButton) {
            this.showAllButton.addEventListener('click', () => this.showAllLayers());
        }
        
        if (this.hideAllButton) {
            this.hideAllButton.addEventListener('click', () => this.hideAllLayers());
        }
    }
    
    addLayer(layerId, layerInfo) {
        const colorIndex = this.layers.size % this.options.colors.length;
        const layer = {
            id: layerId,
            name: layerInfo.name || layerId,
            color: layerInfo.color || this.options.colors[colorIndex],
            visible: layerInfo.visible !== undefined ? layerInfo.visible : true,
            nodeCount: 0,
            description: layerInfo.description || '',
            order: layerInfo.order || this.layers.size,
            ...layerInfo
        };
        
        this.layers.set(layerId, layer);
        this.layerOrder.push(layerId);
        
        // Add to canvas engine
        this.canvasEngine.addLayer(layerId, layer);
        
        // Update UI
        this.updateUI();
        
        return layer;
    }
    
    removeLayer(layerId) {
        if (this.layers.has(layerId)) {
            this.layers.delete(layerId);
            this.layerOrder = this.layerOrder.filter(id => id !== layerId);
            this.updateUI();
            return true;
        }
        return false;
    }
    
    toggleLayer(layerId) {
        const layer = this.layers.get(layerId);
        if (layer) {
            layer.visible = !layer.visible;
            this.canvasEngine.setLayerVisibility(layerId, layer.visible);
            this.updateLayerItem(layerId);
            this.updateStats();
            
            if (this.callbacks.onLayerToggle) {
                this.callbacks.onLayerToggle(layerId, layer.visible, layer);
            }
            
            return layer.visible;
        }
        return false;
    }
    
    setLayerVisibility(layerId, visible) {
        const layer = this.layers.get(layerId);
        if (layer && layer.visible !== visible) {
            layer.visible = visible;
            this.canvasEngine.setLayerVisibility(layerId, visible);
            this.updateLayerItem(layerId);
            this.updateStats();
            
            if (this.callbacks.onLayerToggle) {
                this.callbacks.onLayerToggle(layerId, visible, layer);
            }
        }
    }
    
    showAllLayers() {
        for (const [layerId, layer] of this.layers) {
            if (!layer.visible) {
                this.setLayerVisibility(layerId, true);
            }
        }
    }
    
    hideAllLayers() {
        for (const [layerId, layer] of this.layers) {
            if (layer.visible) {
                this.setLayerVisibility(layerId, false);
            }
        }
    }
    
    updateNodeCount(layerId, count) {
        const layer = this.layers.get(layerId);
        if (layer) {
            layer.nodeCount = count;
            this.updateLayerItem(layerId);
        }
    }
    
    reorderLayers(newOrder) {
        this.layerOrder = newOrder.filter(id => this.layers.has(id));
        this.updateUI();
    }
    
    updateUI() {
        if (!this.layersContainer) return;
        
        // Clear existing items
        this.layersContainer.innerHTML = '';
        
        // Sort layers by order
        const sortedLayers = this.layerOrder
            .map(id => this.layers.get(id))
            .filter(layer => layer)
            .sort((a, b) => a.order - b.order);
        
        // Create layer items
        sortedLayers.forEach(layer => {
            const layerElement = this.createLayerElement(layer);
            this.layersContainer.appendChild(layerElement);
        });
        
        this.updateStats();
    }
    
    createLayerElement(layer) {
        const layerItem = document.createElement('div');
        layerItem.className = `layer-item ${!layer.visible ? 'disabled' : ''}`;
        layerItem.dataset.layerId = layer.id;
        
        layerItem.innerHTML = `
            <div class="layer-info">
                <div class="layer-color" style="background-color: ${layer.color}"></div>
                <div class="layer-details">
                    <div class="layer-name">${layer.name}</div>
                    <div class="layer-count">${layer.nodeCount} nodes</div>
                </div>
            </div>
            <div class="layer-controls">
                <label class="toggle">
                    <input type="checkbox" ${layer.visible ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;
        
        // Add event listeners
        const toggle = layerItem.querySelector('input[type="checkbox"]');
        toggle.addEventListener('change', (e) => {
            e.stopPropagation();
            this.toggleLayer(layer.id);
        });
        
        // Layer info click for details
        const layerInfo = layerItem.querySelector('.layer-info');
        layerInfo.addEventListener('click', () => {
            this.showLayerDetails(layer);
        });
        
        // Add tooltip
        layerItem.title = layer.description || `${layer.name} layer with ${layer.nodeCount} nodes`;
        
        return layerItem;
    }
    
    updateLayerItem(layerId) {
        const layer = this.layers.get(layerId);
        const layerElement = this.layersContainer?.querySelector(`[data-layer-id="${layerId}"]`);
        
        if (!layer || !layerElement) return;
        
        // Update visibility state
        layerElement.classList.toggle('disabled', !layer.visible);
        
        // Update toggle
        const toggle = layerElement.querySelector('input[type="checkbox"]');
        if (toggle) {
            toggle.checked = layer.visible;
        }
        
        // Update node count
        const countElement = layerElement.querySelector('.layer-count');
        if (countElement) {
            countElement.textContent = `${layer.nodeCount} nodes`;
        }
        
        // Update tooltip
        layerElement.title = layer.description || `${layer.name} layer with ${layer.nodeCount} nodes`;
    }
    
    showLayerDetails(layer) {
        // Create modal content for layer details
        const modalContent = `
            <div class="layer-details-modal">
                <div class="layer-header">
                    <div class="layer-color-large" style="background-color: ${layer.color}"></div>
                    <div class="layer-title">
                        <h4>${layer.name}</h4>
                        <p class="layer-subtitle">${layer.nodeCount} nodes</p>
                    </div>
                </div>
                
                ${layer.description ? `
                    <div class="layer-description">
                        <h5>Description</h5>
                        <p>${layer.description}</p>
                    </div>
                ` : ''}
                
                <div class="layer-actions">
                    <button class="btn layer-action-btn" data-action="toggle">
                        ${layer.visible ? 'Hide Layer' : 'Show Layer'}
                    </button>
                    <button class="btn layer-action-btn" data-action="focus">
                        Focus Layer
                    </button>
                    <button class="btn layer-action-btn" data-action="export">
                        Export Layer
                    </button>
                </div>
                
                <div class="layer-stats">
                    <div class="stat-item">
                        <span class="stat-label">Visibility:</span>
                        <span class="stat-value">${layer.visible ? 'Visible' : 'Hidden'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Color:</span>
                        <span class="stat-value" style="color: ${layer.color}">${layer.color}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Order:</span>
                        <span class="stat-value">${layer.order}</span>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('Layer Details: ' + layer.name, modalContent);
        
        // Bind action buttons
        document.querySelectorAll('.layer-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleLayerAction(layer.id, action);
                this.closeModal();
            });
        });
    }
    
    handleLayerAction(layerId, action) {
        const layer = this.layers.get(layerId);
        if (!layer) return;
        
        switch (action) {
            case 'toggle':
                this.toggleLayer(layerId);
                break;
                
            case 'focus':
                this.focusLayer(layerId);
                break;
                
            case 'export':
                this.exportLayer(layerId);
                break;
        }
    }
    
    focusLayer(layerId) {
        // Hide all other layers
        for (const [id, layer] of this.layers) {
            if (id !== layerId && layer.visible) {
                this.setLayerVisibility(id, false);
            }
        }
        
        // Show the target layer
        this.setLayerVisibility(layerId, true);
        
        // Fit to screen
        setTimeout(() => {
            this.canvasEngine.zoomToFit();
        }, 100);
    }
    
    exportLayer(layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return;
        
        // Get all nodes in this layer
        const layerNodes = Array.from(this.canvasEngine.nodes.values())
            .filter(node => node.layer === layerId);
        
        // Get connections between nodes in this layer
        const layerConnections = this.canvasEngine.connections
            .filter(conn => {
                const fromNode = this.canvasEngine.nodes.get(conn.from);
                const toNode = this.canvasEngine.nodes.get(conn.to);
                return fromNode?.layer === layerId || toNode?.layer === layerId;
            });
        
        const exportData = {
            layer: layer,
            nodes: layerNodes,
            connections: layerConnections,
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        Utils.downloadFile(dataStr, `${layer.name}_layer.json`, 'application/json');
    }
    
    showModal(title, content) {
        const modal = document.getElementById('node-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = title;
            modalContent.innerHTML = content;
            modal.classList.add('show');
            
            // Close modal on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }
    
    closeModal() {
        const modal = document.getElementById('node-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    updateStats() {
        const stats = this.canvasEngine.getStats();
        
        // Update footer stats
        const nodeCountElement = document.getElementById('node-count');
        const connectionCountElement = document.getElementById('connection-count');
        const layerCountElement = document.getElementById('layer-count');
        
        if (nodeCountElement) {
            nodeCountElement.textContent = `Nodes: ${stats.visibleNodes}/${stats.totalNodes}`;
        }
        
        if (connectionCountElement) {
            connectionCountElement.textContent = `Connections: ${stats.connections}`;
        }
        
        if (layerCountElement) {
            layerCountElement.textContent = `Layers: ${stats.layers}`;
        }
        
        // Update layer node counts
        const layerCounts = new Map();
        for (const node of this.canvasEngine.nodes.values()) {
            const count = layerCounts.get(node.layer) || 0;
            layerCounts.set(node.layer, count + 1);
        }
        
        for (const [layerId, count] of layerCounts) {
            this.updateNodeCount(layerId, count);
        }
    }
    
    // Data management
    getLayerData() {
        return Array.from(this.layers.values());
    }
    
    setLayerData(layersData) {
        this.layers.clear();
        this.layerOrder = [];
        
        if (Array.isArray(layersData)) {
            layersData.forEach(layerInfo => {
                this.addLayer(layerInfo.id, layerInfo);
            });
        }
    }
    
    getVisibleLayers() {
        return Array.from(this.layers.values()).filter(layer => layer.visible);
    }
    
    getHiddenLayers() {
        return Array.from(this.layers.values()).filter(layer => !layer.visible);
    }
    
    // Event callbacks
    onLayerToggle(callback) {
        this.callbacks.onLayerToggle = callback;
    }
    
    onLayerUpdate(callback) {
        this.callbacks.onLayerUpdate = callback;
    }
    
    // Utility methods
    getLayerColor(layerId) {
        const layer = this.layers.get(layerId);
        return layer ? layer.color : '#3b82f6';
    }
    
    getLayerName(layerId) {
        const layer = this.layers.get(layerId);
        return layer ? layer.name : layerId;
    }
    
    isLayerVisible(layerId) {
        const layer = this.layers.get(layerId);
        return layer ? layer.visible : true;
    }
    
    // Bulk operations
    setMultipleLayerVisibility(layerIds, visible) {
        layerIds.forEach(layerId => {
            this.setLayerVisibility(layerId, visible);
        });
    }
    
    toggleMultipleLayers(layerIds) {
        layerIds.forEach(layerId => {
            this.toggleLayer(layerId);
        });
    }
    
    // Search and filter
    searchLayers(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.layers.values()).filter(layer => 
            layer.name.toLowerCase().includes(lowerQuery) ||
            layer.description.toLowerCase().includes(lowerQuery)
        );
    }
    
    filterLayersByVisibility(visible) {
        return Array.from(this.layers.values()).filter(layer => layer.visible === visible);
    }
    
    // Cleanup
    destroy() {
        this.layers.clear();
        this.layerOrder = [];
        this.callbacks = {};
    }
}

// CSS for layer details modal (add to existing styles)
const layerModalStyles = `
<style>
.layer-details-modal {
    max-width: 500px;
}

.layer-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.layer-color-large {
    width: 3rem;
    height: 3rem;
    border-radius: 0.5rem;
    border: 2px solid var(--border-color);
}

.layer-title h4 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
}

.layer-subtitle {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.layer-description {
    margin-bottom: 1.5rem;
}

.layer-description h5 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: var(--text-primary);
}

.layer-description p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.5;
}

.layer-actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.layer-action-btn {
    flex: 1;
    justify-content: center;
}

.layer-stats {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background-color: var(--surface-color);
    border-radius: 0.375rem;
}

.stat-label {
    font-weight: 500;
    color: var(--text-secondary);
}

.stat-value {
    font-weight: 600;
    color: var(--text-primary);
}
</style>
`;

// Inject styles
if (!document.querySelector('#layer-modal-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'layer-modal-styles';
    styleElement.innerHTML = layerModalStyles;
    document.head.appendChild(styleElement);
}

// Export for use in other modules
window.LayerManager = LayerManager;