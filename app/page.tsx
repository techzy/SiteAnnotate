"use client";

import React, { useState, useRef } from 'react';

// 1. Define our Custom Types/Interfaces
interface Coordinates {
  x: number;
  y: number;
}

interface MarkerData extends Coordinates {
  id: string;
  photos: string[];
}

export default function Home() {
  // 2. Add Type Annotations to State
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [pendingCoords, setPendingCoords] = useState<Coordinates | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  
  // 3. Strongly Type the Refs based on the HTML elements they point to
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4. Strongly Type the Mouse Event
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent triggering if clicking an existing marker
    if ((e.target as HTMLElement).className.includes('marker')) return;

    // Safety check in TS to ensure the ref is attached to an element
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    setPendingCoords({ x: xPercent, y: yPercent });
    
    // Trigger the hidden file input (using optional chaining ?.)
    fileInputRef.current?.click();
  };

  // 5. Strongly Type the Input Change Event
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !pendingCoords) return;

    const photoUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      photoUrls.push(URL.createObjectURL(files[i]));
    }

    const newMarker: MarkerData = {
      id: Date.now().toString(),
      x: pendingCoords.x,
      y: pendingCoords.y,
      photos: photoUrls,
    };

    setMarkers([...markers, newMarker]);
    
    // Reset inputs
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPendingCoords(null);
  };

  // 6. Strongly Type the Marker Click Event
  const handleMarkerClick = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation(); 
    setActiveMarkerId(id);
  };

  const closeModal = () => {
    setActiveMarkerId(null);
  };

  const activeMarker = markers.find(m => m.id === activeMarkerId);

  return (
    <main>
      <h1>Site Plan Annotator</h1>
      <p>Click anywhere on the plan to mark a change order and upload photos. Click an existing blue dot to view the photos.</p>

      {/* Blueprint Container */}
      <div 
        id="plan-container" 
        ref={containerRef} 
        onClick={handleMapClick}
      >
        <img id="site-plan" src="/Sitefloor.JPG" alt="Site Plan" />
        
        {/* Render all markers from state */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="marker"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            onClick={(e) => handleMarkerClick(e, marker.id)}
          />
        ))}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Modal */}
      {activeMarker && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Order Photos</h2>
            <div className="modal-images">
              {activeMarker.photos.length > 0 ? (
                activeMarker.photos.map((url, idx) => (
                  <img key={idx} src={url} alt={`Change order ${idx + 1}`} />
                ))
              ) : (
                <p>No photos attached.</p>
              )}
            </div>
            <button className="close-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}