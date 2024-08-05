// src/components/SkeletonLoader.tsx
import React from 'react';
import { Box, Skeleton } from '@mui/material';

const SkeletonLoader: React.FC = () => {
  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Skeleton variant="rectangular" width="100%" height={60} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ marginTop: 2 }} />
    </Box>
  );
};

export default SkeletonLoader;
