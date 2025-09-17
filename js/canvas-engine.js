/**
 * Canvas Engine for Architecture Flow Visualization
 * Handles rendering of nodes, connections, and interactions
 */

class CanvasEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pixelRatio = Utils.getPixelRatio();
        
        // Configuration
        this.config = {
            nodeSize: { width: 120, height: 80 },
            nodeSpacing: { x: 200, y: 150 },
            connectionWidth: 2,
            selectionWidth: 3,
            fontSize: 12,
            padding: 20,
            ...options
        };
        
        // State
        this.nodes = new Map();
        this.connections = [];
        this.layers = new Map();
        this.selectedNode = null;
        this.hoveredNode = null;
        
        // Highlighting state
        this.highlightedNode = null;
        this.highlightedNodes = [];
        this.highlightedConnections = [];
        
        // Viewport
        this.viewport = {
            x: 0,
            y: 0,
            zoom: 1,
            minZoom: 0.1,
            maxZoom: 3
        };
        
        // Interaction state
        this.isDragging = false;
        this.dragStart = null;
        this.lastMousePos = null;
        
        this.setupCanvas();
        this.bindEvents();
    }
    
    setupCanvas() {
        // Set up high DPI support
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.pixelRatio;
        this.canvas.height = rect.height * this.pixelRatio;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        
        // Set default styles
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }
    
    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Resize observer
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
                this.setupCanvas();
                this.render();
            });
            this.resizeObserver.observe(this.canvas);
        }
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    // Mouse event handlers
    handleMouseDown(e) {
        const mousePos = this.getMousePosition(e);
        const node = this.getNodeAtPosition(mousePos);
        
        if (node) {
            this.selectedNode = node;
            this.dragStart = mousePos;
            this.isDragging = false;
        } else {
            this.selectedNode = null;
            this.dragStart = mousePos;
            this.isDragging = true;
        }
        
        this.lastMousePos = mousePos;
        this.render();
    }
    
    handleMouseMove(e) {
        const mousePos = this.getMousePosition(e);
        
        if (this.dragStart) {
            const dx = mousePos.x - this.lastMousePos.x;
            const dy = mousePos.y - this.lastMousePos.y;
            
            if (this.selectedNode && !this.isDragging) {
                // Drag node
                this.selectedNode.x += dx / this.viewport.zoom;
                this.selectedNode.y += dy / this.viewport.zoom;
            } else if (this.isDragging) {
                // Pan viewport
                this.viewport.x += dx;
                this.viewport.y += dy;
            }
            
            this.render();
        } else {
            // Update hover state
            const hoveredNode = this.getNodeAtPosition(mousePos);
            if (hoveredNode !== this.hoveredNode) {
                this.hoveredNode = hoveredNode;
                this.canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
                this.render();
            }
        }
        
        this.lastMousePos = mousePos;
    }
    
    handleMouseUp(e) {
        this.dragStart = null;
        this.isDragging = false;
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'grab';
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        const mousePos = this.getMousePosition(e);
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Utils.clamp(
            this.viewport.zoom * zoomFactor,
            this.viewport.minZoom,
            this.viewport.maxZoom
        );
        
        if (newZoom !== this.viewport.zoom) {
            // Zoom towards mouse position
            const zoomRatio = newZoom / this.viewport.zoom;
            this.viewport.x = mousePos.x - (mousePos.x - this.viewport.x) * zoomRatio;
            this.viewport.y = mousePos.y - (mousePos.y - this.viewport.y) * zoomRatio;
            this.viewport.zoom = newZoom;
            
            this.render();
            this.onZoomChange?.(newZoom);
        }
    }
    
    handleClick(e) {
        const mousePos = this.getMousePosition(e);
        const node = this.getNodeAtPosition(mousePos);
        
        if (node) {
            this.onNodeClick?.(node);
        }
    }
    
    // Touch event handlers
    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMouseUp(e);
    }
    
    // Utility methods
    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    screenToWorld(screenPos) {
        return {
            x: (screenPos.x - this.viewport.x) / this.viewport.zoom,
            y: (screenPos.y - this.viewport.y) / this.viewport.zoom
        };
    }
    
    worldToScreen(worldPos) {
        return {
            x: worldPos.x * this.viewport.zoom + this.viewport.x,
            y: worldPos.y * this.viewport.zoom + this.viewport.y
        };
    }
    
    getNodeAtPosition(screenPos) {
        const worldPos = this.screenToWorld(screenPos);
        
        for (const node of this.nodes.values()) {
            if (!this.isLayerVisible(node.layer)) continue;
            
            const nodeRect = {
                x: node.x - this.config.nodeSize.width / 2,
                y: node.y - this.config.nodeSize.height / 2,
                width: this.config.nodeSize.width,
                height: this.config.nodeSize.height
            };
            
            if (Utils.pointInRect(worldPos, nodeRect)) {
                return node;
            }
        }
        
        return null;
    }
    
    // Layer management
    addLayer(layerId, layerInfo) {
        this.layers.set(layerId, {
            visible: true,
            color: layerInfo.color || '#3b82f6',
            name: layerInfo.name || layerId,
            ...layerInfo
        });
    }
    
    setLayerVisibility(layerId, visible) {
        const layer = this.layers.get(layerId);
        if (layer) {
            layer.visible = visible;
            this.render();
            return true;
        }
        return false;
    }
    
    isLayerVisible(layerId) {
        const layer = this.layers.get(layerId);
        return layer ? layer.visible : true;
    }
    
    // Node management
    addNode(node) {
        const nodeId = node.id || Utils.generateId();
        const nodeData = {
            id: nodeId,
            x: node.x || 0,
            y: node.y || 0,
            label: node.label || 'Node',
            layer: node.layer || 'default',
            type: node.type || 'default',
            data: node.data || {},
            ...node
        };
        
        this.nodes.set(nodeId, nodeData);
        return nodeData;
    }
    
    removeNode(nodeId) {
        this.nodes.delete(nodeId);
        // Remove connections involving this node
        this.connections = this.connections.filter(
            conn => conn.from !== nodeId && conn.to !== nodeId
        );
    }
    
    addConnection(connection) {
        const conn = {
            id: connection.id || Utils.generateId(),
            from: connection.from,
            to: connection.to,
            label: connection.label || '',
            type: connection.type || 'default',
            ...connection
        };
        
        this.connections.push(conn);
        return conn;
    }
    
    // Rendering methods
    render() {
        this.clear();
        this.ctx.save();
        
        // Apply viewport transformation
        this.ctx.translate(this.viewport.x, this.viewport.y);
        this.ctx.scale(this.viewport.zoom, this.viewport.zoom);
        
        // Render connections first (behind nodes)
        this.renderConnections();
        
        // Render nodes
        this.renderNodes();
        
        this.ctx.restore();
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set background color based on theme
        const style = getComputedStyle(document.documentElement);
        const bgColor = style.getPropertyValue('--canvas-bg').trim();
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderNodes() {
        for (const node of this.nodes.values()) {
            if (!this.isLayerVisible(node.layer)) continue;
            
            this.renderNode(node);
        }
    }
    
    renderNode(node) {
        const { x, y } = node;
        const { width, height } = this.config.nodeSize;
        const layer = this.layers.get(node.layer);
        const isSelected = this.selectedNode === node;
        const isHovered = this.hoveredNode === node;
        const isHighlighted = this.highlightedNodes.includes(node) || this.highlightedNode === node;
        
        this.ctx.save();
        
        // Dim non-highlighted nodes when highlighting is active
        if (this.highlightedNodes.length > 0 && !isHighlighted) {
            this.ctx.globalAlpha = 0.3;
        }
        
        // Node background
        const style = getComputedStyle(document.documentElement);
        this.ctx.fillStyle = style.getPropertyValue('--node-bg').trim();
        this.ctx.strokeStyle = layer?.color || style.getPropertyValue('--node-border').trim();
        this.ctx.lineWidth = (isSelected || isHighlighted) ? this.config.selectionWidth : 1;
        
        // Add glow effect for hovered/selected/highlighted nodes
        if (isHovered || isSelected || isHighlighted) {
            this.ctx.shadowColor = layer?.color || '#3b82f6';
            this.ctx.shadowBlur = isHighlighted ? 15 : 10;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
        }
        
        // Draw node rectangle
        this.ctx.beginPath();
        this.ctx.roundRect(x - width/2, y - height/2, width, height, 8);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Node icon (if specified)
        if (node.icon) {
            this.ctx.fillStyle = layer?.color || '#3b82f6';
            this.ctx.font = '16px "Font Awesome 6 Free"';
            this.ctx.fillText(node.icon, x, y - 10);
        }
        
        // Node label
        this.ctx.fillStyle = style.getPropertyValue('--text-primary').trim();
        this.ctx.font = `${this.config.fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        
        // Multi-line text support
        const lines = node.label.split('\n');
        const lineHeight = this.config.fontSize + 2;
        const startY = y + (node.icon ? 5 : -(lines.length - 1) * lineHeight / 2);
        
        lines.forEach((line, index) => {
            this.ctx.fillText(line, x, startY + index * lineHeight);
        });
        
        // Node type indicator
        if (node.type && node.type !== 'default') {
            this.ctx.fillStyle = Utils.colorWithOpacity(layer?.color || '#3b82f6', 0.2);
            this.ctx.fillRect(x - width/2, y - height/2, width, 4);
        }
        
        this.ctx.restore();
    }
    
    renderConnections() {
        for (const connection of this.connections) {
            this.renderConnection(connection);
        }
    }
    
    renderConnection(connection) {
        const fromNode = this.nodes.get(connection.from);
        const toNode = this.nodes.get(connection.to);
        
        if (!fromNode || !toNode) return;
        if (!this.isLayerVisible(fromNode.layer) || !this.isLayerVisible(toNode.layer)) return;
        
        const isHighlighted = this.highlightedConnections.includes(connection);
        
        this.ctx.save();
        
        // Dim non-highlighted connections when highlighting is active
        if (this.highlightedConnections.length > 0 && !isHighlighted) {
            this.ctx.globalAlpha = 0.3;
        }
        
        const style = getComputedStyle(document.documentElement);
        this.ctx.strokeStyle = isHighlighted ? '#ff6b35' : style.getPropertyValue('--connection-color').trim();
        this.ctx.lineWidth = isHighlighted ? this.config.connectionWidth * 2 : this.config.connectionWidth;
        
        // Add glow effect for highlighted connections
        if (isHighlighted) {
            this.ctx.shadowColor = '#ff6b35';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
        }
        
        // Calculate connection points (edge of nodes)
        const fromCenter = { x: fromNode.x, y: fromNode.y };
        const toCenter = { x: toNode.x, y: toNode.y };
        
        const angle = Math.atan2(toCenter.y - fromCenter.y, toCenter.x - fromCenter.x);
        const nodeRadius = Math.sqrt(
            Math.pow(this.config.nodeSize.width/2, 2) + 
            Math.pow(this.config.nodeSize.height/2, 2)
        );
        
        const fromPoint = {
            x: fromCenter.x + Math.cos(angle) * nodeRadius * 0.7,
            y: fromCenter.y + Math.sin(angle) * nodeRadius * 0.7
        };
        
        const toPoint = {
            x: toCenter.x - Math.cos(angle) * nodeRadius * 0.7,
            y: toCenter.y - Math.sin(angle) * nodeRadius * 0.7
        };
        
        // Draw connection line
        this.ctx.beginPath();
        
        if (connection.type === 'curved') {
            // Curved connection
            const controlOffset = Utils.distance(fromPoint, toPoint) * 0.3;
            const controlAngle = angle + Math.PI / 2;
            
            const control1 = {
                x: fromPoint.x + Math.cos(controlAngle) * controlOffset,
                y: fromPoint.y + Math.sin(controlAngle) * controlOffset
            };
            
            const control2 = {
                x: toPoint.x + Math.cos(controlAngle) * controlOffset,
                y: toPoint.y + Math.sin(controlAngle) * controlOffset
            };
            
            this.ctx.moveTo(fromPoint.x, fromPoint.y);
            this.ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, toPoint.x, toPoint.y);
        } else {
            // Straight connection
            this.ctx.moveTo(fromPoint.x, fromPoint.y);
            this.ctx.lineTo(toPoint.x, toPoint.y);
        }
        
        this.ctx.stroke();
        
        // Draw arrow
        this.drawArrow(toPoint, angle);
        
        // Draw connection label
        if (connection.label) {
            const midPoint = {
                x: (fromPoint.x + toPoint.x) / 2,
                y: (fromPoint.y + toPoint.y) / 2
            };
            
            this.ctx.fillStyle = style.getPropertyValue('--text-secondary').trim();
            this.ctx.font = `${this.config.fontSize - 2}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(connection.label, midPoint.x, midPoint.y - 8);
        }
        
        this.ctx.restore();
    }
    
    drawArrow(point, angle) {
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        
        this.ctx.save();
        this.ctx.translate(point.x, point.y);
        this.ctx.rotate(angle);
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-arrowLength, -arrowLength * Math.tan(arrowAngle));
        this.ctx.lineTo(-arrowLength, arrowLength * Math.tan(arrowAngle));
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // Public API methods
    setData(data) {
        this.nodes.clear();
        this.connections = [];
        this.layers.clear();
        
        // Add layers
        if (data.layers) {
            data.layers.forEach(layer => {
                this.addLayer(layer.id, layer);
            });
        }
        
        // Add nodes
        if (data.nodes) {
            data.nodes.forEach(node => {
                this.addNode(node);
            });
        }
        
        // Add connections
        if (data.connections) {
            data.connections.forEach(connection => {
                this.addConnection(connection);
            });
        }
        
        this.render();
    }
    
    zoomToFit() {
        if (this.nodes.size === 0) return;
        
        // Calculate bounding box of all visible nodes
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        for (const node of this.nodes.values()) {
            if (!this.isLayerVisible(node.layer)) continue;
            
            minX = Math.min(minX, node.x - this.config.nodeSize.width / 2);
            minY = Math.min(minY, node.y - this.config.nodeSize.height / 2);
            maxX = Math.max(maxX, node.x + this.config.nodeSize.width / 2);
            maxY = Math.max(maxY, node.y + this.config.nodeSize.height / 2);
        }
        
        if (minX === Infinity) return;
        
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const canvasWidth = this.canvas.clientWidth;
        const canvasHeight = this.canvas.clientHeight;
        
        const scaleX = (canvasWidth - this.config.padding * 2) / contentWidth;
        const scaleY = (canvasHeight - this.config.padding * 2) / contentHeight;
        const scale = Math.min(scaleX, scaleY, this.viewport.maxZoom);
        
        this.viewport.zoom = scale;
        this.viewport.x = canvasWidth / 2 - (minX + maxX) / 2 * scale;
        this.viewport.y = canvasHeight / 2 - (minY + maxY) / 2 * scale;
        
        this.render();
        this.onZoomChange?.(scale);
    }
    
    centerView() {
        this.viewport.x = this.canvas.clientWidth / 2;
        this.viewport.y = this.canvas.clientHeight / 2;
        this.render();
    }
    
    setZoom(zoom) {
        const newZoom = Utils.clamp(zoom, this.viewport.minZoom, this.viewport.maxZoom);
        const centerX = this.canvas.clientWidth / 2;
        const centerY = this.canvas.clientHeight / 2;
        
        const zoomRatio = newZoom / this.viewport.zoom;
        this.viewport.x = centerX - (centerX - this.viewport.x) * zoomRatio;
        this.viewport.y = centerY - (centerY - this.viewport.y) * zoomRatio;
        this.viewport.zoom = newZoom;
        
        this.render();
        this.onZoomChange?.(newZoom);
    }
    
    getStats() {
        const visibleNodes = Array.from(this.nodes.values()).filter(
            node => this.isLayerVisible(node.layer)
        ).length;
        
        return {
            totalNodes: this.nodes.size,
            visibleNodes,
            connections: this.connections.length,
            layers: this.layers.size
        };
    }
    
    // Highlighting methods
    clearHighlights() {
        this.highlightedNode = null;
        this.highlightedNodes = [];
        this.highlightedConnections = [];
    }
    
    // Cleanup
    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}

// Export for use in other modules
window.CanvasEngine = CanvasEngine;