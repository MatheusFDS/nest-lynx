import axios from 'axios';

const accessToken = 'pk.eyJ1IjoibWF0aGV1c2ZkcyIsImEiOiJjbHlpdHB3dDYwamZuMmtvZnVjdTNzbjI3In0.hVf9wJoZ_7mRM_iy09cdWg';

export const geocodeAddress = async (address: string) => {
  try {
    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
      params: {
        access_token: accessToken,
      },
    });
    const { data } = response;
    if (data.features && data.features.length > 0) {
      const { center } = data.features[0];
      return { lat: center[1], lng: center[0] };
    } else {
      console.error('Geocoding error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
