# Architecture Flow Visualizer

A powerful, interactive web application for visualizing and designing software architecture flows with comprehensive editing capabilities, layer management, and real-time interaction.

## 🌟 Key Features

### 🏗️ **Interactive Architecture Design**
- **Dynamic Canvas**: Smooth zoom, pan, and navigation with high-DPI support
- **Multiple Templates**: 7+ pre-built architecture patterns (Microservices, Clean Architecture, CQRS, Event-Driven, Hexagonal, Layered, Serverless)
- **Visual Node System**: Color-coded nodes with layer-based styling and rounded corners
- **Smart Connections**: Clickable connection lines with arrows and labels
- **Real-time Editing**: Create, edit, and delete nodes and connections instantly

### 🔗 **Advanced Connection Management**
- **Connection Mode**: Interactive tool for linking nodes with visual feedback
- **Editable Connections**: Click any connection to edit labels, types, and descriptions
- **Connection Types**: Support for Synchronous, Asynchronous, Event, Data Flow, API Call, and Message connections
- **Visual Labels**: Professionally styled connection labels with backgrounds
- **Smart Detection**: Precise click detection on connection lines
- **CRUD Operations**: Full create, read, update, delete support with undo/redo

### 📋 **Layer Management System**
- **Toggle Layers**: Show/hide architectural layers independently with smooth animations
- **Layer Organization**: Color-coded layers with real-time node counts and statistics
- **Bulk Operations**: Show all, hide all, or focus on specific layers
- **Layer Details**: Comprehensive information and visual indicators for each layer
- **Dynamic Visibility**: Automatic connection visibility based on layer states

### 🎯 **Node Management**
- **Add Nodes**: Create new nodes with custom labels, types, layers, and icons
- **Edit Properties**: Modify node details through intuitive modal dialogs
- **Node Types**: Support for services, databases, APIs, gateways, caches, queues, storage, external systems, and UI components
- **Icon Library**: Extensive FontAwesome icon collection with preview
- **Smart Positioning**: Automatic layout and manual positioning options

### 💻 **Code Integration**
- **Code Snippets**: Associate real code implementations with architectural nodes
- **Multi-language Support**: JavaScript, Java, Python, Go, C#, and more
- **Syntax Highlighting**: Rich code display with language-specific formatting
- **Copy Functionality**: One-click code copying to clipboard
- **Code Modal**: Dedicated fullscreen code viewer with syntax highlighting
- **Implementation Examples**: Real-world code patterns for each architecture component

### 🎨 **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with intuitive controls
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance**: Optimized canvas rendering with smooth 60fps animations
- **Error Handling**: Robust error handling with user-friendly feedback

### 🔧 **Advanced Tools**
- **Undo/Redo System**: Comprehensive command history for all operations
- **Import/Export**: JSON-based save/load functionality for architecture designs
- **Auto Layout**: Intelligent node positioning algorithms
- **Connection Detection**: Prevent duplicate connections with smart validation
- **Zoom Controls**: Precise zoom with fit-to-screen and center view options
- **Search & Filter**: Find and focus on specific nodes and connections

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- No installations or dependencies required
- Works offline after initial load

### Quick Start
1. **Download**: Clone or download the project files
2. **Open**: Open `index.html` in your web browser or start a local server
3. **Explore**: Start with pre-built templates or create your own architecture

