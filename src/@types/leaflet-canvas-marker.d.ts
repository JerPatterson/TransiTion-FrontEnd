import 'leaflet';

declare module 'leaflet' {
  export class MarkersCanvas extends Layer {
    addTo(map: Map|LayerGroup): this;
    addMarker(marker: Marker): void;
    addMarkers(markers: Marker[]): void;
    getBounds(): LatLngBounds;
    redraw(): void;
    clear(): void;
    removeMarker(marker: Marker): void;
    removeMarkers(markers: Marker[]): void;
  }
  function markersCanvas():  MarkersCanvas;
}