<div align="center">

```
████████╗██████╗  █████╗ ███████╗███████╗██╗██╗  ██╗
╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██╔════╝██║╚██╗██╔╝
   ██║   ██████╔╝███████║█████╗  █████╗  ██║ ╚███╔╝ 
   ██║   ██╔══██╗██╔══██║██╔══╝  ██╔══╝  ██║ ██╔██╗ 
   ██║   ██║  ██║██║  ██║██║     ██║     ██║██╔╝ ██╗
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝     ╚═╝╚═╝  ╚═╝
```

### 🚀 Smart Traffic Navigation Powered by Dijkstra Algorithm

*Discover the fastest routes with real-time traffic simulation on interactive maps*

[Explore Demo](#) • [Documentation](#) • [Report Bug](#) • [GitHub](https://github.com/Chandansaha2005/Traffix)

</div>

---

## 📖 Introduction

**Traffix** is a cutting-edge traffic navigation web application that combines intelligent routing algorithms with beautiful, responsive UI. Powered by the Dijkstra Algorithm, Traffix analyzes real road networks and simulated traffic conditions to calculate optimal routes based on your preferences.

Whether you're looking for the shortest distance or the fastest travel time, Traffix intelligently adapts to current traffic patterns and provides accurate ETAs for multiple transportation modes.

---

## 🎯 Features

### Core Navigation
- ✨ **Real-Time Map Interaction** - Interactive OpenStreetMap with Leaflet.js
- 📍 **Smart Place Search** - Autocomplete with Nominatim for precise location finding
- 🗺️ **Current Location Detection** - Browser geolocation API integration
- 🧭 **Dual Routing Modes** - Choose between Shortest Distance or Fastest Route

### Traffic & Visualization
- 🚦 **Simulated Traffic Levels** - Low, Medium, Heavy traffic scenarios
- 🎨 **Traffic Color Coding** - Green (smooth), Yellow (moderate), Red (congested) roads
- 📊 **Traffic-Aware Routing** - Weights adjust based on traffic conditions
- 🔄 **Live Traffic Refresh** - Automatic and manual traffic updates

### Trip Analytics
- ⏱️ **Multi-Mode ETAs** - Walking, Cycling, Bike, and Car travel time estimates
- 📏 **Distance Metrics** - Precise distance calculations for each route
- 🎬 **Animated Route Reveal** - Smooth animations as route displays on map
- 📱 **Responsive Design** - Mobile-optimized bottom-sheet search panel

### Progressive Features
- 📲 **PWA Support** - Install as desktop or mobile app
- ⚡ **Performance Optimized** - Lightning-fast route calculations

---

## 🏗️ Architecture

### System Flow

```
┌─────────────┐
│   Frontend  │ (React + Vite + Tailwind)
│   (React)   │
└──────┬──────┘
       │ API Calls
       ▼
┌─────────────────────────────┐
│   Backend Server (Express)  │
│  - Route Calculation        │
│  - Traffic Simulation       │
│  - Dijkstra Algorithm       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────┐
│  Road Network   │
│  (OSM Data)     │
└─────────────────┘
```

### Request/Response Cycle

1. User selects source & destination on map
2. Frontend sends coordinates to backend
3. Backend generates realistic road network from OpenStreetMap data
4. Dijkstra algorithm calculates optimal path with traffic weights
5. Route, ETA, and distance return to frontend
6. Animated route renders on Leaflet map

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React** | UI Framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Styling & responsive design |
| **Framer Motion** | Animations & transitions |
| **Leaflet.js** | Interactive mapping |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | HTTP server framework |
| **Dijkstra Algorithm** | Route optimization engine |
| **OpenStreetMap** | Real road network data |
| **Nominatim API** | Place search & geocoding |

---

## 📸 UI Preview

### Main Navigation Interface
[**Add screenshot of main map/navigation UI here**]

### Search & Route Results
[**Add screenshot of search panel and route results here**]

### Traffic Visualization
[**Add screenshot showing different traffic levels here**]

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20.19 or newer
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Chandansaha2005/Traffix.git
cd Traffix
```

2. **Install dependencies** (from project root)
```bash
npm install
```

3. **Start the Backend**
```bash
cd backend
npm run dev
```

4. **Start the Frontend** (in another terminal)
```bash
cd frontend
npm run dev
```

5. **Open in Browser**
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

## ⚙️ Configuration

### Environment Variables

#### Frontend Setup
Create `.env` in `/frontend` directory:
```env
# For production deployment
VITE_API_URL=https://your-render-backend-url.onrender.com

# For local development, leave empty to proxy to backend
```

#### Backend Setup
Create `.env` in `/backend` directory:
```env
PORT=5000

# For production
CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app

# For local development
CORS_ORIGIN=*
```

---

## 📂 Project Structure

```
Traffix/
├── frontend/                    # React Application
│   ├── public/
│   │   ├── manifest.webmanifest
│   │   └── service-worker.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── map/             # Map rendering
│   │   │   ├── route/           # Route display & legend
│   │   │   └── search/          # Search interface
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   ├── services/            # API & external services
│   │   ├── styles/              # Global styles
│   │   ├── utils/               # Utilities & formatters
│   │   ├── animations/          # Animation definitions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     # Node.js Server
│   ├── algorithms/
│   │   └── dijkstra.js          # Pathfinding algorithm
│   ├── controllers/
│   │   └── routeController.js   # Route request handlers
│   ├── services/
│   │   ├── realRoutingService.js    # Route calculation
│   │   ├── roadGraphService.js      # Network generation
│   │   ├── trafficService.js        # Traffic simulation
│   │   └── travelTimeService.js     # ETA calculations
│   ├── routes/
│   │   └── routeRoutes.js       # API endpoints
│   ├── utils/
│   │   └── geo.js               # Geolocation utilities
│   ├── server.js
│   └── package.json
│
├── LICENSE
├── package.json
└── README.md
```

---

## 🧠 How Routing Works

### Step-by-Step Process

```
1. User Input
   ↓
   Selects source & destination with traffic level
   
2. Network Generation
   ↓
   Backend fetches real road data around coordinates
   Creates graph with road segments as edges
   
3. Traffic Application
   ↓
   Applies traffic multipliers to each edge:
   • Low Traffic: 1.0x multiplier
   • Medium Traffic: 1.5x multiplier  
   • Heavy Traffic: 2.5x multiplier
   
4. Algorithm Selection
   ↓
   Shortest Distance: weight = physical distance
   Fastest Route: weight = distance ÷ speed × traffic multiplier
   
5. Dijkstra Execution
   ↓
   Finds optimal path based on selected weight model
   
6. Result Display
   ↓
   Frontend animates route on map
   Displays distance, ETA for multiple modes
```

### Traffic Simulation
The traffic simulation automatically updates over time. Routes are refreshed in real-time, and users can manually trigger traffic updates to reflect current conditions.

---

## 🌍 Deployment

### Frontend Deployment on Vercel

1. **Settings**
   - Project root: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Environment Variables**
```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

### Backend Deployment on Render

1. **Settings**
   - Project root: `backend`
   - Build command: `npm install`
   - Start command: `npm start`

2. **Environment Variables**
```env
CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
```

---

## 📱 Progressive Web App

Traffix includes built-in PWA support featuring:
- Web app manifest for app-like installation
- Service worker for offline capabilities
- Install prompts for desktop and mobile

**To install:**
1. Deploy over HTTPS
2. Open in supported browser (Chrome, Edge, Safari)
3. Click install or use app menu

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

### How to Contribute
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Chandan Saha**
- GitHub: [@Chandansaha2005](https://github.com/Chandansaha2005)
- Project: [Traffix](https://github.com/Chandansaha2005/Traffix)

---

## 🙏 Acknowledgments

- **Leaflet.js** - Interactive mapping library
- **OpenStreetMap** - Free mapping data
- **Nominatim** - Geocoding and place search
- **React** & **Vite** - Modern web development
- Dijkstra Algorithm - Foundation of route optimization

---