### Local Development Server
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Then open: http://localhost:8000
```

## 📁 Project Structure

```
architecture-flow-app/
├── index.html                 # Main application entry point
├── css/
│   └── styles.css            # Complete styling with CSS variables and themes
├── js/
│   ├── app.js                # Main application logic and event handling
│   ├── canvas-engine.js      # Canvas rendering engine and interaction
│   ├── layer-manager.js      # Layer management and UI controls
│   ├── architecture-data.js  # Architecture templates and sample data
│   └── utils.js              # Utility functions and helpers
├── data/                     # Sample architecture data files
│   ├── banking-system.json   # Complex banking architecture example
│   ├── ecommerce-platform.json # E-commerce system example
│   └── iot-smart-city.json   # IoT architecture example
└── README.md                 # This file
```

## 🎮 Usage Guide

### Canvas Navigation
- **Zoom**: Mouse wheel or `+`/`-` buttons
- **Pan**: Click and drag on empty canvas area
- **Reset View**: Click "Fit to Screen" or use keyboard shortcuts
- **Node Selection**: Click nodes to view details and associated code
- **Connection Editing**: Click connection lines to edit properties

### Connection Management
1. **Creating Connections**:
   - Click "Connection Mode" button
   - Click source node (highlighted in blue)
   - Click target node to create connection
   - Enter optional label in prompt dialog
   - Click "Exit Connection Mode" when done

2. **Editing Connections**:
   - Click any connection line
   - Edit label, type, and description in modal
   - Choose from connection types (API, Event, Data, etc.)
   - Save changes or delete connection

### Node Management
1. **Adding Nodes**:
   - Click "Add Node" button
   - Fill in label, type, layer, and select icon
   - Choose position on canvas
   - Save to create node

2. **Editing Nodes**:
   - Click any node to view details
   - Use edit controls to modify properties
   - Update code implementations if available

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + +` | Zoom in |
| `Ctrl/Cmd + -` | Zoom out |
| `Ctrl/Cmd + 0` | Reset zoom |
| `Ctrl/Cmd + F` | Fit to screen |
| `Ctrl/Cmd + C` | Center view |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + S` | Export JSON |
| `Escape` | Close modals/exit modes |

## 🏛️ Architecture Templates

### 1. **Microservices Architecture**
Complete microservices setup with:
- API Gateway for request routing and rate limiting
- Independent business services (User, Order, Payment)
- Database-per-service pattern
- Infrastructure components (Cache, Message Queue)
- Service discovery and configuration

### 2. **Clean Architecture**
Uncle Bob's Clean Architecture with:
- Entities (Enterprise business rules)
- Use Cases (Application business rules)
- Interface Adapters (Controllers, Presenters)
- Frameworks & Drivers (External interfaces)
- Dependency inversion principles

### 3. **CQRS (Command Query Responsibility Segregation)**
Event sourcing and CQRS pattern with:
- Command handlers for write operations
- Query handlers for read operations
- Event store for audit trail
- Read/write model separation
- Event-driven architecture

### 4. **Event-Driven Architecture**
Asynchronous event-based communication:
- Event producers generating domain events
- Event brokers for routing and distribution
- Event consumers processing events
- Event storage for replay and audit
- Saga pattern for distributed transactions

### 5. **Hexagonal Architecture**
Ports and adapters pattern with:
- Core domain with business logic
- Ports as interfaces (inbound/outbound)
- Adapters for external systems
- Infrastructure independence
- Testability and flexibility

### 6. **Layered Architecture**
Traditional n-tier architecture:
- Presentation layer (UI components)
- Business logic layer (Services)
- Data access layer (Repositories)
- Database layer (Persistence)
- Cross-cutting concerns

### 7. **Serverless Architecture**
Cloud-native serverless design:
- Function-as-a-Service (FaaS)
- API Gateway and triggers
- Managed databases and storage
- Event-driven scaling
- Pay-per-execution model

## 🎨 Customization

### Adding Custom Templates
```javascript
// In architecture-data.js
static getMyCustomTemplate() {
    return {
        name: 'My Custom Architecture',
        description: 'Custom architecture pattern',
        layers: [
            {
                id: 'frontend',
                name: 'Frontend Layer',
                color: '#3b82f6',
                visible: true,
                description: 'User interface components'
            }
        ],
        nodes: [
            {
                id: 'web-app',
                x: 0,
                y: 0,
                label: 'Web Application',
                layer: 'frontend',
                icon: 'fas fa-desktop',
                type: 'frontend',
                description: 'Main web application',
                code: `// React component example
function App() {
    return <div>My App</div>;
}`,
                codeLanguage: 'javascript'
            }
        ],
        connections: [
            {
                from: 'web-app',
                to: 'api',
                label: 'HTTP Request'
            }
        ]
    };
}
```

### Styling Customization
```css
/* Custom CSS variables for theming */
:root {
    --primary-color: #your-color;
    --canvas-bg: #your-bg-color;
    --node-bg: #your-node-color;
}

