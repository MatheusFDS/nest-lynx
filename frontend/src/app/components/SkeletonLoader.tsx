// src/components/SkeletonLoader.tsx
import React from 'react';
import { Box, Skeleton, Stack, Card, CardContent, Grid, Fade } from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';

// Animações
const shimmerWave = keyframes`
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const SkeletonContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3),
  animation: `${fadeInUp} 0.6s ease-out`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const ModernSkeleton = styled(Skeleton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.action.hover, 0.3),
  position: 'relative',
  overflow: 'hidden',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: `linear-gradient(
      90deg,
      transparent,
      ${alpha(theme.palette.common.white, 0.2)},
      transparent
    )`,
    transform: 'translateX(-100%)',
    animation: `${shimmerWave} 2s infinite`,
  },

  '&.MuiSkeleton-rectangular': {
    borderRadius: theme.spacing(2),
  },

  '&.MuiSkeleton-circular': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  }
}));

const SkeletonCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(
      45deg,
      transparent,
      ${alpha(theme.palette.primary.main, 0.02)},
      transparent
    )`,
    animation: `${shimmerWave} 3s infinite`,
  }
}));

const StatsSkeletonCard = styled(SkeletonCard)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.1)} 0%, 
    ${alpha(theme.palette.primary.dark, 0.05)} 100%
  )`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

// Diferentes tipos de skeleton
interface SkeletonLoaderProps {
  variant?: 'default' | 'dashboard' | 'table' | 'cards' | 'form' | 'detailed';
  lines?: number;
  showHeader?: boolean;
  showStats?: boolean;
  itemCount?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'default',
  lines = 3,
  showHeader = true,
  showStats = false,
  itemCount = 6
}) => {
  const renderDefaultSkeleton = () => (
    <Stack spacing={2}>
      {showHeader && (
        <ModernSkeleton variant="rectangular" width="60%" height={40} />
      )}
      <ModernSkeleton variant="rectangular" width="100%" height={200} />
      {Array.from({ length: lines }).map((_, index) => (
        <ModernSkeleton
          key={index}
          variant="text"
          width={`${Math.random() * 40 + 40}%`}
          height={20}
          sx={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </Stack>
  );

  const renderDashboardSkeleton = () => (
    <Stack spacing={3}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ModernSkeleton variant="rectangular" width="250px" height={40} />
        <ModernSkeleton variant="rectangular" width="120px" height={36} />
      </Box>

      {/* Stats Cards */}
      {showStats && (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Fade in timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
                <StatsSkeletonCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box sx={{ flexGrow: 1 }}>
                        <ModernSkeleton variant="text" width="80%" height={32} />
                        <ModernSkeleton variant="text" width="60%" height={20} />
                      </Box>
                      <ModernSkeleton variant="circular" width={40} height={40} />
                    </Box>
                  </CardContent>
                </StatsSkeletonCard>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Main Content */}
      <SkeletonCard>
        <CardContent>
          <ModernSkeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} display="flex" alignItems="center" sx={{ gap: 2 }}>
                <ModernSkeleton variant="circular" width={32} height={32} />
                <Box sx={{ flexGrow: 1, ml: 2 }}>
                  <ModernSkeleton variant="text" width="70%" height={20} />
                  <ModernSkeleton variant="text" width="40%" height={16} />
                </Box>
                <ModernSkeleton variant="rectangular" width={80} height={24} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </SkeletonCard>
    </Stack>
  );

  const renderTableSkeleton = () => (
    <SkeletonCard>
      <CardContent>
        {/* Table Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <ModernSkeleton variant="text" width="200px" height={24} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ModernSkeleton variant="rectangular" width={80} height={32} />
            <ModernSkeleton variant="rectangular" width={80} height={32} />
          </Box>
        </Box>

        {/* Table Rows */}
        <Stack spacing={1}>
          {/* Header Row */}
          <Box sx={{ display: 'flex', gap: 2, pb: 1, borderBottom: `1px solid ${alpha('#000', 0.1)}` }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <ModernSkeleton
                key={index}
                variant="text"
                width={`${100 / 5}%`}
                height={20}
              />
            ))}
          </Box>

          {/* Data Rows */}
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <Box key={rowIndex} sx={{ display: 'flex', gap: 2, py: 1 }}>
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <ModernSkeleton
                  key={colIndex}
                  variant="text"
                  width={`${100 / 5}%`}
                  height={16}
                  sx={{ animationDelay: `${(rowIndex * 5 + colIndex) * 50}ms` }}
                />
              ))}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </SkeletonCard>
  );

  const renderCardsSkeleton = () => (
    <Grid container spacing={2}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Fade in timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
            <SkeletonCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <ModernSkeleton variant="text" width="80%" height={24} />
                    <ModernSkeleton variant="text" width="60%" height={16} />
                  </Box>
                  <ModernSkeleton variant="circular" width={32} height={32} />
                </Box>
                
                <ModernSkeleton variant="rectangular" width="100%" height={80} sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ModernSkeleton variant="text" width="40%" height={20} />
                  <ModernSkeleton variant="rectangular" width={60} height={20} />
                </Box>
              </CardContent>
            </SkeletonCard>
          </Fade>
        </Grid>
      ))}
    </Grid>
  );

  const renderFormSkeleton = () => (
    <SkeletonCard>
      <CardContent>
        <ModernSkeleton variant="text" width="50%" height={32} sx={{ mb: 3 }} />
        
        <Stack spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Box key={index}>
              <ModernSkeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
              <ModernSkeleton variant="rectangular" width="100%" height={48} />
            </Box>
          ))}
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <ModernSkeleton variant="rectangular" width={100} height={36} />
            <ModernSkeleton variant="rectangular" width={100} height={36} />
          </Box>
        </Stack>
      </CardContent>
    </SkeletonCard>
  );

  const renderDetailedSkeleton = () => (
    <Stack spacing={3}>
      {/* Header com breadcrumb */}
      <Box>
        <ModernSkeleton variant="text" width="200px" height={16} sx={{ mb: 1 }} />
        <ModernSkeleton variant="text" width="300px" height={40} />
      </Box>

      {/* Filtros */}
      <SkeletonCard>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ModernSkeleton variant="rectangular" width="100%" height={48} />
            </Grid>
            <Grid item xs={12} md={3}>
              <ModernSkeleton variant="rectangular" width="100%" height={48} />
            </Grid>
            <Grid item xs={12} md={3}>
              <ModernSkeleton variant="rectangular" width="100%" height={48} />
            </Grid>
          </Grid>
        </CardContent>
      </SkeletonCard>

      {/* Conteúdo principal */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          {renderCardsSkeleton()}
        </Box>
        
        {/* Sidebar */}
        <Box sx={{ width: '300px', display: { xs: 'none', lg: 'block' } }}>
          <SkeletonCard>
            <CardContent>
              <ModernSkeleton variant="text" width="70%" height={24} sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ModernSkeleton variant="circular" width={24} height={24} />
                    <ModernSkeleton variant="text" width="80%" height={16} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </SkeletonCard>
        </Box>
      </Box>
    </Stack>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'dashboard':
        return renderDashboardSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'cards':
        return renderCardsSkeleton();
      case 'form':
        return renderFormSkeleton();
      case 'detailed':
        return renderDetailedSkeleton();
      default:
        return renderDefaultSkeleton();
    }
  };

  return (
    <SkeletonContainer>
      {renderSkeleton()}
    </SkeletonContainer>
  );
};

export default SkeletonLoader;