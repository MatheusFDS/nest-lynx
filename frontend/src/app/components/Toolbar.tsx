'use client';

import React from 'react';
import { AppBar, Toolbar as MuiToolbar, Typography, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface ToolbarProps {
  title: string;
}

const Toolbar = ({ title }: ToolbarProps) => {
  const { logout } = useAuth();

  return (
    <AppBar position="static">
      <MuiToolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Button color="inherit" onClick={() => logout()}>
          Logout
        </Button>
      </MuiToolbar>
    </AppBar>
  );
};

export default Toolbar;
