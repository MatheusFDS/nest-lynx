// src/components/MessageBanner.tsx
import React from 'react';
import { Alert, AlertColor, Box, IconButton, useTheme } from '@mui/material'; // Importe useTheme
import CloseIcon from '@mui/icons-material/Close';

interface MessageBannerProps {
  message: string;
  type: AlertColor;
  onClose?: () => void;
}

const MessageBanner: React.FC<MessageBannerProps> = ({ message, type, onClose }) => {
  const theme = useTheme(); // Acesse o tema

  return (
    <Box
      sx={{
        width: '100%',
        position: 'fixed',
        // Ajuste o 'top' para ser a altura da toolbar.
        // theme.mixins.toolbar geralmente contém a altura padrão (ex: minHeight: 56px, ou 64px em viewports maiores)
        // Adicionamos uma pequena margem (ex: theme.spacing(1)) se desejar um espaço.
        top: theme.mixins.toolbar.minHeight ? 
             `calc(${theme.mixins.toolbar.minHeight}px + ${theme.spacing(1)})` : // Altura da toolbar + um pequeno espaço
             theme.spacing(8), // Fallback para 64px (8 * 8px) caso minHeight não esteja diretamente acessível ou seja 0
        left: 0,
        zIndex: 1300, 
        // Para garantir que o banner não ocupe a largura total se for muito estreito:
        // você pode adicionar 'right: 0' e 'margin: auto' se quiser centralizá-lo
        // ou ajustar o 'width' para algo como 'auto' e usar padding.
        // Exemplo para centralizar e ter uma largura máxima:
        // right: 0,
        // marginLeft: 'auto',
        // marginRight: 'auto',
        // maxWidth: '600px', // Ou a largura que desejar
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
        // Adicionar sx para o Alert para que ele não tenha bordas estranhas se o Box for mais estreito
        // sx={{ width: '100%', justifyContent: 'center' }}
      >
        {message}
      </Alert>
    </Box>
  );
};

export default MessageBanner;