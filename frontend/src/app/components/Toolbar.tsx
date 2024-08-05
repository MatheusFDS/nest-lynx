// components/Toolbar.tsx
'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar as MuiToolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Hidden,
  Grid,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Collapse,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface ToolbarProps {
  title: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ title }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isLoggedIn, userRole, logout } = useAuth();
  const [openConfig, setOpenConfig] = useState(false);
  const [openCadastros, setOpenCadastros] = useState(false);
  const [openRotinas, setOpenRotinas] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    handleClose();
    router.push(path);
  };

  const handleLogout = () => {
    logout();
  };

  const toggleConfig = () => {
    setOpenConfig(!openConfig);
  };

  const toggleCadastros = () => {
    setOpenCadastros(!openCadastros);
  };

  const toggleRotinas = () => {
    setOpenRotinas(!openRotinas);
  };

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
        return 'Gerar Rotas';
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
    <AppBar position="static" sx={{ height: '64px' }}>
      <MuiToolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title} - {getCurrentPageName()}
        </Typography>
        <IconButton color="inherit" onClick={toggleTheme}>
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {isLoggedIn && (
          <>
            <Hidden smUp>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenu}>
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <List>
                  <ListItem button onClick={toggleConfig}>
                    <ListItemText primary="Configurações" />
                    {openConfig ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItem>
                  <Collapse in={openConfig} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <MenuItem onClick={() => handleNavigation('/users')}>Usuários</MenuItem>
                      <MenuItem onClick={() => handleNavigation('/tenant')}>Empresa</MenuItem>
                    </List>
                  </Collapse>
                  <ListItem button onClick={toggleCadastros}>
                    <ListItemText primary="Cadastros" />
                    {openCadastros ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItem>
                  <Collapse in={openCadastros} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <MenuItem onClick={() => handleNavigation('/categories')}>Categorias</MenuItem>
                      <MenuItem onClick={() => handleNavigation('/drivers')}>Motoristas</MenuItem>
                      <MenuItem onClick={() => handleNavigation('/vehicles')}>Veículos</MenuItem>
                      <MenuItem onClick={() => handleNavigation('/directions')}>Direções</MenuItem>
                    </List>
                  </Collapse>
                  <ListItem button onClick={toggleRotinas}>
                    <ListItemText primary="Rotinas" />
                    {openRotinas ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItem>
                  <Collapse in={openRotinas} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <MenuItem onClick={() => handleNavigation('/deliveries')}>Entregas</MenuItem>
                      <MenuItem onClick={() => handleNavigation('/routing')}>Triagem</MenuItem>
                      <MenuItem onClick={() => handleNavigation('/orders')}>Documentos</MenuItem>
                      <MenuItem onClick={() => handleNavigation('/payments')}>Pagamentos</MenuItem>
                    </List>
                  </Collapse>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </List>
              </Menu>
            </Hidden>
            <Hidden smDown>
              <Grid container spacing={4} justifyContent="flex-end">
                <Grid item>
                  <Box
                    onMouseEnter={() => setOpenRotinas(true)}
                    onMouseLeave={() => setOpenRotinas(false)}
                    sx={{ position: 'relative' }}
                  >
                    <Button color="inherit">
                      Rotinas Gerais {openRotinas ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Button>
                    <Box
                      position="absolute"
                      top="100%"
                      left="0"
                      right="0"
                      bgcolor={theme.palette.background.paper}
                      color={theme.palette.text.primary}
                      zIndex="tooltip"
                      display={openRotinas ? 'block' : 'none'}
                      p={1}
                      borderRadius={1}
                    >
                      <Button color="inherit" onClick={() => handleNavigation('/statistics')}>
                        Dados
                      </Button>
                      <Button color="inherit" onClick={() => handleNavigation('/routing')}>
                        Triagem
                      </Button>
                      <Button color="inherit" onClick={() => handleNavigation('/deliveries')}>
                        Entregas
                      </Button>
                      <Button color="inherit" onClick={() => handleNavigation('/orders')}>
                        Documentos
                      </Button>
                      <Button color="inherit" onClick={() => handleNavigation('/payments')}>
                        Pagamentos
                      </Button>
                      {userRole === 'admin' && (
                        <Button color="inherit" onClick={() => handleNavigation('/releases')}>
                          Liberações
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item>
                  <Box
                    onMouseEnter={() => setOpenCadastros(true)}
                    onMouseLeave={() => setOpenCadastros(false)}
                    sx={{ position: 'relative' }}
                  >
                    <Button color="inherit">
                      Cadastros {openCadastros ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Button>
                    <Box
                      position="absolute"
                      top="100%"
                      left="0"
                      right="0"
                      bgcolor={theme.palette.background.paper}
                      color={theme.palette.text.primary}
                      zIndex="tooltip"
                      display={openCadastros ? 'block' : 'none'}
                      p={1}
                      borderRadius={1}
                    >
                      <Button color="inherit" onClick={() => handleNavigation('/categories')}>
                        Categorias
                      </Button>
                      <Button color="inherit" onClick={() => handleNavigation('/drivers')}>
                        Motoristas
                      </Button>
                      <Button color="inherit" onClick={() => handleNavigation('/vehicles')}>
                        Veículos
                      </Button>
                      <Button color="inherit" onClick={() => handleNavigation('/directions')}>
                        Direções
                      </Button>
                    </Box>
                  </Box>
                </Grid>
                {userRole === 'admin' && (
                  <Grid item>
                    <Box
                      onMouseEnter={() => setOpenConfig(true)}
                      onMouseLeave={() => setOpenConfig(false)}
                      sx={{ position: 'relative' }}
                    >
                      <Button color="inherit">
                        Configurações {openConfig ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Button>
                      <Box
                        position="absolute"
                        top="100%"
                        left="0"
                        right="0"
                        bgcolor={theme.palette.background.paper}
                        color={theme.palette.text.primary}
                        zIndex="tooltip"
                        display={openConfig ? 'block' : 'none'}
                        p={1}
                        borderRadius={1}
                      >
                        <Button color="inherit" onClick={() => handleNavigation('/users')}>
                          Usuários
                        </Button>
                        <Button color="inherit" onClick={() => handleNavigation('/tenant')}>
                          Empresa
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}
                <Grid item>
                  <Button color="inherit" onClick={handleLogout}>
                    Sair
                  </Button>
                </Grid>
              </Grid>
            </Hidden>
          </>
        )}
      </MuiToolbar>
    </AppBar>
  );
};

export default Toolbar;
