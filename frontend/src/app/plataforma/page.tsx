// app/platform-admin-dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // Ajuste o caminho se necessário
import { Container, Typography, Box, CircularProgress, Paper, Tabs, Tab } from '@mui/material';

import TenantManager from '../components/platform/TenantManager'; // Ajuste o caminho
import UserManager from '../components/platform/UserManager';   // Ajuste o caminho
import RoleManager from '../components/platform/RoleManager';     // Ajuste o caminho

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`platform-admin-tabpanel-${index}`}
      aria-labelledby={`platform-admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `platform-admin-tab-${index}`,
    'aria-controls': `platform-admin-tabpanel-${index}`,
  };
}

const PlatformAdminDashboardPage: React.FC = () => {
  const { isLoggedIn, userRole, token } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!token && !isLoggedIn) { // Considera o estado inicial antes do AuthContext carregar
      router.push('/login');
    } else if (isLoggedIn && userRole && userRole !== 'superadmin') {
      router.push('/statistics'); // Ou uma página de não autorizado
    }
  }, [isLoggedIn, userRole, token, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!isLoggedIn || userRole !== 'superadmin') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}> {/* MaxWidth 'xl' para mais espaço */}
      <Typography variant="h4" component="h1" gutterBottom>
        Painel de Administração da Plataforma
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
        Bem-vindo, Super Admin! Selecione uma seção abaixo para gerenciar.
      </Typography>

      <Paper elevation={2} sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="abas de administração da plataforma"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Gerenciar Tenants" {...a11yProps(0)} />
            <Tab label="Gerenciar Usuários" {...a11yProps(1)} />
            <Tab label="Gerenciar Roles" {...a11yProps(2)} />
            {/* Adicione mais abas para outras funcionalidades se necessário */}
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <TenantManager />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <UserManager />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <RoleManager />
        </TabPanel>
        {/* Adicione mais TabPanels correspondentes às novas abas */}
      </Paper>
    </Container>
  );
};

export default PlatformAdminDashboardPage;