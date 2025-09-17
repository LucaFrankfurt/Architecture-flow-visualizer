# Architecture Flow Visualizer

A responsive web application for visualizing code-based architecture flows with interactive layer management.

## Features

### 🏗️ Architecture Visualization
- **Interactive Canvas**: Smooth zoom, pan, and navigation
- **Multiple Templates**: Pre-built architecture patterns (Microservices, Layered, Event-Driven, Hexagonal)
- **Node & Connection Rendering**: Clean visual representation of system components and their relationships

### 📋 Layer Management
- **Toggle Layers**: Show/hide architectural layers independently
- **Layer Organization**: Color-coded layers with node counts
- **Bulk Operations**: Show all, hide all, or focus on specific layers
- **Layer Details**: Detailed information and statistics for each layer

### 💻 Code Integration
- **Code Snippets**: Associate code implementations with nodes
- **Syntax Highlighting**: Multi-language code support
- **Copy Functionality**: One-click code copying
- **Code Panel**: Dedicated sidebar for viewing component code

### 🎨 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Themes**: Toggle between themes with system preference detection
- **Keyboard Shortcuts**: Efficient navigation and control
- **Accessibility**: Screen reader support and keyboard navigation

### 🔧 Interactive Features
- **Node Selection**: Click nodes for detailed information
- **Smooth Animations**: Fluid zoom, pan, and layer transitions
- **Modal Dialogs**: Rich node and layer detail views
- **Export/Import**: Save and load architecture configurations

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start exploring architecture patterns!

### Project Structure
```
architecture-flow-app/
├── index.html              # Main application HTML
├── css/
│   └── styles.css          # Complete styling and themes
├── js/
│   ├── app.js              # Main application logic
│   ├── canvas-engine.js    # Canvas rendering engine
│   ├── layer-manager.js    # Layer management system
│   ├── architecture-data.js # Sample architecture templates
│   └── utils.js            # Utility functions
└── data/                   # Sample data files (optional)
```

## Usage Guide

### Navigation
- **Zoom**: Mouse wheel or zoom controls
- **Pan**: Click and drag on empty canvas area
- **Node Selection**: Click on any node for details

### Keyboard Shortcuts
- `Ctrl/Cmd + Plus`: Zoom in
- `Ctrl/Cmd + Minus`: Zoom out
- `Ctrl/Cmd + 0`: Reset zoom
- `Ctrl/Cmd + F`: Fit to screen
- `Ctrl/Cmd + C`: Center view
- `Ctrl/Cmd + T`: Toggle theme
- `Ctrl/Cmd + S`: Toggle sidebar
- `Ctrl/Cmd + 1-9`: Toggle layers by index
- `Escape`: Close modals and deselect

### Layer Controls
- **Toggle Visibility**: Use the switch next to each layer
- **Show All/Hide All**: Bulk layer operations
- **Layer Details**: Click on layer name for detailed information
- **Focus Layer**: Show only one layer at a time

### Architecture Templates
Choose from predefined templates in the sidebar:
- **Microservices**: Distributed services with API gateway
- **Layered**: Traditional n-tier architecture
- **Event-Driven**: Asynchronous event-based communication
- **Hexagonal**: Ports and adapters pattern

### Code Integration
- **View Code**: Click nodes with code implementations
- **Copy Code**: Use the copy button in the code panel
- **Multiple Languages**: Supports Java, JavaScript, Python, Go, and more

## Architecture Templates

### Microservices Architecture
Demonstrates a typical microservices setup with:
- API Gateway for request routing
- Independent business services
- Database per service pattern
- Infrastructure components (cache, message queue)

### Layered Architecture
Shows traditional n-tier architecture:
- Presentation layer (UI components)
- Business logic layer
- Data access layer
- Database layer

### Event-Driven Architecture
Illustrates event-based communication:
- Event producers (services generating events)
- Event brokers (routing and distribution)
- Event consumers (processing events)
- Event storage for persistence

### Hexagonal Architecture
Displays ports and adapters pattern:
- Core domain with business logic
- Ports as interfaces
- Adapters for external systems

## Customization

### Adding New Templates
1. Edit `js/architecture-data.js`
2. Add new template method following existing patterns
3. Include layers, nodes, and connections
4. Update template selector in HTML

### Styling
- Modify CSS variables in `:root` for theme colors
- Add new layer colors in the color array
- Customize component sizes in canvas engine configuration

### Code Examples
Each node can include code snippets:
```javascript
{
    id: 'my-service',
    label: 'My Service',
    code: 'const service = new MyService();',
    codeLanguage: 'javascript'
}
```

## Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance
- Optimized canvas rendering with requestAnimationFrame
- Efficient layer visibility calculations
- Responsive design with minimal reflows
- High DPI display support

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across browsers
5. Submit a pull request

## License
MIT License - feel free to use for personal and commercial projects.

## Future Enhancements
- [ ] Real-time collaboration
- [ ] More architecture templates
- [ ] SVG export functionality
- [ ] Integration with diagramming tools
- [ ] Plugin system for custom components
- [ ] Version control for architecture designs

## Support
For issues or questions:
1. Check the browser console for errors
2. Ensure you're using a supported browser
3. Try refreshing the page
4. Clear browser cache if needed

---

**Architecture Flow Visualizer** - Making complex architectures visual and interactive.