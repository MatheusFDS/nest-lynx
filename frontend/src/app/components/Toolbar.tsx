'use client';

import React from 'react';
import { AppBar, Toolbar as MuiToolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ToolbarProps {
  title: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ title }) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { isLoggedIn, userRole, logout } = useAuth();

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

  return (
    <AppBar position="static">
      <MuiToolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {isLoggedIn && (
          <>
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
              <MenuItem onClick={() => handleNavigation('/statistics')}>Statistics</MenuItem>
              <MenuItem onClick={() => handleNavigation('/categories')}>Categories</MenuItem>
              <MenuItem onClick={() => handleNavigation('/deliveries')}>Deliveries</MenuItem>
              <MenuItem onClick={() => handleNavigation('/directions')}>Directions</MenuItem>
              <MenuItem onClick={() => handleNavigation('/drivers')}>Drivers</MenuItem>
              <MenuItem onClick={() => handleNavigation('/orders')}>Orders</MenuItem>
              <MenuItem onClick={() => handleNavigation('/routing')}>Routing</MenuItem>
              <MenuItem onClick={() => handleNavigation('/payments')}>Payments</MenuItem>
              {userRole === 'admin' && (
                <MenuItem onClick={() => handleNavigation('/users')}>Users</MenuItem>
              )}
              <MenuItem onClick={() => handleNavigation('/vehicles')}>Vehicles</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </MuiToolbar>
    </AppBar>
  );
};

export default Toolbar;
