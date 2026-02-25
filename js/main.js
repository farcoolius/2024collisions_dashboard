mapboxgl.accessToken = "pk.eyJ1IjoiZmFyaGFzcyIsImEiOiJjbW0xOWt1b2MwN2s0MnNvYzFhNW5tZXRjIn0.woofAfgLav-FoAG30Mo0pg";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v11",
    center: [-122.33, 47.61],
    zoom: 10
});

map.on("load", () => {
  fetch("assets/SDOT_Collisions_2024.geojson")
    .then(r => r.json())
    .then(data => {

      // ---- A) Build grid counts ----
      // cellSize is in degrees (rough). Smaller = more detailed.
      // 0.005 ≈ ~500m-ish in Seattle (rough approximation).
      const cellSize = 0.005;

      const counts = {}; // key => count

      data.features.forEach(f => {
        const coords = f.geometry && f.geometry.coordinates;
        if (!coords) return;

        const lon = coords[0];
        const lat = coords[1];

        // Snap each point into a grid cell
        const gx = Math.floor(lon / cellSize) * cellSize;
        const gy = Math.floor(lat / cellSize) * cellSize;
        const key = `${gx},${gy}`;

        counts[key] = (counts[key] || 0) + 1;
      });

      // ---- B) Convert grid counts into a new GeoJSON (one point per cell) ----
      const gridGeoJSON = {
        type: "FeatureCollection",
        features: Object.entries(counts).map(([key, count]) => {
          const [gx, gy] = key.split(",").map(Number);

          // center of the grid cell
          const centerLon = gx + cellSize / 2;
          const centerLat = gy + cellSize / 2;

          return {
            type: "Feature",
            geometry: { type: "Point", coordinates: [centerLon, centerLat] },
            properties: { count }
          };
        })
      };

      // ---- C) Add to Mapbox + draw proportional circles ----
      map.addSource("gridCounts", {
        type: "geojson",
        data: gridGeoJSON
      });

      map.addLayer({
        id: "grid-proportional",
        type: "circle",
        source: "gridCounts",
        paint: {
          "circle-opacity": 0.65,
          "circle-color": "#2563eb",
          "circle-stroke-color": "#1e3a8a",
          "circle-stroke-width": 1,

          // Proportional symbol sizing by accident COUNT
          "circle-radius": [
            "interpolate", ["linear"], ["get", "count"],
            1, 3,
            10, 8,
            25, 14,
            50, 20,
            100, 28
          ]
        }
      });

      // Optional popup showing count
      map.on("click", "grid-proportional", (e) => {
        const c = e.features[0].properties.count;
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`<b>Collisions in this area:</b> ${c}`)
          .addTo(map);
      });

      map.on("mouseenter", "grid-proportional", () => map.getCanvas().style.cursor = "pointer");
      map.on("mouseleave", "grid-proportional", () => map.getCanvas().style.cursor = "");
    });
});
