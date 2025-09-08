import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Custom CSS for popup styling
const popupStyles = `
  .custom-popup .mapboxgl-popup-content {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
  
  .custom-popup .mapboxgl-popup-tip {
    border-top-color: rgb(147 51 234 / 0.3) !important;
  }
  
  .custom-popup .mapboxgl-popup-close-button {
    color: rgb(156 163 175) !important;
    font-size: 20px !important;
    padding: 8px !important;
    background: rgba(0, 0, 0, 0.5) !important;
    border-radius: 50% !important;
    width: 32px !important;
    height: 32px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s !important;
  }
  
  .custom-popup .mapboxgl-popup-close-button:hover {
    background: rgba(147, 51, 234, 0.3) !important;
    color: white !important;
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = popupStyles;
  document.head.appendChild(styleElement);
}

interface Building {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  building_code?: string;
}

interface CampusMapProps {
  buildings: Building[];
  selectedBuilding?: Building | null;
  onBuildingClick?: (building: Building) => void;
}

export default function CampusMap({ buildings, selectedBuilding, onBuildingClick }: CampusMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // SCSU campus center coordinates (longitude, latitude)
  const CAMPUS_CENTER: [number, number] = [-94.151162, 45.554294
];

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Set access token
    mapboxgl.accessToken = 'pk.eyJ1IjoiamF5bWluMTAwIiwiYSI6ImNtZHM4NW9hYjBwZGIyam9jZDJzczZoMmEifQ.P9D6jcyuzLlUUGi952fQtw';

    // Create enhanced map with 3D
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: CAMPUS_CENTER,
      zoom: 16,
      pitch: 45, // 3D tilt
      bearing: 0, // North orientation
      antialias: true // Smooth edges
    });




    // Wait for map to load and be fully ready
    map.current.on('load', () => {
      console.log('Map loaded, waiting for style...');
      
      // Wait for style to be fully loaded before adding markers
      if (map.current!.isStyleLoaded()) {
        console.log('Style already loaded, adding markers...');
        addMarkers();
      } else {
        map.current!.on('styledata', () => {
          console.log('Style loaded, adding markers...');
          // Small delay to ensure map is fully ready
          setTimeout(() => {
            addMarkers();
          }, 100);
        });
      }
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add markers when buildings change
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      addMarkers();
    }
  }, [buildings]);

  // Re-render markers when selection changes
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      addMarkers();
      // Center map on selected building
      if (
        selectedBuilding &&
        typeof selectedBuilding.latitude === 'number' &&
        typeof selectedBuilding.longitude === 'number'
      ) {
        map.current.flyTo({
          center: [selectedBuilding.longitude, selectedBuilding.latitude],
          zoom: 17,
          duration: 800
        });
      }
    }
  }, [selectedBuilding]);

  const addMarkers = () => {
    console.log('addMarkers called');
    console.log('map.current exists:', !!map.current);
    console.log('map.current.isStyleLoaded():', map.current?.isStyleLoaded());
    console.log('buildings count:', buildings.length);
    console.log('Buildings data:', buildings);
    
    if (!map.current || !map.current.isStyleLoaded()) {
      console.log('Map not ready, returning early');
      return;
    }

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.building-marker');
    existingMarkers.forEach(marker => marker.remove());

    let validBuildings = 0;
    let invalidBuildings = 0;

    // Add new markers
    buildings.forEach((building) => {
      console.log('Processing building:', building.name, 'at', building.latitude, building.longitude);
      
      // Validate coordinates
      if (!building.latitude || !building.longitude) {
        console.log('❌ Skipping building - no coordinates:', building.name);
        invalidBuildings++;
        return;
      }
      
      // Check if coordinates are numbers and within valid ranges
      if (typeof building.latitude !== 'number' || typeof building.longitude !== 'number') {
        console.log('❌ Skipping building - coordinates not numbers:', building.name, building.latitude, building.longitude);
        invalidBuildings++;
        return;
      }
      
      // Validate coordinates - latitude field contains latitude, longitude field contains longitude
      if (building.latitude < -90 || building.latitude > 90) {
        console.log('❌ Skipping building - invalid latitude:', building.name, building.latitude);
        invalidBuildings++;
        return;
      }
      
      if (building.longitude < -180 || building.longitude > 180) {
        console.log('❌ Skipping building - invalid longitude:', building.name, building.longitude);
        invalidBuildings++;
        return;
      }

      // Create enhanced marker element with selection styling
      const isSelected = selectedBuilding && selectedBuilding.id === building.id;
      const markerEl = document.createElement('div');
      markerEl.className = 'building-marker';
      markerEl.innerHTML = `
        <div class="relative group">
          <!-- Main marker - fancy if selected, gray if not -->
          <div class="${isSelected 
            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white text-xs md:text-sm font-bold px-3 md:px-4 py-2 md:py-3 rounded-full border-3 border-white shadow-2xl cursor-pointer hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transition-all duration-500 transform hover:scale-125 hover:shadow-purple-500/50 hover:rotate-3' 
            : 'bg-gray-600 text-gray-200 text-xs md:text-sm font-bold px-3 md:px-4 py-2 md:py-3 rounded-full border-2 border-gray-400 shadow-md cursor-pointer hover:bg-gray-500 transition-all duration-300 transform hover:scale-105'
          }">
            ${building.building_code || building.name.charAt(0)}
          </div>
          
          <!-- Glow effect - only for selected -->
          ${isSelected ? `
            <div class="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-all duration-500 -z-10 scale-150"></div>
          ` : ''}
          
          <!-- Pulse animations - only for selected -->
          ${isSelected ? `
            <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-30"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-ping opacity-20" style="animation-delay: 0.5s;"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-25" style="animation-delay: 1s;"></div>
          ` : ''}
          
          <!-- Sparkle effect - only for selected -->
          ${isSelected ? `
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
            <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-80" style="animation-delay: 0.3s;"></div>
          ` : ''}
        </div>
      `;

      // Create simple popup with just the building name
      const popup = new mapboxgl.Popup({
        closeButton: true,
        maxWidth: '200px',
        className: 'custom-popup'
      }).setHTML(`
        <div class="bg-gradient-to-br from-neutral-950 via-purple-900/20 to-neutral-950 border border-purple-500/30 rounded-xl p-3 shadow-2xl shadow-purple-500/25 relative overflow-hidden backdrop-blur-md">
          <!-- Background elements matching site theme -->
          <div class="absolute inset-0 bg-gradient-to-br from-neutral-950 via-purple-900/10 to-neutral-950"></div>
          <div class="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl"></div>
          
          <!-- Simple building name display -->
          <div class="text-center relative z-10">
            <h3 class="text-base font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              ${building.name}
            </h3>
          </div>
        </div>
      `);

      // Create marker with correct coordinate order
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([building.longitude, building.latitude]) // [lng, lat] order
        .setPopup(popup)
        .addTo(map.current!);
      
      console.log('Marker created and added for:', building.name);

      // Add click handler to trigger callback
      markerEl.addEventListener('click', () => {
        console.log('Marker clicked:', building.name);
        // Trigger the building click callback
        if (onBuildingClick) {
          onBuildingClick(building);
        }
      });
      
      validBuildings++;
    });
    
    console.log(`✅ Marker creation complete: ${validBuildings} valid markers, ${invalidBuildings} invalid buildings`);
    console.log(`🎯 Total buildings processed: ${buildings.length}`);


  };

  const centerCampus = () => {
    if (map.current) {
      map.current.flyTo({
        center: CAMPUS_CENTER,
        zoom: 16,
        duration: 1000
      });
    }
  };

  const resetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: CAMPUS_CENTER,
        zoom: 16,
        duration: 1000
      });
    }
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] md:h-[600px] rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl bg-gradient-to-br from-purple-900/10 to-blue-900/10">
      {/* Map container with enhanced styling */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Enhanced map overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Map Control Buttons */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
        <button
          onClick={centerCampus}
          className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 hover:from-purple-700/90 hover:to-blue-700/90 text-white p-2 md:p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm border border-white/20"
          title="Center Campus"
        >
          🎯
        </button>
      </div>
    </div>
  );
}
