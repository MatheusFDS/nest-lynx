// src/components/MessageBanner.tsx
import React from 'react';
import { Alert, AlertColor, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface MessageBannerProps {
  message: string;
  type: AlertColor; // 'success' | 'error' | 'info' | 'warning'
  onClose?: () => void;
}

const MessageBanner: React.FC<MessageBannerProps> = ({ message, type, onClose }) => {
  return (
    <Box
      sx={{
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1300, // MUI's AppBar zIndex is 1100, ensure it's on top
      }}
    >
      <Alert
        severity={type}
        action={
          onClose ? (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          ) : null
        }
      >
        {message}
      </Alert>
    </Box>
  );
};

export default MessageBanner;
