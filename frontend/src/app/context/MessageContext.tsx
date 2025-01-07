// src/context/MessageContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertColor } from '@mui/material';
import MessageBanner from '../components/MessageBanner';

interface MessageContextProps {
  showMessage: (message: string, type: AlertColor) => void;
}

const MessageContext = createContext<MessageContextProps | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<AlertColor>('success');

  const showMessage = (msg: string, msgType: AlertColor) => {
    setMessage(msg);
    setType(msgType);
  };

  const handleClose = () => {
    setMessage('');
  };

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}
      {message && <MessageBanner message={message} type={type} onClose={handleClose} />}
    </MessageContext.Provider>
  );
};

export const useMessage = (): MessageContextProps => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};
