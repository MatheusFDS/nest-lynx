'use client'
import { useState } from 'react'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  ListSubheader,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  LocalShipping as DeliveryIcon,
  People as DriversIcon,
  DirectionsCar as VehiclesIcon,
  Assignment as OrdersIcon,
  Payment as PaymentsIcon,
  BarChart as StatsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Category as CategoryIcon,
  Map as MapIcon,
  Business as BusinessIcon,
  PersonAdd as UsersIcon,
} from '@mui/icons-material'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import RoleGuard from '../guards/RoleGuard'

const drawerWidth = 280

interface MenuItem {
  text: string
  icon: React.ReactNode
  path: string
  roles?: string[]
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const menuSections: MenuSection[] = [
  {
    title: 'Dashboard',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    ]
  },
  {
    title: 'Cadastros Básicos',
    items: [
      { text: 'Categorias', icon: <CategoryIcon />, path: '/categorias', roles: ['admin'] },
      { text: 'Regiões', icon: <MapIcon />, path: '/regioes', roles: ['admin'] },
      { text: 'Motoristas', icon: <DriversIcon />, path: '/motoristas', roles: ['admin'] },
      { text: 'Veículos', icon: <VehiclesIcon />, path: '/veiculos', roles: ['admin'] },
    ]
  },
  {
    title: 'Operacional',
    items: [
      { text: 'Pedidos', icon: <OrdersIcon />, path: '/pedidos', roles: ['admin', 'user'] },
      { text: 'Entregas', icon: <DeliveryIcon />, path: '/entregas', roles: ['admin', 'user'] },
      { text: 'Pagamentos', icon: <PaymentsIcon />, path: '/pagamentos', roles: ['admin'] },
      { text: 'Estatísticas', icon: <StatsIcon />, path: '/estatisticas', roles: ['admin'] },
    ]
  },
  {
    title: 'Configurações',
    items: [
      { text: 'Usuários', icon: <UsersIcon />, path: '/usuarios', roles: ['admin'] },
      { text: 'Empresa', icon: <BusinessIcon />, path: '/empresa', roles: ['admin'] },
    ]
  },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await logout()
    handleMenuClose()
    router.push('/login')
  }

  const drawer = (
    <div>
      <Toolbar>
        <Box display="flex" alignItems="center" width="100%">
          <DeliveryIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Delivery System
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      
      <List sx={{ px: 1 }}>
        {menuSections.map((section, sectionIndex) => (
          <Box key={section.title}>
            {sectionIndex > 0 && <Divider sx={{ my: 1, mx: 2 }} />}
            
            {section.title !== 'Dashboard' && (
              <ListSubheader 
                component="div" 
                sx={{ 
                  px: 2, 
                  py: 1, 
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  lineHeight: 1.5,
                  backgroundColor: 'transparent',
                }}
              >
                {section.title}
              </ListSubheader>
            )}
            
            {section.items.map((item) => (
              <RoleGuard key={item.text} allowedRoles={item.roles || ['admin', 'user', 'driver']}>
                <ListItem disablePadding sx={{ px: 1 }}>
                  <ListItemButton
                    selected={pathname === item.path}
                    onClick={() => router.push(item.path)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 105, 92, 0.12)',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 105, 92, 0.16)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(0, 105, 92, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: pathname === item.path ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: pathname === item.path ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </RoleGuard>
            ))}
          </Box>
        ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 2px 2px rgba(0, 0, 0, 0.12)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              Sistema de Delivery
            </Typography>
          </Box>
          
          {user && (
            <Box display="flex" alignItems="center" gap={2}>
              <Chip 
                label={user.role} 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ 
                  textTransform: 'capitalize',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              />
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                  {user.email}
                </Typography>
              </Box>
              <IconButton
                size="large"
                edge="end"
                onClick={handleMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'primary.main',
                  fontSize: '1rem',
                  fontWeight: 600
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
          )}
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <AccountIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Meu Perfil"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Sair"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'background.paper',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'background.paper',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}