/* Custom node colors per layer */
.layer-custom {
    --layer-color: #custom-color;
}
```

### Node Types and Icons
The application supports extensive customization:
- **Node Types**: service, database, api, gateway, cache, queue, storage, external, ui, custom
- **Icons**: Full FontAwesome library integration
- **Colors**: Automatic layer-based coloring with custom override support
- **Code Languages**: javascript, java, python, go, csharp, typescript, sql, yaml, json

## 🔧 API Reference

### Canvas Engine Methods
```javascript
// Add new node
canvasEngine.addNode({
    id: 'unique-id',
    x: 100,
    y: 100,
    label: 'Node Label',
    layer: 'layer-id',
    icon: 'fas fa-server',
    type: 'service'
});

// Add connection
canvasEngine.addConnection({
    from: 'node1-id',
    to: 'node2-id',
    label: 'Connection Label',
    type: 'api'
});

// Update node
canvasEngine.updateNode('node-id', {
    label: 'New Label',
    description: 'Updated description'
});

// Remove elements
canvasEngine.removeNode('node-id');
canvasEngine.removeConnection('from-id', 'to-id');
```

## 📊 Performance & Browser Support

### Performance Features
- **Optimized Rendering**: Canvas-based rendering with 60fps animations
- **Smart Updates**: Only re-render when necessary
- **Memory Management**: Efficient cleanup and garbage collection
- **Large Diagrams**: Handles 100+ nodes with smooth performance
- **Responsive Loading**: Progressive loading for complex templates

### Browser Compatibility
| Browser | Version | Features |
|---------|---------|----------|
| Chrome | 80+ | Full support |
| Firefox | 75+ | Full support |
| Safari | 13+ | Full support |
| Edge | 80+ | Full support |
| Mobile Safari | 13+ | Touch optimized |
| Mobile Chrome | 80+ | Touch optimized |

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper testing
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Test in multiple browsers
- Add documentation for new features
- Include examples in architecture-data.js
- Ensure responsive design compatibility

## 📝 License

MIT License - Free for personal and commercial use.

## 🆘 Support & Troubleshooting

### Common Issues
1. **Blank Canvas**: Check browser console for errors, ensure JavaScript is enabled
2. **Performance Issues**: Reduce number of visible layers, try different browser
3. **Touch Issues**: Use two-finger gestures for zoom on mobile devices
4. **Export Problems**: Ensure modern browser with JSON support

### Getting Help
- **GitHub Issues**: Report bugs and feature requests
- **Browser Console**: Check for JavaScript errors and warnings
- **Documentation**: This README covers most use cases
- **Examples**: Check the data/ folder for sample architectures

## 🚀 Future Roadmap

### Planned Features
- [ ] **Real-time Collaboration**: Multiple users editing simultaneously
- [ ] **Version Control**: Git-like versioning for architecture designs
- [ ] **Plugin System**: Custom node types and behaviors
- [ ] **SVG Export**: High-quality vector graphics export
- [ ] **Database Integration**: Store and sync architectures with databases
- [ ] **Team Workspaces**: Shared spaces for architecture teams
- [ ] **Integration APIs**: Connect with other development tools
- [ ] **Custom Themes**: User-defined visual themes and branding
- [ ] **Performance Analytics**: Architecture complexity metrics
- [ ] **Documentation Generator**: Auto-generate docs from diagrams

---

**Architecture Flow Visualizer** - Transforming complex software architectures into interactive, understandable visual experiences.

✨ *Created with passion for clean, maintainable, and visually stunning architecture documentation.*