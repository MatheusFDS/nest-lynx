import axios from 'axios';

const API_KEY = 'AIzaSyCI6j3093lkPtwImKxNXLT101hp96uTbn0';

export const geocodeAddress = async (address: string) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address,
        key: API_KEY,
      },
    });
    const { data } = response;
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.error('Geocoding error:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
