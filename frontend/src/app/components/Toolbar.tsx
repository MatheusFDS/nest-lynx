// src/components/Toolbar.tsx

'use client';

import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar as MuiToolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

const drawerWidth = 240;

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
          // Opcional: Adicione lógica para lidar com erros, como redirecionar para login
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
        return 'Direções';
      case 'deliveries':
        return 'Entregas';
      case 'routing':
        return 'Triagem';
      case 'orders':
        return 'Documentos';
      case 'payments':
        return 'Pagamentos';
      case 'releases':
        return 'Liberações';
      case 'statistics':
        return 'Dados';
      default:
        return 'Página Inicial';
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Barra Superior minimalista */}
      <AppBar
        position="fixed"
        sx={{
          // Deixe a barra mais fina
          minHeight: 48,
          height: 48,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: `100%`, // Ajustado para 100%
          // Removido marginLeft para que a barra fique sempre no topo
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <MuiToolbar
          variant="dense" // Deixa a Toolbar mais compacta
          sx={{
            minHeight: 48,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Ícone de menu para abrir/fechar Drawer */}
          <IconButton color="inherit" onClick={toggleDrawer} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>

          {/* Título da Aplicação + Rota Atual */}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {title} - {getCurrentPageName()}
          </Typography>

          {/* Botão de alternar tema */}
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* Nome do usuário, se logado */}
          {isLoggedIn && user && (
            <>
              <Button color="inherit" onClick={handleOpenUserMenu}>
                {user.name}
              </Button>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={Boolean(userMenuAnchorEl)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={openEditModal}>Editar</MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseUserMenu();
                    logout();
                  }}
                >
                  Sair
                </MenuItem>
              </Menu>
            </>
          )}
        </MuiToolbar>
      </AppBar>

      {/* Drawer Lateral */}
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
            top: 48, // Ajusta para ficar abaixo da AppBar
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Você pode adicionar conteúdo aqui, como logo ou informações adicionais */}
        </Box>
        <List>
          {/* Configurações (admin) */}
          {userRole === 'admin' && (
            <>
              <ListItem button onClick={toggleConfigMenu}>
                <ListItemText primary="Configurações" />
                {openConfig ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              <Collapse in={openConfig} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem button onClick={() => handleNavigation('/users')}>
                    <ListItemText primary="Usuários" />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigation('/tenant')}>
                    <ListItemText primary="Empresa" />
                  </ListItem>
                </List>
              </Collapse>
            </>
          )}

          {/* Cadastros */}
          <ListItem button onClick={toggleCadastrosMenu}>
            <ListItemText primary="Cadastros" />
            {openCadastros ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>
          <Collapse in={openCadastros} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button onClick={() => handleNavigation('/categories')}>
                <ListItemText primary="Categorias" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/drivers')}>
                <ListItemText primary="Motoristas" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/vehicles')}>
                <ListItemText primary="Veículos" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/directions')}>
                <ListItemText primary="Direções" />
              </ListItem>
            </List>
          </Collapse>

          {/* Rotinas */}
          <ListItem button onClick={toggleRotinasMenu}>
            <ListItemText primary="Rotinas" />
            {openRotinas ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>
          <Collapse in={openRotinas} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button onClick={() => handleNavigation('/statistics')}>
                <ListItemText primary="Dados" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/deliveries')}>
                <ListItemText primary="Entregas" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/routing')}>
                <ListItemText primary="Triagem" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/orders')}>
                <ListItemText primary="Documentos" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/payments')}>
                <ListItemText primary="Pagamentos" />
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Drawer>

      {/* Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)`,
          marginLeft: drawerOpen ? `${drawerWidth}px` : 0,
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        {/* Ajuste para compensar a altura da AppBar */}
        <MuiToolbar variant="dense" />
        {/* Aqui entra o conteúdo das páginas */}
      </Box>

      {/* Modal de Edição de Usuário */}
      <Dialog open={isEditModalOpen} onClose={closeEditModal}>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button color="secondary" onClick={closeEditModal}>
            Cancelar
          </Button>
          <Button color="primary" type="submit" form="edit-user-form">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Toolbar;
