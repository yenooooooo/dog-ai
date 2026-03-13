export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Waypoint extends Coordinate {
  order: number;
}

export interface RouteSegment {
  start: Coordinate;
  end: Coordinate;
  distance: number;
  duration: number;
  path: Coordinate[];
}

export interface GeneratedRoute {
  id: string;
  name: string;
  tags: string[];
  segments: RouteSegment[];
  totalDistance: number;
  estimatedDuration: number;
  waypoints: Waypoint[];
  path: Coordinate[];
}

export interface RouteGenerationRequest {
  origin: Coordinate;
  durationMinutes: number;
}

export interface RouteGenerationResponse {
  routes: GeneratedRoute[];
}
