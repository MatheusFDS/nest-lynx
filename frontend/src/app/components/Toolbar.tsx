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
  ListItem,
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
import ReleaseIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

import { usePathname, useRouter } from 'next/navigation';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchCurrentUser, updateUser } from '../../services/userService';
import { User } from '../../types';

// Importações para React Hook Form e Yup
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface ToolbarProps {
  title: string;
}

const drawerWidth = 280;

// Definição do esquema de validação com Yup
const schema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  newPassword: yup
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .notRequired(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'As senhas devem coincidir')
    .when('newPassword', (newPassword, schema) => {
      return newPassword
        ? schema.required('Confirmação de senha é obrigatória')
        : schema.notRequired();
    }),
}).required();

type FormData = yup.InferType<typeof schema>;

const Toolbar: React.FC<ToolbarProps> = ({ title }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const { isLoggedIn, userRole, logout, token } = useAuth();

  // Controle do Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Seções colapsáveis
  const [openConfig, setOpenConfig] = useState(false);
  const [openCadastros, setOpenCadastros] = useState(false);
  const [openRotinas, setOpenRotinas] = useState(false);

  // Estado do modal de edição do usuário
  const [user, setUser] = useState<User | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  // Menu ancorado (para o nome do usuário)
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);

  /**
   * Carrega os dados do usuário, se logado
   */
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const currentUser = await fetchCurrentUser(token);
          setUser(currentUser);
        } catch (error: any) {
          console.error('Erro ao carregar usuário atual:', error);
        }
      }
    };
    if (isLoggedIn) {
      loadUser();
    }
  }, [isLoggedIn, token]);

  /**
   * Funções de abrir/fechar Drawer e colapsáveis
   */
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const toggleConfigMenu = () => setOpenConfig((prev) => !prev);
  const toggleCadastrosMenu = () => setOpenCadastros((prev) => !prev);
  const toggleRotinasMenu = () => setOpenRotinas((prev) => !prev);

  /**
   * Navegar para outra rota
   */
  const handleNavigation = (path: string) => {
    router.push(path);
    setDrawerOpen(false); // Fecha o drawer ao navegar
  };

  /**
   * Menu do usuário (nome clicável)
   */
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setUserMenuAnchorEl(null);
  };

  const openEditModal = () => {
    handleCloseUserMenu();
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  /**
   * Configuração do React Hook Form
   */
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  /**
   * Quando o modal abrir, preencha o formulário com os dados do usuário
   */
  useEffect(() => {
    if (isEditModalOpen && user) {
      reset({
        name: user.name,
        email: user.email,
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [isEditModalOpen, user, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const updatedUser: Partial<User> = {
        name: data.name,
        email: data.email,
        ...(data.newPassword ? { password: data.newPassword } : {}),
      };
      if (token && user?.id) {
        const response = await updateUser(token, user.id, updatedUser);
        alert('Usuário atualizado com sucesso!');
        setUser(response);
        closeEditModal();
      }
    } catch (error: any) {
      console.error('Erro ao atualizar o usuário:', error);
      alert('Erro ao atualizar o usuário.');
    }
  };

  /**
   * Título de rota conforme path
   */
  const getCurrentPageName = () => {
    const route = pathname.split('/').pop();
    switch (route) {
      case 'users':
        return 'Usuários';
      case 'tenant':
        return 'Empresa';
      case 'categories':
        return 'Categorias';
      case 'drivers':
        return 'Motoristas';
      case 'vehicles':
        return 'Veículos';
      case 'directions':
        return 'Região';
      case 'deliveries':
        return 'Roteiros';
      case 'routing':
        return 'Formação';
      case 'orders':
        return 'Entregas';
      case 'payments':
        return 'Pagamentos';
      case 'releases':
        return 'Liberação';
      case 'statistics':
        return 'Dashboards';
      default:
        return 'Página Inicial';
    }
  };

  /**
   * Função para fechar o Drawer ao clicar na sobreposição
   */
  const handleBackdropClick = () => {
    setDrawerOpen(false);
  };

  const MenuItemWithIcon = ({ icon, text, onClick, isActive = false }: {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
    isActive?: boolean;
  }) => (
    <ListItem
      button
      onClick={onClick}
      sx={{
        borderRadius: '12px',
        margin: '4px 8px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: isActive ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
        '&:hover': {
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          transform: 'translateX(4px)',
        },
      }}
    >
      <ListItemIcon
        sx={{
          color: isActive ? 'primary.main' : 'text.secondary',
          minWidth: '40px',
          transition: 'color 0.3s ease',
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={text}
        sx={{
          '& .MuiListItemText-primary': {
            color: isActive ? 'primary.main' : 'text.primary',
            fontWeight: isActive ? 600 : 400,
            fontSize: '0.875rem',
          },
        }}
      />
    </ListItem>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Barra Superior Moderna */}
      <AppBar
        position="fixed"
        sx={{
          height: 64,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'rgba(15, 23, 42, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          boxShadow: (theme) => 
            theme.palette.mode === 'dark'
              ? '0 1px 3px rgba(0, 0, 0, 0.3)'
              : '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: (theme) => 
            theme.palette.mode === 'dark'
              ? '1px solid rgba(148, 163, 184, 0.2)'
              : '1px solid rgba(30, 41, 59, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <MuiToolbar
          sx={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
          }}
        >
          {/* Ícone de menu hambúrguer moderno */}
          <IconButton
            color="inherit"
            onClick={toggleDrawer}
            sx={{
              mr: 2,
              borderRadius: '12px',
              padding: '8px',
              color: (theme) => theme.palette.text.primary,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? 'rgba(102, 126, 234, 0.15)' 
                    : 'rgba(102, 126, 234, 0.1)',
                transform: 'rotate(90deg)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Título com gradiente */}
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
          >
            {title}
          </Typography>

          {/* Chip da página atual */}
          <Chip
            label={getCurrentPageName()}
            size="small"
            sx={{
              mr: 2,
              backgroundColor: 'rgba(102, 126, 234, 0.2)',
              color: 'primary.main',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          />

          {/* Botão de tema com animação */}
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              mr: 2,
              borderRadius: '12px',
              color: (theme) => theme.palette.text.primary,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? 'rgba(102, 126, 234, 0.15)' 
                    : 'rgba(102, 126, 234, 0.1)',
                transform: 'scale(1.1)',
              },
            }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* Perfil do usuário */}
          {isLoggedIn && user && (
            <>
              <Button
                color="inherit"
                onClick={handleOpenUserMenu}
                startIcon={
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                }
                sx={{
                  borderRadius: '12px',
                  padding: '8px 16px',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: (theme) => theme.palette.text.primary,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? 'rgba(102, 126, 234, 0.15)' 
                        : 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              >
                {user.name}
              </Button>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={Boolean(userMenuAnchorEl)}
                onClose={handleCloseUserMenu}
                PaperProps={{
                  sx: {
                    borderRadius: '12px',
                    minWidth: 200,
                    background: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? 'rgba(15, 23, 42, 0.95)' 
                        : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: (theme) => 
                      theme.palette.mode === 'dark'
                        ? '1px solid rgba(148, 163, 184, 0.2)'
                        : '1px solid rgba(30, 41, 59, 0.1)',
                    mt: 1,
                  },
                }}
              >
                <MenuItem
                  onClick={openEditModal}
                  sx={{
                    borderRadius: '8px',
                    margin: '4px',
                    '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' },
                  }}
                >
                  <EditIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                  Editar Perfil
                </MenuItem>
                <Divider sx={{ 
                  margin: '4px 0', 
                  borderColor: (theme) => 
                    theme.palette.mode === 'dark'
                      ? 'rgba(148, 163, 184, 0.2)'
                      : 'rgba(30, 41, 59, 0.1)'
                }} />
                <MenuItem
                  onClick={() => {
                    handleCloseUserMenu();
                    logout();
                  }}
                  sx={{
                    borderRadius: '8px',
                    margin: '4px',
                    color: 'error.main',
                    '&:hover': { backgroundColor: 'rgba(248, 113, 113, 0.1)' },
                  }}
                >
                  <LogoutIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                  Sair
                </MenuItem>
              </Menu>
            </>
          )}
        </MuiToolbar>
      </AppBar>

      {/* Drawer Lateral Moderno */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            top: 64,
            background: (theme) => 
              theme.palette.mode === 'dark' 
                ? 'rgba(15, 23, 42, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            borderRight: (theme) => 
              theme.palette.mode === 'dark'
                ? '1px solid rgba(148, 163, 184, 0.2)'
                : '1px solid rgba(30, 41, 59, 0.1)',
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: (theme) => 
          theme.palette.mode === 'dark'
            ? '1px solid rgba(148, 163, 184, 0.2)'
            : '1px solid rgba(30, 41, 59, 0.1)'
        }}>
          <Typography
            variant="h6"
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Menu Principal
          </Typography>
        </Box>

        <List sx={{ padding: '8px' }}>
          {/* Configurações (admin) */}
          {userRole === 'admin' && (
            <>
              <ListItem
                button
                onClick={toggleConfigMenu}
                sx={{
                  borderRadius: '12px',
                  margin: '4px 8px',
                  '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' },
                }}
              >
                <ListItemIcon sx={{ color: 'text.secondary', minWidth: '40px' }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Configurações"
                  sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: 500 } }}
                />
                {openConfig ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              <Collapse in={openConfig} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ ml: 2 }}>
                  <MenuItemWithIcon
                    icon={<PeopleIcon />}
                    text="Usuários"
                    onClick={() => handleNavigation('/users')}
                    isActive={pathname === '/users'}
                  />
                  <MenuItemWithIcon
                    icon={<BusinessIcon />}
                    text="Empresa"
                    onClick={() => handleNavigation('/tenant')}
                    isActive={pathname === '/tenant'}
                  />
                </List>
              </Collapse>
            </>
          )}

          {/* Cadastros */}
          <ListItem
            button
            onClick={toggleCadastrosMenu}
            sx={{
              borderRadius: '12px',
              margin: '4px 8px',
              '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' },
            }}
          >
            <ListItemIcon sx={{ color: 'text.secondary', minWidth: '40px' }}>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText
              primary="Cadastros"
              sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: 500 } }}
            />
            {openCadastros ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>
          <Collapse in={openCadastros} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ ml: 2 }}>
              <MenuItemWithIcon
                icon={<CategoryIcon />}
                text="Categorias"
                onClick={() => handleNavigation('/categories')}
                isActive={pathname === '/categories'}
              />
              <MenuItemWithIcon
                icon={<PeopleIcon />}
                text="Motoristas"
                onClick={() => handleNavigation('/drivers')}
                isActive={pathname === '/drivers'}
              />
              <MenuItemWithIcon
                icon={<DirectionsCarIcon />}
                text="Veículos"
                onClick={() => handleNavigation('/vehicles')}
                isActive={pathname === '/vehicles'}
              />
              <MenuItemWithIcon
                icon={<MapIcon />}
                text="Direções"
                onClick={() => handleNavigation('/directions')}
                isActive={pathname === '/directions'}
              />
            </List>
          </Collapse>

          {/* Rotinas */}
          <ListItem
            button
            onClick={toggleRotinasMenu}
            sx={{
              borderRadius: '12px',
              margin: '4px 8px',
              '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' },
            }}
          >
            <ListItemIcon sx={{ color: 'text.secondary', minWidth: '40px' }}>
              <RouteIcon />
            </ListItemIcon>
            <ListItemText
              primary="Rotinas"
              sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: 500 } }}
            />
            {openRotinas ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>
          <Collapse in={openRotinas} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ ml: 2 }}>
              <MenuItemWithIcon
                icon={<DashboardIcon />}
                text="Dashboards"
                onClick={() => handleNavigation('/statistics')}
                isActive={pathname === '/statistics'}
              />
              <MenuItemWithIcon
                icon={<AssignmentIcon />}
                text="Entregas"
                onClick={() => handleNavigation('/orders')}
                isActive={pathname === '/orders'}
              />
              <MenuItemWithIcon
                icon={<RouteIcon />}
                text="Formação"
                onClick={() => handleNavigation('/routing')}
                isActive={pathname === '/routing'}
              />
              {userRole === 'admin' && (
                <MenuItemWithIcon
                  icon={<ReleaseIcon />}
                  text="Liberação"
                  onClick={() => handleNavigation('/releases')}
                  isActive={pathname === '/releases'}
                />
              )}
              <MenuItemWithIcon
                icon={<LocalShippingIcon />}
                text="Roteiros"
                onClick={() => handleNavigation('/deliveries')}
                isActive={pathname === '/deliveries'}
              />
              <MenuItemWithIcon
                icon={<PaymentIcon />}
                text="Pagamentos"
                onClick={() => handleNavigation('/payments')}
                isActive={pathname === '/payments'}
              />
            </List>
          </Collapse>
        </List>
      </Drawer>

      {/* Backdrop moderno */}
      {drawerOpen && (
        <Backdrop
          open={drawerOpen}
          onClick={handleBackdropClick}
          sx={{
            position: 'fixed',
            top: 64,
            left: 0,
            zIndex: (theme) => theme.zIndex.drawer - 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)`,
          marginLeft: drawerOpen ? `${drawerWidth}px` : 0,
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <MuiToolbar sx={{ minHeight: 64 }} />
      </Box>

      {/* Modal de Edição Moderno */}
      <Dialog
        open={isEditModalOpen}
        onClose={closeEditModal}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: (theme) => 
              theme.palette.mode === 'dark' 
                ? 'rgba(15, 23, 42, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: (theme) => 
              theme.palette.mode === 'dark'
                ? '1px solid rgba(148, 163, 184, 0.2)'
                : '1px solid rgba(30, 41, 59, 0.1)',
            minWidth: 400,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            Editar Perfil
          </Typography>
          <IconButton
            onClick={closeEditModal}
            sx={{
              borderRadius: '8px',
              '&:hover': { backgroundColor: 'rgba(248, 113, 113, 0.1)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)} id="edit-user-form">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  label="Nome"
                  type="text"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name ? errors.name.message : ''}
                  sx={{ mb: 2 }}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  label="E-mail"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email ? errors.email.message : ''}
                  sx={{ mb: 2 }}
                />
              )}
            />
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  label="Nova Senha"
                  type="password"
                  fullWidth
                  error={!!errors.newPassword}
                  helperText={errors.newPassword ? errors.newPassword.message : ''}
                  sx={{ mb: 2 }}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  label="Confirmar Nova Senha"
                  type="password"
                  fullWidth
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword ? errors.confirmPassword.message : ''}
                />
              )}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={closeEditModal}
            variant="outlined"
            sx={{ borderRadius: '12px', mr: 2 }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-user-form"
            variant="contained"
            sx={{ borderRadius: '12px' }}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Toolbar;