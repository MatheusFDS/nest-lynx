// components/MissionVisionValues.tsx
'use client';

import React from 'react';
import { Paper, Typography } from '@mui/material';

const MissionVisionValues: React.FC = () => (
  <Paper
    elevation={3}
    sx={{
      p: { xs: 3, md: 4 },
      borderRadius: 2,
      backgroundColor: 'background.paper',
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
      Missão
    </Typography>
    <Typography variant="body1" sx={{ textAlign: 'center', mb: 3 }}>
      Otimizar processos logísticos com tecnologia e eficiência.
    </Typography>

    <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
      Visão
    </Typography>
    <Typography variant="body1" sx={{ textAlign: 'center', mb: 3 }}>
      Ser líder em soluções logísticas inteligentes e inovadoras.
    </Typography>

    <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
      Valores
    </Typography>
    <Typography variant="body1" sx={{ textAlign: 'center' }}>
      Inovação, excelência e sustentabilidade.
    </Typography>
  </Paper>
);

export default MissionVisionValues;
