// Add connections programmatically via browser console

// Method 1: Direct canvas engine API
window.app.canvasEngine.addConnection({
    from: 'api-gateway',      // Source node ID
    to: 'user-service',       // Target node ID
    label: 'HTTP Request'     // Optional connection label
});

// Method 2: Using the command system (supports undo/redo)
const connectionCommand = window.app.createAddConnectionCommand(
    'order-service',     // Source node ID
    'payment-service'    // Target node ID
);
window.app.executeCommand(connectionCommand);

// Method 3: Bulk add multiple connections
const connections = [
    { from: 'api-gateway', to: 'order-service', label: 'Route Request' },
    { from: 'order-service', to: 'order-db', label: 'Store Data' },
    { from: 'payment-service', to: 'message-queue', label: 'Publish Event' }
];

connections.forEach(conn => {
    window.app.canvasEngine.addConnection(conn);
});

// Re-render the canvas to show new connections
window.app.canvasEngine.render();

// Method 4: Remove connections
window.app.canvasEngine.removeConnection('api-gateway', 'user-service');