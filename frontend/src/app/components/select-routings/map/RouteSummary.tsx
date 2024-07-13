import React from 'react';
import { Box, Typography } from '@mui/material';

interface RouteSummaryProps {
  totalWeight: number;
  totalValue: number;
  freightValue: number;
  distance: string | null;
}

const RouteSummary: React.FC<RouteSummaryProps> = ({ totalWeight, totalValue, freightValue, distance }) => (
  <Box display="flex" flexDirection="row" gap={1} mb={1}>
    <Typography variant="body2" style={{ fontSize: '0.75em' }}>Total Peso: {totalWeight.toFixed(2)} kg</Typography>
    <Typography variant="body2" style={{ fontSize: '0.75em' }}>Total Valor: R$ {totalValue.toFixed(2)}</Typography>
    <Typography variant="body2" style={{ fontSize: '0.75em' }}>Valor do Frete: R$ {freightValue.toFixed(2)}</Typography>
    {distance && <Typography variant="body2" style={{ fontSize: '0.75em' }}>Distância Total: {distance}</Typography>}
  </Box>
);

export default RouteSummary;
