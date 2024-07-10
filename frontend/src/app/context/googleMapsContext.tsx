import React, { createContext, useContext, ReactNode } from 'react';
import { LoadScript, Libraries } from '@react-google-maps/api';

const GoogleMapsContext = createContext({});

const libraries: Libraries = ['places', 'geometry'];

export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <LoadScript googleMapsApiKey="AIzaSyCI6j3093lkPtwImKxNXLT101hp96uTbn0" libraries={libraries}>
      {children}
    </LoadScript>
  );
};

export const useGoogleMaps = () => {
  return useContext(GoogleMapsContext);
};
