import React from 'react';
import { Box, Typography } from '@mui/material';

interface RouteSummaryProps {
  totalWeight: number;
  totalValue: number;
  freightValue: number;
  distance: string | null;
  duration: string | null; // Adicionando a duração
}

const RouteSummary: React.FC<RouteSummaryProps> = ({ totalWeight, totalValue, freightValue, distance, duration }) => (
  <Box display="flex" flexDirection="row" gap={1} mb={1}>
    <Typography variant="body2" style={{ fontSize: '0.70em' }}>T. Peso: {totalWeight.toFixed(2)} kg</Typography>
    <Typography variant="body2" style={{ fontSize: '0.70em' }}>T. Valor: {totalValue.toFixed(2)}</Typography>
    <Typography variant="body2" style={{ fontSize: '0.70em' }}>V. Frete: {freightValue.toFixed(2)}</Typography>
    {distance && <Typography variant="body2" style={{ fontSize: '0.70em' }}>Distância: {distance}</Typography>}
    {duration && <Typography variant="body2" style={{ fontSize: '0.70em' }}>Duração: {duration}</Typography>}
  </Box>
);

export default RouteSummary;
