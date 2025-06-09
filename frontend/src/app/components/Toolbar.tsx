// src/components/Toolbar.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  Collapse,
  Box,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Menu,
  MenuItem,
  Backdrop,
  Avatar,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MapIcon from '@mui/icons-material/Map';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RouteIcon from '@mui/icons-material/Route';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';

import { usePathname, useRouter } from 'next/navigation';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchCurrentUser, updateUser } from '../../services/userService';
import { User } from '../../types';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const DRAWER_WIDTH = 260;
export const APP_BAR_HEIGHT = 56;

const userProfileSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  newPassword: yup.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres').notRequired().default(''),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'As senhas devem coincidir')
    .when('newPassword', (newPasswordValues, schema) => {
        const newPassword = Array.isArray(newPasswordValues) ? newPasswordValues[0] : newPasswordValues;
        return newPassword && newPassword.length > 0
          ? schema.required('A confirmação da nova senha é obrigatória')
          : schema.notRequired();
      }
    ).default(''),
}).required();

type UserProfileFormData = yup.InferType<typeof userProfileSchema>;

interface NavItemConfig {
  path: string;
  text: string;
  icon: React.ReactElement;
}

interface NavGroupConfig {
    key: string;
    text: string;
    icon: React.ReactElement;
    items: NavItemConfig[];
    adminOnly?: boolean;
    superAdminOnly?: boolean;
}

