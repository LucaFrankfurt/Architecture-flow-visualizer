/**
 * Canvas Engine for Architecture Flow Visualization
 * Handles rendering of nodes, connections, and interactions
 */

class CanvasEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pixelRatio = Utils.getPixelRatio();
        this.app = null; // Reference to main app for checking states like connection mode
        
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
        this.selectedConnection = null;
        this.hoveredConnection = null;
        
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
        this.dragThreshold = 5; // Minimum pixels to consider as drag
        this.hasDragged = false; // Track if actual dragging occurred
        
        this.setupCanvas();
        this.bindEvents();
        
        // Initial render
        this.render();
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
            this.hasDragged = false; // Reset drag tracking
        } else {
            this.selectedNode = null;
            this.dragStart = mousePos;
            this.isDragging = true;
            this.hasDragged = false; // Reset drag tracking
        }
        
        this.lastMousePos = mousePos;
        this.render();
    }
    
    handleMouseMove(e) {
        const mousePos = this.getMousePosition(e);
        
        if (this.dragStart) {
            const dx = mousePos.x - this.lastMousePos.x;
            const dy = mousePos.y - this.lastMousePos.y;
            
            // Check if we've moved enough to consider this a drag
            const totalMovement = Math.sqrt(
                Math.pow(mousePos.x - this.dragStart.x, 2) + 
                Math.pow(mousePos.y - this.dragStart.y, 2)
            );
            
            if (totalMovement > this.dragThreshold) {
                this.hasDragged = true;
            }
            
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
        // Only handle clicks if we haven't dragged significantly
        if (this.hasDragged) {
            return; // Don't trigger click after drag
        }
        
        const mousePos = this.getMousePosition(e);
        const node = this.getNodeAtPosition(mousePos);
        
        if (node) {
            this.selectedConnection = null; // Clear connection selection
            this.onNodeClick?.(node);
        } else {
            // Check for connection click if no node was clicked
            const connection = this.getConnectionAtPosition(mousePos);
            if (connection) {
                this.selectedNode = null; // Clear node selection
                this.selectedConnection = connection;
                this.onConnectionClick?.(connection);
                this.render(); // Re-render to show selection
            } else {
                // Clear all selections if clicking empty space
                this.selectedNode = null;
                this.selectedConnection = null;
                this.render();
            }
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
    
    getConnectionAtPosition(screenPos) {
        const worldPos = this.screenToWorld(screenPos);
        const tolerance = 8; // Click tolerance in pixels
        
        for (const connection of this.connections) {
            const fromNode = this.nodes.get(connection.from);
            const toNode = this.nodes.get(connection.to);
            
            if (!fromNode || !toNode) continue;
            if (!this.isLayerVisible(fromNode.layer) || !this.isLayerVisible(toNode.layer)) continue;
            
            // Calculate connection line
            const fromCenter = { x: fromNode.x, y: fromNode.y };
            const toCenter = { x: toNode.x, y: toNode.y };
            
            // Check if click is near the line between nodes
            const distance = this.pointToLineDistance(worldPos, fromCenter, toCenter);
            if (distance <= tolerance) {
                return connection;
            }
        }
        
        return null;
    }
    
    pointToLineDistance(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return Math.sqrt(A * A + B * B);
        
        let param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
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
    
    // Utility method to lighten colors
    lightenColor(color, factor) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Lighten by mixing with white
        const newR = Math.round(r + (255 - r) * factor);
        const newG = Math.round(g + (255 - g) * factor);
        const newB = Math.round(b + (255 - b) * factor);
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }
    
    // Utility method to draw rounded rectangles
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    isLayerVisible(layerId) {
        const layer = this.layers.get(layerId);
        // If layer doesn't exist or layers Map is empty, default to visible
        if (!layer && this.layers.size === 0) return true;
        return layer ? layer.visible : true;
    }
    
    removeNode(nodeId) {
        this.nodes.delete(nodeId);
        // Remove connections involving this node
        this.connections = this.connections.filter(
            conn => conn.from !== nodeId && conn.to !== nodeId
        );
    }
    
    addConnection(connection) {
        // Handle different connection formats
        let conn;
        if (typeof connection === 'object' && connection.from && connection.to) {
            // Object format from templates
            conn = {
                id: connection.id || Utils.generateId(),
                from: connection.from,
                to: connection.to,
                label: connection.label || '',
                type: connection.type || 'default',
                ...connection
            };
        } else {
            console.error('Invalid connection format:', connection);
            return null;
        }
        
        this.connections.push(conn);
        return conn;
    }
    
    removeConnection(fromId, toId) {
        const initialLength = this.connections.length;
        this.connections = this.connections.filter(conn => 
            !(conn.from === fromId && conn.to === toId) &&
            !(conn.from === toId && conn.to === fromId) // Also remove reverse connections
        );
        return this.connections.length < initialLength; // Return true if connection was removed
    }
    
    updateConnection(connectionId, updates) {
        const connection = this.connections.find(conn => conn.id === connectionId);
        if (connection) {
            Object.assign(connection, updates);
            return connection;
        }
        return null;
    }
    
    findConnection(fromId, toId) {
        return this.connections.find(conn => 
            (conn.from === fromId && conn.to === toId) ||
            (conn.from === toId && conn.to === fromId)
        );
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
            if (!this.isLayerVisible(node.layer)) {
                continue;
            }
            
            this.renderNode(node);
        }
    }
    
    renderNode(node) {
        const { x, y } = node;
        const { width, height } = this.config.nodeSize;
        
        this.ctx.save();
        
        // Get layer info for colors
        const layer = this.layers.get(node.layer);
        const layerColor = layer?.color || '#3b82f6';
        
        // Node background with layer color (lighter)
        this.ctx.fillStyle = this.lightenColor(layerColor, 0.9);
        this.ctx.strokeStyle = layerColor;
        this.ctx.lineWidth = 2;
        
        // Draw node rectangle with rounded corners
        const radius = 8;
        this.drawRoundedRect(x - width/2, y - height/2, width, height, radius);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Node label
        this.ctx.fillStyle = '#1f2937';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.label || 'Node', x, y + 5);
        
        // Icon area (simplified - just a colored circle for now)
        if (node.icon) {
            this.ctx.fillStyle = layerColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y - 15, 8, 0, 2 * Math.PI);
            this.ctx.fill();
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
        const isSelected = this.selectedConnection === connection;
        const isHovered = this.hoveredConnection === connection;
        
        this.ctx.save();
        
        // Dim non-highlighted connections when highlighting is active
        if (this.highlightedConnections.length > 0 && !isHighlighted) {
            this.ctx.globalAlpha = 0.3;
        }
        
        // Determine connection styling
        let strokeColor = '#6b7280'; // Default gray
        let lineWidth = this.config.connectionWidth;
        
        if (isSelected) {
            strokeColor = '#3b82f6'; // Blue for selected
            lineWidth = this.config.connectionWidth * 2;
        } else if (isHighlighted) {
            strokeColor = '#ff6b35'; // Orange for highlighted
            lineWidth = this.config.connectionWidth * 2;
        } else if (isHovered) {
            strokeColor = '#8b5cf6'; // Purple for hovered
            lineWidth = this.config.connectionWidth * 1.5;
        }
        
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = lineWidth;
        
        // Add glow effect for special states
        if (isSelected || isHighlighted || isHovered) {
            this.ctx.shadowColor = strokeColor;
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
            
            // Reset shadow for text
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            
            // Text styling
            this.ctx.font = `bold ${this.config.fontSize - 1}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Measure text for background
            const textMetrics = this.ctx.measureText(connection.label);
            const textWidth = textMetrics.width;
            const textHeight = this.config.fontSize + 2;
            const padding = 4;
            
            // Draw background rectangle
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = 1;
            
            const bgRect = {
                x: midPoint.x - textWidth/2 - padding,
                y: midPoint.y - textHeight/2 - padding/2,
                width: textWidth + padding * 2,
                height: textHeight + padding
            };
            
            this.ctx.beginPath();
            this.drawRoundedRect(bgRect.x, bgRect.y, bgRect.width, bgRect.height, 3);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw text
            this.ctx.fillStyle = '#1f2937';
            this.ctx.fillText(connection.label, midPoint.x, midPoint.y);
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
        
        // Center the viewport to show the nodes
        setTimeout(() => {
            this.zoomToFit();
        }, 100);
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
    
    // Node Management
    addNode(nodeData) {
        const nodeId = nodeData.id || Utils.generateId();
        const node = {
            id: nodeId,
            x: nodeData.x || 0,
            y: nodeData.y || 0,
            label: nodeData.label || 'Node',
            layer: nodeData.layer || 'default',
            type: nodeData.type || 'default',
            data: nodeData.data || {},
            ...nodeData
        };
        
        this.nodes.set(nodeId, node);
        return node;
    }
    
    removeNode(nodeId) {
        // Remove node
        this.nodes.delete(nodeId);
        
        // Remove all connections to/from this node
        this.connections = this.connections.filter(conn => 
            conn.from !== nodeId && conn.to !== nodeId
        );
        
        // Clear selection if selected node was removed
        if (this.selectedNode && this.selectedNode.id === nodeId) {
            this.selectedNode = null;
        }
    }
    
    // Utility Methods
    clearAll() {
        this.nodes.clear();
        this.connections = [];
        this.selectedNode = null;
        this.hoveredNode = null;
        this.clearHighlights();
    }
    
    getNodeAtId(nodeId) {
        return this.nodes.get(nodeId);
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