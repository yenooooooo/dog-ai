declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    getCenter(): LatLng;
    getLevel(): number;
    panTo(latlng: LatLng): void;
    setBounds(bounds: LatLngBounds): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
    getPosition(): LatLng;
  }

  class Polyline {
    constructor(options: PolylineOptions);
    setMap(map: Map | null): void;
    getLength(): number;
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions);
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
  }

  class MarkerImage {
    constructor(src: string, size: Size, options?: { offset?: Point });
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: Map;
    image?: MarkerImage;
  }

  interface PolylineOptions {
    path: LatLng[];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeStyle?: string;
    map?: Map;
  }

  interface CustomOverlayOptions {
    content: string | HTMLElement;
    position: LatLng;
    map?: Map;
    yAnchor?: number;
    xAnchor?: number;
  }

  function load(callback: () => void): void;

  namespace event {
    function addListener(
      target: Map | Marker,
      type: string,
      handler: (...args: unknown[]) => void
    ): void;
    function removeListener(
      target: Map | Marker,
      type: string,
      handler: (...args: unknown[]) => void
    ): void;
  }

  namespace services {
    class Geocoder {
      coord2Address(
        lng: number,
        lat: number,
        callback: (result: GeocoderResult[], status: Status) => void
      ): void;
    }

    interface GeocoderResult {
      address: {
        address_name: string;
        region_1depth_name: string;
        region_2depth_name: string;
        region_3depth_name: string;
      };
      road_address: {
        address_name: string;
      } | null;
    }

    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }
  }
}

declare interface Window {
  kakao: {
    maps: typeof kakao.maps & {
      load: (callback: () => void) => void;
    };
  };
}