const Toolbar: React.FC<{ title: string; }> = ({ title }) => {
  const router = useRouter();
  const pathname = usePathname();
  const muiTheme = useTheme();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const { isLoggedIn, userRole, logout, token } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const fetchedUser = await fetchCurrentUser(token);
          setCurrentUser(fetchedUser);
        } catch (error) {
          console.error('Erro ao carregar usuário atual:', error);
        }
      }
    };
    if (isLoggedIn) {
      loadUser();
    } else {
      setCurrentUser(null);
    }
  }, [isLoggedIn, token]);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const handleMenuClick = (menuKey: string) => setOpenMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));
  const handleNavigation = (path: string) => { router.push(path); setDrawerOpen(false); };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setUserMenuAnchorEl(event.currentTarget);
  const handleCloseUserMenu = () => setUserMenuAnchorEl(null);
  const openEditModal = () => { handleCloseUserMenu(); setEditModalOpen(true); };
  const closeEditModal = () => setEditModalOpen(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<UserProfileFormData>({
    resolver: yupResolver(userProfileSchema),
    defaultValues: { name: '', email: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (isEditModalOpen && currentUser) {
      reset({ name: currentUser.name, email: currentUser.email, newPassword: '', confirmPassword: '' });
    }
  }, [isEditModalOpen, currentUser, reset]);

  const onSubmitUserProfile: SubmitHandler<UserProfileFormData> = async (data) => {
    try {
      const payload: Partial<User> = { name: data.name, email: data.email };
      if (data.newPassword) payload.password = data.newPassword;
      if (token && currentUser?.id) {
        const response = await updateUser(token, currentUser.id, payload);
        alert('Perfil atualizado com sucesso!');
        setCurrentUser(response);
        closeEditModal();
      }
    } catch (error) {
      console.error('Erro ao atualizar o perfil:', error);
      alert('Erro ao atualizar o perfil.');
    }
  };

  const menuStructure: NavGroupConfig[] = [
    { key: 'geral', text: 'Geral', icon: <DashboardIcon />, items: [
        { path: '/estatisticas', text: 'Estatísticas', icon: <DashboardIcon /> },
    ]},
    { key: 'roteirizacao', text: 'Roteirização', icon: <RouteIcon />, items: [
        { path: '/roteiros/criar', text: 'Criar Roteiro', icon: <AddCircleOutlineIcon /> },
        { path: '/roteiros', text: 'Consultar Roteiros', icon: <LocalShippingIcon /> },
        { path: '/pedidos', text: 'Consultar Pedidos', icon: <AssignmentIcon /> },
        { path: '/importar', text: 'Importar Dados', icon: <FileUploadIcon /> },
        { path: '/roteiros/liberar', text: 'Liberar Roteiros', icon: <CheckCircleOutlineIcon /> },
    ]},
    { key: 'cadastros', text: 'Cadastros Base', icon: <CategoryIcon />, items: [
        { path: '/motoristas', text: 'Motoristas', icon: <PeopleIcon /> },
        { path: '/veiculos', text: 'Veículos', icon: <DirectionsCarIcon /> },
        { path: '/categorias-veiculo', text: 'Categorias de Veículo', icon: <CategoryIcon /> },
        { path: '/regioes', text: 'Regiões e CEPs', icon: <MapIcon /> },
    ]},
    { key: 'financeiro', text: 'Financeiro', icon: <PaymentIcon />, items: [
        { path: '/pagamentos', text: 'Pagamentos', icon: <PaymentIcon /> },
    ]},
    { key: 'adminTenant', text: 'Admin do Tenant', icon: <SettingsIcon />, adminOnly: true, items: [
        { path: '/tenant-usuarios', text: 'Usuários do Tenant', icon: <PeopleIcon /> },
        { path: '/tenant-config', text: 'Configurações do Tenant', icon: <BusinessIcon /> },
    ]},
    { key: 'superAdmin', text: 'Admin da Plataforma', icon: <SupervisorAccountIcon />, superAdminOnly: true, items: [
        { path: '/plataforma/tenants', text: 'Gerenciar Tenants', icon: <CorporateFareIcon /> },
        { path: '/plataforma/usuarios', text: 'Gerenciar Usuários Globais', icon: <SupervisorAccountIcon /> },
        { path: '/plataforma/roles', text: 'Gerenciar Roles', icon: <LockPersonIcon /> },
    ]},
  ];

  const getCurrentPageName = useCallback(() => {
    for (const group of menuStructure) {
      for (const item of group.items) {
        if (pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path + '/'))) {
          return item.text;
        }
      }
    }
    if (pathname === '/') return 'Início';
    if (pathname.startsWith('/plataforma')) return 'Admin da Plataforma';
    return title;
  }, [pathname, title, menuStructure]);

  const drawerContent = (
    <Box>
      <MuiToolbar sx={{ minHeight: `${APP_BAR_HEIGHT}px !important` }} />
      <Box sx={{ p: 2, borderBottom: `1px solid ${muiTheme.palette.divider}` }}>
        <Typography variant="h6" align="center" color="primary">Menu Principal</Typography>
      </Box>
      <List component="nav" sx={{ padding: '8px' }}>
        {menuStructure.map((group) => {
          if (group.adminOnly && userRole !== 'admin' && userRole !== 'superadmin') return null;
          if (group.superAdminOnly && userRole !== 'superadmin') return null;

          const isRoteirizacaoGroup = group.key === 'roteirizacao';

          return (
            <React.Fragment key={group.key}>
              <ListItemButton onClick={() => handleMenuClick(group.key)} sx={{ margin: '4px 8px', '&:hover': { backgroundColor: muiTheme.palette.action.hover }}}> {/* borderRadius removido */}
                <ListItemIcon sx={{ minWidth: 36, color: muiTheme.palette.text.secondary }}>{group.icon}</ListItemIcon>
                <ListItemText primary={group.text} primaryTypographyProps={{fontSize: '0.9rem', fontWeight: 500, color: muiTheme.palette.text.primary}}/>
                {openMenus[group.key] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
              <Collapse in={openMenus[group.key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 2 }}>
                  {group.items.map((item) => {
                    if (isRoteirizacaoGroup && item.path === '/roteiros/liberar' && userRole !== 'admin' && userRole !== 'superadmin') {
                        return null;
                    }
                    const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path + '/'));
                    return (
                      <ListItemButton
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        selected={isActive}
                        sx={{
                            margin: '2px 4px',
                            pl: 2,
                            backgroundColor: isActive ? muiTheme.palette.action.selected : 'transparent',
                            '&:hover': { backgroundColor: muiTheme.palette.action.hover },
                            // borderRadius removido
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, color: isActive ? muiTheme.palette.primary.main : muiTheme.palette.text.secondary }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} primaryTypographyProps={{fontSize: '0.875rem', fontWeight: isActive ? 600 : 400, color: isActive ? muiTheme.palette.primary.main : muiTheme.palette.text.primary}}/>
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );

  if (!isLoggedIn) return null;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          height: APP_BAR_HEIGHT,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: muiTheme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
          // borderRadius: 0, // AppBar geralmente não tem borderRadius por padrão
        }}
      >
        <MuiToolbar variant="dense" sx={{ height: APP_BAR_HEIGHT, minHeight: `${APP_BAR_HEIGHT}px !important`, paddingLeft: muiTheme.spacing(2), paddingRight: muiTheme.spacing(2) }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 1, color: muiTheme.palette.text.primary, '&:hover': {backgroundColor: muiTheme.palette.action.hover} }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: muiTheme.palette.text.primary, fontSize: '1.05rem', fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip label={getCurrentPageName()} size="small" sx={{ mr: 1.5, backgroundColor: muiTheme.palette.action.hover, color: muiTheme.palette.text.secondary, fontWeight: 500 /* borderRadius: muiTheme.shape.borderRadius  Chip tem seu próprio estilo de borda arredondada, manter se desejado */ }}/>
          <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 1, color: muiTheme.palette.text.primary, '&:hover': {backgroundColor: muiTheme.palette.action.hover} }}>
            {isDarkMode ? <Brightness7Icon fontSize="small"/> : <Brightness4Icon fontSize="small"/>}
          </IconButton>
          {currentUser && (
            <>
              <Button
                color="inherit"
                onClick={handleOpenUserMenu}
                startIcon={<Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: muiTheme.palette.primary.main, color: muiTheme.palette.primary.contrastText }}>{currentUser.name.charAt(0).toUpperCase()}</Avatar>}
                sx={{ textTransform: 'none', color: muiTheme.palette.text.primary, fontWeight: 500, fontSize: '0.875rem', /* borderRadius: '8px', */ '&:hover': {backgroundColor: muiTheme.palette.action.hover} }}
              >
                {currentUser.name.split(' ')[0]}
              </Button>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={Boolean(userMenuAnchorEl)}
                onClose={handleCloseUserMenu}
                PaperProps={{ sx: { 
                    /* borderRadius: '12px', */ mt: 1, minWidth: 180, 
                    boxShadow: muiTheme.shadows[3],
                    backgroundColor: muiTheme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${muiTheme.palette.divider}`
                }}}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={openEditModal} sx={{fontSize: '0.875rem', '&:hover': {backgroundColor: muiTheme.palette.action.hover /* borderRadius: '6px' */}, m: '4px'}}>
                  <EditIcon sx={{ mr: 1.5, fontSize: '1.1rem' }} /> Editar Perfil
                </MenuItem>
                <Divider sx={{ my: '4px' }} />
                <MenuItem
                  onClick={() => { handleCloseUserMenu(); logout(); }}
                  sx={{ color: muiTheme.palette.error.main, fontSize: '0.875rem', '&:hover': {backgroundColor: muiTheme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)' /* borderRadius: '6px' */}, m: '4px' }}
                >
                  <LogoutIcon sx={{ mr: 1.5, fontSize: '1.1rem' }} /> Sair
                </MenuItem>
              </Menu>
            </>
          )}
        </MuiToolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: `1px solid ${muiTheme.palette.divider}`,
            backgroundColor: muiTheme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            top: `${APP_BAR_HEIGHT}px`,
            height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
            // borderRadius: 0, // Drawer paper geralmente não tem borderRadius por padrão
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {drawerOpen && (
        <Backdrop
          open={drawerOpen}
          onClick={toggleDrawer}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer -1,
            top: `${APP_BAR_HEIGHT}px`,
            backgroundColor: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(2px)'
          }}
        />
      )}
      
      <Dialog open={isEditModalOpen} onClose={closeEditModal} maxWidth="xs" fullWidth PaperProps={{sx: { /* borderRadius: '16px' */ }}}>
        <DialogTitle sx={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom: `1px solid ${muiTheme.palette.divider}`}}>
          <Typography variant="h6">Editar Perfil</Typography>
          <IconButton onClick={closeEditModal}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{pt: 2.5}}>
          <form onSubmit={handleSubmit(onSubmitUserProfile)} id="edit-user-profile-form">
            <Controller name="name" control={control} render={({ field }) => ( <TextField {...field} margin="dense" label="Nome" type="text" fullWidth error={!!errors.name} helperText={errors.name?.message || ''} sx={{ mb: 2 }}/> )}/>
            <Controller name="email" control={control} render={({ field }) => ( <TextField {...field} margin="dense" label="E-mail" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message || ''} sx={{ mb: 2 }} /> )}/>
            <Controller name="newPassword" control={control} render={({ field }) => ( <TextField {...field} margin="dense" label="Nova Senha (deixe em branco para não alterar)" type="password" fullWidth error={!!errors.newPassword} helperText={errors.newPassword?.message || ''} sx={{ mb: 2 }} /> )}/>
            <Controller name="confirmPassword" control={control} render={({ field }) => ( <TextField {...field} margin="dense" label="Confirmar Nova Senha" type="password" fullWidth error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message || ''} /> )}/>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${muiTheme.palette.divider}` }}>
          <Button onClick={closeEditModal} variant="outlined" sx={{ /* borderRadius: '8px' */ }}>Cancelar</Button>
          <Button type="submit" form="edit-user-profile-form" variant="contained" sx={{ /* borderRadius: '8px' */ }}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Toolbar;