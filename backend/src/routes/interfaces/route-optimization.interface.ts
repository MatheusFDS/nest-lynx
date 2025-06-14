export interface OptimizedOrder {
  id: string;
  optimizedOrder: number;
  address: string;
  cliente: string;
  numero: string;
  distanceFromPrevious?: number;
  estimatedTime?: number;
}

export interface OptimizeRouteResponse {
  success: boolean;
  optimizedOrders?: OptimizedOrder[];
  totalDistance?: number;
  totalTime?: number;
  mapUrl?: string;
  error?: string;
}

export interface GoogleMapsDirectionsResponse {
  routes: Array<{
    waypoint_order: number[];
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_address: string;
      end_address: string;
    }>;
    overview_polyline: { points: string };
  }>;
  status: string;
}

export interface DistanceCalculationResponse {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
}

export interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
  formatted_address: string;
  success: boolean;
  error?: string;
}

export interface RouteCalculationResult {
  distance: number;
  duration: number;
  polyline: string;
  legs: Array<{
    distance: number;
    duration: number;
    start_address: string;
    end_address: string;
  }>;
}