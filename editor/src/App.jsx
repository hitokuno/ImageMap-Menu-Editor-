import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [image, setImage] = useState(null); // URL or base64
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [hotspots, setHotspots] = useState([]);
  const [selectedHotspotId, setSelectedHotspotId] = useState(null);
  const [imageName, setImageName] = useState('');

  useEffect(() => {
    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        if (data.canvas) setCanvasSize(data.canvas);
        if (data.hotspots) setHotspots(data.hotspots);
        if (data.imageUrl) {
          setImage(data.imageUrl);
          setImageName(data.imageUrl);
          // Optionally pre-load to get dimensions if not in canvas
          const img = new Image();
          img.onload = () => {
            if (!data.canvas) {
              setCanvasSize({ width: img.width, height: img.height });
            }
          };
          img.src = data.imageUrl;
        }
      })
      .catch(err => console.log('No default config found', err));
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setCanvasSize({ width: img.width, height: img.height });
          setImage(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const addHotspot = (rect) => {
    // Convert rect to 4 points
    const points = [
      { x: rect.x, y: rect.y }, // TL
      { x: rect.x + rect.w, y: rect.y }, // TR
      { x: rect.x + rect.w, y: rect.y + rect.h }, // BR
      { x: rect.x, y: rect.y + rect.h } // BL
    ];

    const newHotspot = {
      id: uuidv4(),
      points,
      type: 'link',
      props: {
        url: '',
        tooltip: '',
        items: []
      }
    };
    setHotspots([...hotspots, newHotspot]);
    setSelectedHotspotId(newHotspot.id);
  };

  const updateHotspot = (id, updates) => {
    setHotspots(hotspots.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHotspot = (id) => {
    setHotspots(hotspots.filter(h => h.id !== id));
    if (selectedHotspotId === id) setSelectedHotspotId(null);
  };

  const selectedHotspot = hotspots.find(h => h.id === selectedHotspotId);

  const handleExport = () => {
    const data = {
      imageUrl: imageName,
      canvas: canvasSize,
      hotspots
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'imagemap.json';
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.canvas) setCanvasSize(data.canvas);
          if (data.hotspots) setHotspots(data.hotspots);
          if (data.imageUrl) setImageName(data.imageUrl);
          // Note: Image needs to be re-uploaded or we need to store image data in JSON (heavy).
          // For now, we assume user re-uploads image or we just load hotspots.
          // If the JSON contains image data (base64), we can load it.
          // Let's assume for now we just load hotspots and canvas size.
        } catch (err) {
          console.error("Invalid JSON", err);
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="app-container">
      <div className="toolbar">
        <h1>Image Map Editor</h1>
        <div>
          <label style={{ marginRight: 10 }}>Image:</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
        <div>
          <label style={{ marginRight: 10 }}>Image URL:</label>
          <input
            type="text"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            placeholder="e.g. images/map.jpg"
            style={{ width: 200 }}
          />
        </div>
        <div>
          <label style={{ marginRight: 10 }}>Import JSON:</label>
          <input type="file" accept=".json" onChange={handleImport} />
        </div>
        <button onClick={handleExport} disabled={!image && hotspots.length === 0}>Export JSON</button>
      </div>
      <div className="main-content">
        <div className="canvas-wrapper">
          {image ? (
            <Canvas
              image={image}
              width={canvasSize.width}
              height={canvasSize.height}
              hotspots={hotspots}
              selectedHotspotId={selectedHotspotId}
              onAddHotspot={addHotspot}
              onUpdateHotspot={updateHotspot}
              onSelectHotspot={setSelectedHotspotId}
            />
          ) : (
            <div className="placeholder">Please upload an image to start</div>
          )}
        </div>
        <Sidebar
          hotspot={selectedHotspot}
          onUpdate={(updates) => updateHotspot(selectedHotspotId, updates)}
          onDelete={() => deleteHotspot(selectedHotspotId)}
        />
      </div>
    </div>
  );
}

export default App;
