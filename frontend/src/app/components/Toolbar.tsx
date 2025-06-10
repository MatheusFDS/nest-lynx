// src/components/Toolbar.tsx
'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar as MuiToolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  Route as RouteIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  DirectionsCar as DirectionsCarIcon,
  Map as MapIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  FileUpload as FileUploadIcon,
  Business as BusinessIcon,
  CorporateFare as CorporateFareIcon,
  LockPerson as LockPersonIcon,
  Category,
} from '@mui/icons-material';

import { usePathname, useRouter } from 'next/navigation';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// ========================================
// CONSTANTS & TYPES
// ========================================

const DRAWER_WIDTH = 280;
export const APP_BAR_HEIGHT = 64;

interface MenuItem {
  path: string;
  text: string;
  icon: React.ReactElement;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  badge?: number;
}

// ========================================
// MENU DATA - SIMPLIFIED
// ========================================

const menuItems: MenuItem[] = [
  { path: '/estatisticas', text: 'Estatísticas', icon: <DashboardIcon /> },
  { path: '/roteiros/criar', text: 'Criar Roteiro', icon: <AddCircleOutlineIcon /> },
  { path: '/roteiros', text: 'Consultar Roteiros', icon: <LocalShippingIcon /> },
  { path: '/pedidos', text: 'Consultar Pedidos', icon: <AssignmentIcon /> },
  { path: '/importar', text: 'Importar Dados', icon: <FileUploadIcon /> },
  { path: '/roteiros/liberar', text: 'Liberar Roteiros', icon: <CheckCircleOutlineIcon />, adminOnly: true, badge: 5 },
  { path: '/motoristas', text: 'Motoristas', icon: <PeopleIcon /> },
  { path: '/veiculos', text: 'Veículos', icon: <DirectionsCarIcon /> },
  { path: '/categorias-veiculo', text: 'Categorias de Veículo', icon: <Category /> },
  { path: '/regioes', text: 'Regiões e CEPs', icon: <MapIcon /> },
  { path: '/pagamentos', text: 'Pagamentos', icon: <PaymentIcon />, badge: 3 },
  { path: '/tenant-usuarios', text: 'Usuários do Tenant', icon: <PeopleIcon />, adminOnly: true },
  { path: '/tenant-config', text: 'Configurações do Tenant', icon: <BusinessIcon />, adminOnly: true },
  { path: '/plataforma/tenants', text: 'Gerenciar Tenants', icon: <CorporateFareIcon />, superAdminOnly: true },
  { path: '/plataforma/usuarios', text: 'Gerenciar Usuários', icon: <SupervisorAccountIcon />, superAdminOnly: true },
  { path: '/plataforma/roles', text: 'Gerenciar Roles', icon: <LockPersonIcon />, superAdminOnly: true },
];

// ========================================
// MAIN COMPONENT
// ========================================

const Toolbar: React.FC<{ title: string }> = ({ title }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const { isLoggedIn, userRole, user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleNavigation = (path: string) => {
    router.push(path);
    setDrawerOpen(false);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  // ========================================
  // FILTER MENU ITEMS BY ROLE
  // ========================================
  
  const visibleMenuItems = menuItems.filter(item => {
    if (item.adminOnly && userRole !== 'admin' && userRole !== 'superadmin') return false;
    if (item.superAdminOnly && userRole !== 'superadmin') return false;
    return true;
  });

  // ========================================
  // RENDER
  // ========================================
  
  if (!isLoggedIn) return null;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* APP BAR */}
      <AppBar 
        position="fixed" 
        sx={{ 
          height: APP_BAR_HEIGHT,
          zIndex: theme => theme.zIndex.drawer + 1,
        }}
      >
        <MuiToolbar sx={{ 
          height: APP_BAR_HEIGHT,
          minHeight: `${APP_BAR_HEIGHT}px !important`,
          justifyContent: 'space-between',
        }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              color="inherit" 
              onClick={() => setDrawerOpen(!drawerOpen)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <Badge badgeContent={3} color="error">
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
            </Badge>

            {user && (
              <Button
                color="inherit"
                onClick={handleUserMenuOpen}
                startIcon={
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user.name.charAt(0)}
                  </Avatar>
                }
                sx={{ textTransform: 'none' }}
              >
                {user.name.split(' ')[0]}
              </Button>
            )}
          </Box>
        </MuiToolbar>
      </AppBar>

      {/* DRAWER */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            top: APP_BAR_HEIGHT,
            height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
          },
        }}
      >
        <List sx={{ pt: 2 }}>
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            
            return (
              <ListItemButton
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{ mx: 1, mb: 0.5, borderRadius: 2 }}
              >
                <ListItemIcon>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      {/* USER MENU */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleUserMenuClose}>
          <EditIcon sx={{ mr: 1 }} /> Editar Perfil
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 1 }} /> Sair
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Toolbar;