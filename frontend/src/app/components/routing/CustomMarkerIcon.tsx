import React from 'react';
import { SvgIcon, SvgIconOwnProps } from '@mui/material';
import { CommonProps } from '@mui/material/OverridableComponent';

const CustomMarkerIcon = (props: React.JSX.IntrinsicAttributes & { component: React.ElementType<any, keyof React.JSX.IntrinsicElements>; } & SvgIconOwnProps & CommonProps & Omit<any, "className" | "style" | "classes" | "children" | "color" | "fontSize" | "htmlColor" | "inheritViewBox" | "shapeRendering" | "sx" | "titleAccess" | "viewBox">) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="12" r="10" fill="red" />
  </SvgIcon>
);

export default CustomMarkerIcon;
